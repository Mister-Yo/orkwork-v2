// Agent Execution Loop
// Polls for assigned/ready tasks, executes them via Claude API, records results
// Integrates with: scheduler, autonomy, events, costs

import { eq, and, or, sql, desc, isNull, asc } from "drizzle-orm";
import {
  db,
  agents,
  tasks,
  taskExecutions,
  costEntries,
  agentMemory,
  projects,
  chatMessages,
  chatChannels,
  decisions,
  type Task,
  type Agent,
  type NewTaskExecution,
} from "../db";
import { checkPermission } from "./autonomy";
import { autoAssignTask } from "./assigner";
import { emitTaskUpdated, emitTaskCompleted, emitTaskBlocked, emitCostRecorded } from "./events";

// ============================================================
// Configuration
// ============================================================

const EXECUTOR_CONFIG = {
  // How many tasks to process per cycle
  maxTasksPerCycle: 3,
  // Max tokens for Claude API call
  maxTokens: 4096,
  // Model to use
  model: "claude-sonnet-4-20250514",
  // Execution timeout (ms)
  executionTimeoutMs: 120_000, // 2 minutes
  // Cost per 1M input tokens (USD cents)
  inputTokenCostPer1M: 300, // $3.00 per 1M
  // Cost per 1M output tokens (USD cents)
  outputTokenCostPer1M: 1500, // $15.00 per 1M
  // Channel ID for #bugs chat (for posting execution updates)
  bugsChannelId: "a255063c-b283-4496-a1bf-639f43fbf159",
};

// ============================================================
// Claude API Client
// ============================================================

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  id: string;
  content: Array<{ type: "text"; text: string }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason: string;
}

async function callClaudeAPI(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens: number = EXECUTOR_CONFIG.maxTokens
): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: EXECUTOR_CONFIG.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Claude API error ${response.status}: ${errorBody}`
    );
  }

  return (await response.json()) as ClaudeResponse;
}

// ============================================================
// Task Context Builder
// ============================================================

interface TaskContext {
  task: Task;
  project: { id: string; name: string; description: string | null } | null;
  agent: Agent;
  previousExecutions: Array<{
    status: string;
    output: string | null;
    error: string | null;
    completedAt: Date | null;
  }>;
  relatedMemory: Array<{
    memoryType: string;
    content: string;
    relevanceScore: number | null;
  }>;
}

async function buildTaskContext(
  task: Task,
  agent: Agent
): Promise<TaskContext> {
  // Get project info
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.id, task.projectId))
    .limit(1);

  // Get previous executions for this task (for retry context)
  const previousExecutions = await db
    .select({
      status: taskExecutions.status,
      output: taskExecutions.output,
      error: taskExecutions.error,
      completedAt: taskExecutions.completedAt,
    })
    .from(taskExecutions)
    .where(eq(taskExecutions.taskId, task.id))
    .orderBy(desc(taskExecutions.startedAt))
    .limit(3);

  // Get relevant agent memory
  const relatedMemory = await db
    .select({
      memoryType: agentMemory.memoryType,
      content: agentMemory.content,
      relevanceScore: agentMemory.relevanceScore,
    })
    .from(agentMemory)
    .where(
      and(
        eq(agentMemory.agentId, agent.id),
        or(
          isNull(agentMemory.expiresAt),
          sql`${agentMemory.expiresAt} > NOW()`
        )
      )
    )
    .limit(10);

  return {
    task,
    project: project || null,
    agent,
    previousExecutions,
    relatedMemory,
  };
}

function buildSystemPrompt(context: TaskContext): string {
  const { task, project, agent, previousExecutions, relatedMemory } = context;

  let prompt = `You are ${agent.name}, an AI agent working on the orkwork platform.
Your role: ${(agent.config as any)?.role || agent.type || "General purpose agent"}
Your capabilities: ${JSON.stringify(agent.capabilities || [])}
Autonomy level: ${agent.autonomyLevel}

You are executing a task. Provide a clear, actionable result.

## Task Details
- Title: ${task.title}
- Description: ${task.description || "No description provided"}
- Priority: ${task.priority}
- Status: ${task.status}
${task.acceptanceCriteria ? `- Acceptance Criteria: ${task.acceptanceCriteria}` : ""}
${task.estimatedHours ? `- Estimated Hours: ${task.estimatedHours}` : ""}`;

  if (project) {
    prompt += `\n\n## Project
