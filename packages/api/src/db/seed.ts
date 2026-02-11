import { db, sql } from './index';
import { 
  users, agents, projects, tasks, taskDependencies, 
  type NewUser, type NewAgent, type NewProject, type NewTask, type NewTaskDependency 
} from './schema';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create a sample user first (CTO)
    console.log('👤 Creating CTO user...');
    const [ctoUser] = await db.insert(users).values({
      githubId: 999999,
      username: 'mister-boss',
      displayName: 'Mister Boss',
      email: 'mister@orkwork.ai',
      role: 'owner',
      avatarUrl: 'https://avatars.githubusercontent.com/u/999999?v=4',
    }).returning();

    console.log(`✅ Created CTO user: ${ctoUser.displayName} (${ctoUser.id})`);

    // Create 5 agents with different roles and autonomy levels
    console.log('🤖 Creating agents...');
    
    const agentData: NewAgent[] = [
      {
        name: 'CLAUDE',
        type: 'specialist',
        model: 'claude-3-sonnet',
        systemPrompt: 'You are CLAUDE, a backend development specialist. You excel at API design, database optimization, and server-side logic. You write clean, efficient code and prioritize security and scalability.',
        capabilities: ['backend_development', 'api_design', 'database_design', 'code_review', 'testing'],
        autonomyLevel: 'supervised',
        maxConcurrentTasks: 3,
        dailyBudgetUsd: 5000, // $50.00 in cents
        config: {
          model_temperature: 0.1,
          max_tokens: 4000,
          specialization: 'backend',
        },
      },
      {
        name: 'CODE',
        type: 'specialist', 
        model: 'claude-3-haiku',
        systemPrompt: 'You are CODE, a frontend development specialist. You create beautiful, responsive user interfaces with React, TypeScript, and modern CSS. You focus on user experience and accessibility.',
        capabilities: ['frontend_development', 'ui_design', 'react', 'typescript', 'css', 'testing'],
        autonomyLevel: 'supervised',
        maxConcurrentTasks: 2,
        dailyBudgetUsd: 3000, // $30.00 in cents
        config: {
          model_temperature: 0.2,
          max_tokens: 3000,
          specialization: 'frontend',
        },
      },
      {
        name: 'QA',
        type: 'specialist',
        model: 'claude-3-haiku',
        systemPrompt: 'You are QA, a quality assurance and testing specialist. You design comprehensive test suites, perform code reviews, and ensure software quality. You catch bugs before they reach production.',
        capabilities: ['testing', 'qa', 'code_review', 'automation', 'bug_tracking'],
        autonomyLevel: 'assistant',
        maxConcurrentTasks: 4,
        dailyBudgetUsd: 2000, // $20.00 in cents
        config: {
          model_temperature: 0.0,
          max_tokens: 2000,
          specialization: 'testing',
        },
      },
      {
        name: 'PM',
        type: 'manager',
        model: 'claude-3-sonnet',
        systemPrompt: 'You are PM, a project manager. You coordinate team efforts, manage timelines, facilitate communication, and ensure project delivery. You break down complex projects into manageable tasks.',
        capabilities: ['project_management', 'planning', 'communication', 'coordination', 'reporting'],
        autonomyLevel: 'autonomous',
        maxConcurrentTasks: 10,
        dailyBudgetUsd: 4000, // $40.00 in cents
        config: {
          model_temperature: 0.3,
          max_tokens: 3500,
          specialization: 'management',
        },
      },
      {
        name: 'RESEARCH',
        type: 'researcher',
        model: 'claude-3-opus',
        systemPrompt: 'You are RESEARCH, a research and analysis specialist. You investigate technologies, analyze requirements, research best practices, and provide technical recommendations. You think strategically about architecture and design.',
        capabilities: ['research', 'analysis', 'architecture', 'documentation', 'planning'],
        autonomyLevel: 'strategic',
        maxConcurrentTasks: 2,
        dailyBudgetUsd: 8000, // $80.00 in cents
        config: {
          model_temperature: 0.4,
          max_tokens: 8000,
          specialization: 'research',
        },
      },
    ];

    const createdAgents = await db.insert(agents).values(agentData).returning();
    console.log(`✅ Created ${createdAgents.length} agents`);

    // Create orkwork v2 project
    console.log('📋 Creating orkwork v2 project...');
    
    const [orkworkProject] = await db.insert(projects).values({
      name: 'orkwork v2',
      description: 'Next-generation AI-powered work orchestration platform. Complete rebuild with enhanced agent capabilities, real-time collaboration, and advanced project management features.',
      status: 'active',
      priority: 'urgent',
      budgetUsd: 1000000, // $10,000 in cents
      spentUsd: 0,
      deadline: new Date('2024-06-01T00:00:00Z'),
      healthScore: 85,
      riskLevel: 'medium',
    }).returning();

    console.log(`✅ Created project: ${orkworkProject.name} (${orkworkProject.id})`);

    // Create sample tasks across different statuses
    console.log('📝 Creating sample tasks...');
    
    const taskData: NewTask[] = [
      {
        projectId: orkworkProject.id,
        title: 'Database Schema Design - Phase 1a',
        description: 'Design and implement extended database schema with new tables for agent memory, task dependencies, workflows, notifications, decisions, audit logging, and chat functionality.',
        status: 'completed',
        priority: 'urgent',
        estimatedHours: 8,
        actualHours: 6,
        acceptanceCriteria: 'Schema includes all new tables with proper relationships, indexes, and migrations. All existing functionality remains intact.',
        reviewRequired: true,
        completedAt: new Date(),
      },
      {
        projectId: orkworkProject.id,
        title: 'API Routes - Projects & Tasks CRUD',
        description: 'Implement full CRUD operations for projects and tasks with proper validation, authentication, and error handling.',
        status: 'in_progress',
        priority: 'high',
        estimatedHours: 12,
        actualHours: 8,
        acceptanceCriteria: 'All CRUD operations work, proper HTTP status codes, comprehensive validation, role-based access control.',
        reviewRequired: true,
      },
      {
        projectId: orkworkProject.id,
        title: 'Task Dependency Management',
        description: 'Implement task dependency system with cycle detection, blocking logic, and visual representation for DAG visualization.',
        status: 'ready',
        priority: 'high',
        estimatedHours: 10,
        acceptanceCriteria: 'Can create/remove dependencies, prevent circular deps, block task transitions based on dependencies.',
      },
      {
        projectId: orkworkProject.id,
        title: 'Audit Logging System',
        description: 'Implement comprehensive audit logging for all API operations with automatic middleware and manual logging capabilities.',
        status: 'assigned',
        priority: 'normal',
        estimatedHours: 6,
        assigneeId: ctoUser.id,
        acceptanceCriteria: 'All API operations logged, queryable audit trail, privacy-compliant data capture.',
      },
      {
        projectId: orkworkProject.id,
        title: 'Frontend Task Board',
        description: 'Build responsive Kanban-style task board with drag-drop functionality, filtering, and real-time updates.',
        status: 'planning',
        priority: 'normal',
        estimatedHours: 16,
        acceptanceCriteria: 'Drag-drop works, real-time updates, mobile responsive, accessibility compliant.',
        reviewRequired: true,
      },
      {
        projectId: orkworkProject.id,
        title: 'Agent Memory System',
        description: 'Implement agent memory storage and retrieval system with vector embeddings for semantic search.',
        status: 'created',
        priority: 'low',
        estimatedHours: 14,
        acceptanceCriteria: 'Agents can store/retrieve memories, semantic search works, memory expiration supported.',
      },
      {
        projectId: orkworkProject.id,
        title: 'Workflow Engine',
        description: 'Build workflow execution engine with support for manual, scheduled, and event-driven triggers.',
        status: 'created',
        priority: 'normal',
        estimatedHours: 20,
        acceptanceCriteria: 'Workflows execute reliably, all trigger types work, error handling and retries.',
      },
      {
        projectId: orkworkProject.id,
        title: 'Notification System',
        description: 'Multi-channel notification system supporting web, email, Telegram, and Slack with priority handling.',
        status: 'blocked',
        priority: 'normal',
        estimatedHours: 12,
        acceptanceCriteria: 'All channels work, priority queuing, delivery confirmation, failure handling.',
      },
      {
        projectId: orkworkProject.id,
        title: 'Integration Testing Suite',
        description: 'Comprehensive integration tests covering all API endpoints and user workflows.',
        status: 'review',
        priority: 'high',
        estimatedHours: 15,
        acceptanceCriteria: 'High test coverage, all critical paths tested, automated CI/CD integration.',
        reviewRequired: true,
      },
      {
        projectId: orkworkProject.id,
        title: 'Performance Optimization',
        description: 'Database query optimization, API response time improvements, and caching strategy implementation.',
        status: 'cancelled',
        priority: 'low',
        estimatedHours: 10,
        acceptanceCriteria: 'API response times < 200ms, efficient database queries, effective caching.',
      },
    ];

    const createdTasks = await db.insert(tasks).values(taskData).returning();
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Create some task dependencies
    console.log('🔗 Creating task dependencies...');
    
    const dependencyData: NewTaskDependency[] = [
      {
        taskId: createdTasks[1].id, // API Routes task
        dependsOnTaskId: createdTasks[0].id, // depends on Database Schema
        dependencyType: 'blocks',
      },
      {
        taskId: createdTasks[2].id, // Task Dependencies 
        dependsOnTaskId: createdTasks[1].id, // depends on API Routes
        dependencyType: 'blocks',
      },
      {
        taskId: createdTasks[4].id, // Frontend Task Board
        dependsOnTaskId: createdTasks[1].id, // depends on API Routes
        dependencyType: 'blocks',
      },
      {
        taskId: createdTasks[7].id, // Notification System
        dependsOnTaskId: createdTasks[5].id, // soft dependency on Agent Memory
        dependencyType: 'soft',
      },
      {
        taskId: createdTasks[8].id, // Integration Testing
        dependsOnTaskId: createdTasks[1].id, // depends on API Routes
        dependencyType: 'blocks',
      },
    ];

    await db.insert(taskDependencies).values(dependencyData);
    console.log(`✅ Created ${dependencyData.length} task dependencies`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`\n📊 Summary:
    - 1 CTO user created
    - ${createdAgents.length} agents created with different specializations
    - 1 orkwork v2 project created
    - ${createdTasks.length} sample tasks across various statuses
    - ${dependencyData.length} task dependencies for realistic workflow`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

if (import.meta.main) {
  seedDatabase();
}

export { seedDatabase };