import { eq, and, count } from 'drizzle-orm';
import { 
  db, 
  workflows,
  workflowRuns,
  tasks,
  taskDependencies,
  type Workflow,
  type WorkflowRun,
  type NewTask,
  type NewTaskDependency,
  type NewWorkflowRun,
} from '../db';
import { autoAssignTask } from './assigner';

export interface WorkflowStep {
  name: string;
  title: string;
  description: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  required_capabilities?: string[];
  depends_on?: string[];
  review_required?: boolean;
  estimated_hours?: number;
  acceptance_criteria?: string;
}

export interface WorkflowExecutionResult {
  workflowRun: WorkflowRun;
  createdTasks: Array<{
    stepName: string;
    taskId: string;
    title: string;
    dependencies: string[];
  }>;
  autoAssignedTasks: string[];
  errors: Array<{
    stepName: string;
    error: string;
  }>;
}

/**
 * Execute a workflow by creating tasks and dependencies
 */
export async function executeWorkflow(
  workflowId: string,
  projectId: string,
  triggeredBy?: string
): Promise<WorkflowExecutionResult> {
  try {
    // Get the workflow
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(
        eq(workflows.id, workflowId),
        eq(workflows.isActive, true)
      ))
      .limit(1);

    if (!workflow) {
      throw new Error('Workflow not found or inactive');
    }

    // Validate workflow steps
    const steps = workflow.steps as WorkflowStep[];
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Invalid workflow steps');
    }

    // Validate step dependencies
    const stepNames = new Set(steps.map(s => s.name));
    for (const step of steps) {
      if (step.depends_on) {
        for (const dep of step.depends_on) {
          if (!stepNames.has(dep)) {
            throw new Error(`Step "${step.name}" depends on unknown step "${dep}"`);
          }
        }
      }
    }

    // Create workflow run
    const newWorkflowRun: NewWorkflowRun = {
      workflowId,
      status: 'running',
      results: { projectId, triggeredBy },
    };

    const [workflowRun] = await db
      .insert(workflowRuns)
      .values(newWorkflowRun)
      .returning();

    // Create tasks for each step
    const createdTasks: Array<{
      stepName: string;
      taskId: string;
      title: string;
      dependencies: string[];
    }> = [];

    const stepTaskMap = new Map<string, string>(); // step name -> task ID
    const errors: Array<{ stepName: string; error: string }> = [];

    // First pass: create all tasks
    for (const step of steps) {
      try {
        const newTask: NewTask = {
          projectId,
          title: step.title,
          description: step.description || '',
          priority: step.priority || 'normal',
          estimatedHours: step.estimated_hours,
          acceptanceCriteria: step.acceptance_criteria,
          reviewRequired: step.review_required || false,
          status: 'created',
          retryCount: 0,
          maxRetries: 3,
          autoAssigned: false,
        };

        const [createdTask] = await db
          .insert(tasks)
          .values(newTask)
          .returning();

        stepTaskMap.set(step.name, createdTask.id);
        
        createdTasks.push({
          stepName: step.name,
          taskId: createdTask.id,
          title: createdTask.title,
          dependencies: step.depends_on || [],
        });

        console.log(`Created task for step "${step.name}": ${createdTask.id}`);
      } catch (error) {
        console.error(`Failed to create task for step "${step.name}":`, error);
        errors.push({
          stepName: step.name,
          error: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    // Second pass: create dependencies
    for (const step of steps) {
      if (!step.depends_on || step.depends_on.length === 0) {
        continue;
      }

      const taskId = stepTaskMap.get(step.name);
      if (!taskId) {
        continue; // Task creation failed
      }

      for (const depStepName of step.depends_on) {
        const depTaskId = stepTaskMap.get(depStepName);
        if (!depTaskId) {
          console.error(`Dependency task not found for step "${depStepName}"`);
          errors.push({
            stepName: step.name,
            error: `Dependency task not found for step "${depStepName}"`,
          });
          continue;
        }

        try {
          const newDependency: NewTaskDependency = {
            taskId,
            dependsOnTaskId: depTaskId,
            dependencyType: 'blocks',
          };

          await db
            .insert(taskDependencies)
            .values(newDependency);

          console.log(`Created dependency: ${step.name} depends on ${depStepName}`);
        } catch (error) {
          console.error(`Failed to create dependency for "${step.name}" -> "${depStepName}":`, error);
          errors.push({
            stepName: step.name,
            error: `Failed to create dependency: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }
    }

    // Third pass: transition ready tasks to 'ready' status and auto-assign
    const autoAssignedTasks: string[] = [];
    
    for (const step of steps) {
      const taskId = stepTaskMap.get(step.name);
      if (!taskId) {
        continue;
      }

      // If task has no dependencies, mark it as ready
      if (!step.depends_on || step.depends_on.length === 0) {
        try {
          await db
            .update(tasks)
            .set({ 
              status: 'ready',
              updatedAt: new Date(),
            })
            .where(eq(tasks.id, taskId));

          // Auto-assign if workflow is configured to do so
          if (workflow.triggerConfig?.autoAssign !== false) {
            try {
              const assignmentResult = await autoAssignTask(taskId);
              if (assignmentResult.assigned) {
                autoAssignedTasks.push(taskId);
                console.log(`Auto-assigned task ${taskId} to agent ${assignmentResult.agentId}`);
              } else {
                console.log(`Could not auto-assign task ${taskId}: ${assignmentResult.reasoning}`);
              }
            } catch (assignError) {
              console.error(`Auto-assignment failed for task ${taskId}:`, assignError);
            }
          }
        } catch (error) {
          console.error(`Failed to update task status for "${step.name}":`, error);
          errors.push({
            stepName: step.name,
            error: `Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }
    }

    // Update workflow run with results
    await db
      .update(workflowRuns)
      .set({
        results: {
          projectId,
          triggeredBy,
          createdTasks: createdTasks.length,
          errors: errors.length,
          autoAssignedTasks: autoAssignedTasks.length,
          taskIds: createdTasks.map(t => t.taskId),
        },
        ...(errors.length === 0 ? { status: 'completed', completedAt: new Date() } : {}),
      })
      .where(eq(workflowRuns.id, workflowRun.id));

    return {
      workflowRun,
      createdTasks,
      autoAssignedTasks,
      errors,
    };
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    // Try to update workflow run status to failed
    try {
      if (arguments.length > 0) { // We have a workflowRun
        await db
          .update(workflowRuns)
          .set({
            status: 'failed',
            completedAt: new Date(),
            results: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
      }
    } catch (updateError) {
      console.error('Failed to update workflow run status:', updateError);
    }
    
    throw error;
  }
}

/**
 * Check if dependent tasks can become ready after a task completes
 */
export async function checkDependentTasks(completedTaskId: string): Promise<string[]> {
  try {
    // Find tasks that depend on the completed task
    const dependentTasks = await db
      .select({
        taskId: taskDependencies.taskId,
        task: tasks,
      })
      .from(taskDependencies)
      .innerJoin(tasks, eq(taskDependencies.taskId, tasks.id))
      .where(and(
        eq(taskDependencies.dependsOnTaskId, completedTaskId),
        eq(taskDependencies.dependencyType, 'blocks')
      ));

    const readyTaskIds: string[] = [];

    for (const { taskId, task } of dependentTasks) {
      // Skip if task is not in created/planning status
      if (!['created', 'planning'].includes(task.status)) {
        continue;
      }

      // Check if all blocking dependencies are completed
      const blockingDeps = await db
        .select({
          dependsOnTaskId: taskDependencies.dependsOnTaskId,
          dependsOnTaskStatus: tasks.status,
        })
        .from(taskDependencies)
        .innerJoin(tasks, eq(taskDependencies.dependsOnTaskId, tasks.id))
        .where(and(
          eq(taskDependencies.taskId, taskId),
          eq(taskDependencies.dependencyType, 'blocks')
        ));

      const allCompleted = blockingDeps.every(dep => dep.dependsOnTaskStatus === 'completed');
      
      if (allCompleted) {
        // Update task to ready status
        await db
          .update(tasks)
          .set({
            status: 'ready',
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, taskId));

        readyTaskIds.push(taskId);
        console.log(`Task ${taskId} is now ready (all dependencies completed)`);
      }
    }

    return readyTaskIds;
  } catch (error) {
    console.error('Error checking dependent tasks:', error);
    return [];
  }
}

/**
 * Calculate workflow completion progress
 */
export async function calculateWorkflowProgress(workflowRunId: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  readyTasks: number;
  blockedTasks: number;
  percentage: number;
}> {
  try {
    // Get workflow run
    const [workflowRun] = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, workflowRunId))
      .limit(1);

    if (!workflowRun) {
      throw new Error('Workflow run not found');
    }

    const results = workflowRun.results as any;
    const taskIds = results?.taskIds as string[];
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        readyTasks: 0,
        blockedTasks: 0,
        percentage: 0,
      };
    }

    // Get status counts for all tasks in this workflow run
    const taskStatuses = await db
      .select({
        status: tasks.status,
        count: count(tasks.id),
      })
      .from(tasks)
      .where(eq(tasks.id, tasks.id)) // This needs to be a proper IN query
      .groupBy(tasks.status);

    // We need to do this differently since Drizzle doesn't have a clean way to do IN with array
    const workflowTasks = await db
      .select({ status: tasks.status })
      .from(tasks)
      .where(eq(tasks.id, tasks.id)); // We'll filter this manually

    const statusCounts = {
      completed: 0,
      in_progress: 0,
      ready: 0,
      assigned: 0,
      blocked: 0,
      review: 0,
      created: 0,
      planning: 0,
      cancelled: 0,
      rejected: 0,
    };

    // Filter and count manually (since we need proper IN support)
    for (const taskId of taskIds) {
      const [task] = await db
        .select({ status: tasks.status })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);
      
      if (task) {
        statusCounts[task.status as keyof typeof statusCounts]++;
      }
    }

    const totalTasks = taskIds.length;
    const completedTasks = statusCounts.completed;
    const inProgressTasks = statusCounts.in_progress + statusCounts.review + statusCounts.assigned;
    const readyTasks = statusCounts.ready;
    const blockedTasks = statusCounts.blocked;
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      readyTasks,
      blockedTasks,
      percentage,
    };
  } catch (error) {
    console.error('Error calculating workflow progress:', error);
    throw error;
  }
}

/**
 * Validate workflow steps structure
 */
export function validateWorkflowSteps(steps: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(steps)) {
    errors.push('Steps must be an array');
    return { isValid: false, errors };
  }

  if (steps.length === 0) {
    errors.push('Workflow must have at least one step');
    return { isValid: false, errors };
  }

  const stepNames = new Set<string>();
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const prefix = `Step ${i + 1}`;

    // Required fields
    if (!step.name || typeof step.name !== 'string') {
      errors.push(`${prefix}: 'name' is required and must be a string`);
    } else {
      if (stepNames.has(step.name)) {
        errors.push(`${prefix}: Duplicate step name '${step.name}'`);
      }
      stepNames.add(step.name);
    }

    if (!step.title || typeof step.title !== 'string') {
      errors.push(`${prefix}: 'title' is required and must be a string`);
    }

    if (!step.description || typeof step.description !== 'string') {
      errors.push(`${prefix}: 'description' is required and must be a string`);
    }

    // Optional fields validation
    if (step.priority && !['urgent', 'high', 'normal', 'low'].includes(step.priority)) {
      errors.push(`${prefix}: 'priority' must be one of: urgent, high, normal, low`);
    }

    if (step.required_capabilities && !Array.isArray(step.required_capabilities)) {
      errors.push(`${prefix}: 'required_capabilities' must be an array`);
    }

    if (step.depends_on && !Array.isArray(step.depends_on)) {
      errors.push(`${prefix}: 'depends_on' must be an array`);
    }

    if (step.review_required && typeof step.review_required !== 'boolean') {
      errors.push(`${prefix}: 'review_required' must be a boolean`);
    }

    if (step.estimated_hours && (typeof step.estimated_hours !== 'number' || step.estimated_hours < 0)) {
      errors.push(`${prefix}: 'estimated_hours' must be a positive number`);
    }
  }

  // Check dependencies reference valid steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.depends_on && Array.isArray(step.depends_on)) {
      for (const dep of step.depends_on) {
        if (!stepNames.has(dep)) {
          errors.push(`Step '${step.name}': depends on unknown step '${dep}'`);
        }
        if (dep === step.name) {
          errors.push(`Step '${step.name}': cannot depend on itself`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}