- Name: ${project.name}
- Description: ${project.description || "N/A"}`;
  }

  if (previousExecutions.length > 0) {
    prompt += `\n\n## Previous Attempts (${previousExecutions.length})`;
    for (const exec of previousExecutions) {
      prompt += `\n- Status: ${exec.status}`;
      if (exec.error) prompt += ` | Error: ${exec.error}`;
      if (exec.output)
        prompt += ` | Output: ${exec.output.substring(0, 200)}...`;
    }
    prompt += `\nLearn from previous attempts and try a different approach if they failed.`;
  }

  if (relatedMemory.length > 0) {
    prompt += `\n\n## Your Memory`;
    for (const mem of relatedMemory) {
      prompt += `\n- [${mem.memoryType}] ${mem.content.substring(0, 200)}`;
    }
  }

  prompt += `\n\n## Instructions
1. Analyze the task carefully
2. If the task requires code changes, describe what needs to be changed and provide the code
3. If the task requires research, provide findings with sources
4. If the task requires a decision, provide your recommendation with reasoning
5. Be specific and actionable - your output will be reviewed by a human
6. If you cannot complete the task, explain why and suggest next steps

Respond with a structured result in this format:
## Result
[Your main output here]

## Status
[SUCCESS if task is complete, NEEDS_REVIEW if human review needed, BLOCKED if you cannot proceed]

## Next Steps
[Any follow-up actions needed]`;

  return prompt;
}

// ============================================================
// Cost Calculator
// ============================================================

function calculateCostCents(
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost =
    (inputTokens / 1_000_000) * EXECUTOR_CONFIG.inputTokenCostPer1M;
  const outputCost =
    (outputTokens / 1_000_000) * EXECUTOR_CONFIG.outputTokenCostPer1M;
  return Math.ceil(inputCost + outputCost);
}

// ============================================================
// Single Task Executor
// ============================================================

async function executeTask(
  task: Task,
  agent: Agent
): Promise<{
  success: boolean;
  executionId: string;
  output?: string;
  error?: string;
  tokensUsed?: number;
  costCents?: number;
}> {
  const startTime = Date.now();

  // 1. Create execution record
  const [execution] = await db
    .insert(taskExecutions)
    .values({
      taskId: task.id,
      agentId: agent.id,
      status: "running",
      startedAt: new Date(),
    } as NewTaskExecution)
    .returning();

  // 2. Update task status to in_progress
  await db
    .update(tasks)
    .set({ status: "in_progress", updatedAt: new Date() })
    .where(eq(tasks.id, task.id));

  emitTaskUpdated({ id: task.id, status: "in_progress" });

  try {
    // 3. Build context and system prompt
    const context = await buildTaskContext(task, agent);
    const systemPrompt = buildSystemPrompt(context);

    // 4. Call Claude API
    const claudeResponse = await callClaudeAPI(systemPrompt, [
      {
        role: "user",
        content: `Execute this task: "${task.title}"\n\n${task.description || "No additional details."}`,
      },
    ]);

    const output =
      claudeResponse.content[0]?.text || "No output generated";
    const inputTokens = claudeResponse.usage.input_tokens;
    const outputTokens = claudeResponse.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;
    const costCents = calculateCostCents(inputTokens, outputTokens);
    const durationMs = Date.now() - startTime;

    // 5. Determine status from output
    let executionStatus: "success" | "failed" = "success";
    let taskStatus: string = "review"; // Default to review

    if (output.includes("## Status")) {
      if (output.includes("BLOCKED")) {
        executionStatus = "failed";
        taskStatus = "blocked";
      } else if (output.includes("NEEDS_REVIEW")) {
        taskStatus = "review";
      } else if (output.includes("SUCCESS")) {
        taskStatus = task.reviewRequired ? "review" : "completed";
      }
    }

    // 6. Update execution record
    await db
      .update(taskExecutions)
      .set({
        status: executionStatus,
        output,
        completedAt: new Date(),
        tokensUsed: totalTokens,
        costUsd: costCents,
        durationMs,
      })
      .where(eq(taskExecutions.id, execution.id));

    // 7. Update task status
    await db
      .update(tasks)
      .set({
        status: taskStatus,
        ...(taskStatus === "completed" ? { completedAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, task.id));

    if (taskStatus === "completed") {
      emitTaskCompleted({ id: task.id, status: "completed" });
    } else if (taskStatus === "blocked") {
      emitTaskBlocked({ id: task.id, status: "blocked" });
    } else {
      emitTaskUpdated({ id: task.id, status: taskStatus });
    }

    // 8. Record cost
    await db.insert(costEntries).values({
      agentId: agent.id,
      taskId: task.id,
      costType: "api_tokens",
      amount: costCents,
      tokenCount: totalTokens,
      model: EXECUTOR_CONFIG.model,
      metadata: {
        executionId: execution.id,
        inputTokens,
        outputTokens,
        projectId: task.projectId,
      },
    });

    emitCostRecorded({
      agentId: agent.id,
      amount: costCents,
      taskId: task.id,
    });

    console.log(
      `[AgentExecutor] Task ${task.id} executed successfully. ` +
        `Tokens: ${totalTokens}, Cost: $${(costCents / 100).toFixed(2)}, ` +
        `Duration: ${durationMs}ms, Status: ${taskStatus}`
    );

    return {
      success: true,
      executionId: execution.id,
      output,
      tokensUsed: totalTokens,
      costCents,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error?.message || "Unknown execution error";

    // Update execution as failed
    await db
      .update(taskExecutions)
      .set({
        status: "failed",
        error: errorMessage,
        completedAt: new Date(),
        durationMs,
      })
      .where(eq(taskExecutions.id, execution.id));

    // Handle retry logic
    const newRetryCount = task.retryCount + 1;
    if (newRetryCount < task.maxRetries) {
      await db
        .update(tasks)
        .set({
          status: "ready",
          retryCount: newRetryCount,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, task.id));

      emitTaskUpdated({
        id: task.id,
        status: "ready",
        retryCount: newRetryCount,
      });

      console.log(
        `[AgentExecutor] Task ${task.id} failed (attempt ${newRetryCount}/${task.maxRetries}): ${errorMessage}`
      );
    } else {
      await db
        .update(tasks)
        .set({
          status: "blocked",
          retryCount: newRetryCount,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, task.id));

      emitTaskBlocked({
        id: task.id,
        status: "blocked",
        reason: `Max retries (${task.maxRetries}) exceeded`,
      });

      console.log(
        `[AgentExecutor] Task ${task.id} blocked after ${task.maxRetries} retries: ${errorMessage}`
      );
    }

    return {
      success: false,
      executionId: execution.id,
      error: errorMessage,
    };
  }
}

// ============================================================
// Main Executor Loop (called by scheduler)
// ============================================================

export async function runAgentExecutor(): Promise<void> {
  try {
    console.log("[AgentExecutor] Starting execution cycle...");

    // 1. Check for running executions (prevent duplicates)
    const runningExecs = await db
      .select({ taskId: taskExecutions.taskId })
      .from(taskExecutions)
      .where(eq(taskExecutions.status, "running"));

    const runningTaskIds = new Set(
      runningExecs.map((e) => e.taskId)
    );

    // 2. Find tasks with status ready or assigned
    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(
        or(eq(tasks.status, "ready"), eq(tasks.status, "assigned"))
      )
      .orderBy(asc(tasks.createdAt))
      .limit(EXECUTOR_CONFIG.maxTasksPerCycle);

    if (pendingTasks.length === 0) {
      console.log("[AgentExecutor] No pending tasks found");
      return;
    }

    console.log(
      `[AgentExecutor] Found ${pendingTasks.length} pending tasks`
    );

    // 3. Process each task
    for (const task of pendingTasks) {
      // Skip if already running
      if (runningTaskIds.has(task.id)) {
        console.log(
          `[AgentExecutor] Task ${task.id} already running, skipping`
        );
        continue;
      }

      // 3a. Find or assign the agent for this task
      let agentRecord: Agent | null = null;

      // Check if task has a direct assigneeId that matches an agent
      if (task.assigneeId) {
        const [directAgent] = await db
          .select()
          .from(agents)
          .where(
            and(
              eq(agents.id, task.assigneeId),
              eq(agents.status, "active")
            )
          )
          .limit(1);
        if (directAgent) {
          agentRecord = directAgent;
        }
      }

      // If no agent from assigneeId, check decision records
      if (!agentRecord) {
      const [assignDecision] = await db
        .select()
        .from(decisions)
        .where(
          and(
            eq(decisions.taskId, task.id),
            eq(decisions.decisionType, "task_assign")
          )
        )
        .orderBy(desc(decisions.createdAt))
        .limit(1);

      if (assignDecision) {
        // Extract agent ID from the decision text (format: "Assigned to agent <uuid>")
        const agentIdMatch = assignDecision.decision.match(
          /agent\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
        );
        if (agentIdMatch) {
          const [foundAgent] = await db
            .select()
            .from(agents)
            .where(
              and(
                eq(agents.id, agentIdMatch[1]),
                eq(agents.status, "active")
              )
            )
            .limit(1);
          agentRecord = foundAgent || null;
        }
      }

      } // end agentRecord check from decisions

      // If no agent found via decision, try auto-assign
      if (!agentRecord && task.status === "ready") {
        console.log(
          `[AgentExecutor] Auto-assigning task "${task.title}"...`
        );
        const assignResult = await autoAssignTask(task.id);
        if (assignResult.assigned && assignResult.agentId) {
          const [foundAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, assignResult.agentId))
            .limit(1);
          agentRecord = foundAgent || null;
        }
      }

      // If still no agent, pick the first active agent as fallback
      if (!agentRecord) {
        const [fallbackAgent] = await db
          .select()
          .from(agents)
          .where(eq(agents.status, "active"))
          .limit(1);
        agentRecord = fallbackAgent || null;
      }

      if (!agentRecord) {
        console.log(
          `[AgentExecutor] No active agent available for task "${task.title}"`
        );
        continue;
      }

      // Check autonomy permission
      const permission = await checkPermission(
        agentRecord.id,
        "execute_assigned_task"
      );
      if (!permission.allowed) {
        console.log(
          `[AgentExecutor] Agent ${agentRecord.name} lacks permission: ${permission.reason}`
        );
        continue;
      }

      // Check agent budget
      if (agentRecord.dailyBudgetUsd !== null) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [todaySpent] = await db
          .select({
            total: sql`COALESCE(SUM(${costEntries.amount}), 0)`,
          })
          .from(costEntries)
          .where(
            and(
              eq(costEntries.agentId, agentRecord.id),
              sql`${costEntries.createdAt} >= ${todayStart.toISOString()}`
            )
          );

        const spentCents = Number(todaySpent?.total || 0);
        const budgetCents = agentRecord.dailyBudgetUsd;

        if (spentCents >= budgetCents) {
          console.log(
            `[AgentExecutor] Agent ${agentRecord.name} over daily budget`
          );
          continue;
        }
      }

      // Execute the task
      console.log(
        `[AgentExecutor] Executing task "${task.title}" with agent ${agentRecord.name}`
      );

      const result = await executeTask(task, agentRecord);

      if (result.success) {
        console.log(
          `[AgentExecutor] Task "${task.title}" completed successfully`
        );
      } else {
        console.log(
          `[AgentExecutor] Task "${task.title}" failed: ${result.error}`
        );
      }
    }

    console.log("[AgentExecutor] Execution cycle complete");
  } catch (error) {
    console.error("[AgentExecutor] Execution cycle failed:", error);
    throw error;
  }
}

// ============================================================
// Chat Integration - Post execution updates to chat
// ============================================================

export async function postExecutionUpdate(
  channelId: string,
  agentId: string,
  taskTitle: string,
  status: string,
  summary: string
): Promise<void> {
  try {
    await db.insert(chatMessages).values({
      channelId,
      authorId: agentId,
      authorType: "agent",
      content: `Task "${taskTitle}" - ${status}: ${summary.substring(0, 500)}`,
    });
  } catch (error) {
    console.error("[AgentExecutor] Failed to post chat update:", error);
  }
}

// ============================================================
// Register with Scheduler
// ============================================================

export function registerAgentExecutor(
  scheduler: {
    registerJob: (
      name: string,
      intervalMs: number,
      handler: () => Promise<void>
    ) => void;
  },
  intervalMs: number = 30_000 // Default: every 30 seconds
): void {
  scheduler.registerJob("agent-executor", intervalMs, runAgentExecutor);
  console.log(
    `[AgentExecutor] Registered with scheduler (interval: ${intervalMs}ms)`
  );
}
