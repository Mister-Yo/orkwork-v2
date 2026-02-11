// Simple interval-based job scheduler
// No external dependencies like BullMQ - just using setInterval

import { eq, lt, and, sql } from 'drizzle-orm';
import { db, sessions, agentMemory, agents, costEntries } from '../db';
import { checkSLAs } from './sla';

interface JobDefinition {
  name: string;
  intervalMs: number;
  handler: () => Promise<void>;
  lastRun?: Date;
  isRunning?: boolean;
}

class JobScheduler {
  private jobs: JobDefinition[] = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isStarted = false;

  // Register a new job
  registerJob(name: string, intervalMs: number, handler: () => Promise<void>): void {
    const existingJob = this.jobs.find(job => job.name === name);
    if (existingJob) {
      console.warn(`[Scheduler] Job ${name} already exists, skipping registration`);
      return;
    }

    this.jobs.push({
      name,
      intervalMs,
      handler,
      lastRun: undefined,
      isRunning: false,
    });

    console.log(`[Scheduler] Registered job: ${name} (interval: ${intervalMs}ms)`);

    // If scheduler is already started, start this job immediately
    if (this.isStarted) {
      this.startJob(name);
    }
  }

  // Start a specific job
  private startJob(name: string): void {
    const job = this.jobs.find(j => j.name === name);
    if (!job) {
      console.error(`[Scheduler] Job ${name} not found`);
      return;
    }

    if (this.intervals.has(name)) {
      console.warn(`[Scheduler] Job ${name} already started`);
      return;
    }

    // Run immediately, then set interval
    this.runJob(job);

    const intervalId = setInterval(() => {
      this.runJob(job);
    }, job.intervalMs);

    this.intervals.set(name, intervalId);
    console.log(`[Scheduler] Started job: ${name}`);
  }

  // Run a specific job
  private async runJob(job: JobDefinition): Promise<void> {
    if (job.isRunning) {
      console.warn(`[Scheduler] Job ${job.name} is already running, skipping...`);
      return;
    }

    job.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`[Scheduler] Running job: ${job.name}`);
      await job.handler();
      
      const duration = Date.now() - startTime;
      job.lastRun = new Date();
      
      console.log(`[Scheduler] Job ${job.name} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Scheduler] Job ${job.name} failed after ${duration}ms:`, error);
    } finally {
      job.isRunning = false;
    }
  }

  // Start all jobs
  start(): void {
    if (this.isStarted) {
      console.warn('[Scheduler] Scheduler already started');
      return;
    }

    console.log(`[Scheduler] Starting ${this.jobs.length} jobs...`);

    for (const job of this.jobs) {
      this.startJob(job.name);
    }

    this.isStarted = true;
    console.log('[Scheduler] All jobs started');
  }

  // Stop all jobs
  stop(): void {
    if (!this.isStarted) {
      console.warn('[Scheduler] Scheduler not started');
      return;
    }

    console.log('[Scheduler] Stopping all jobs...');

    for (const [name, intervalId] of this.intervals) {
      clearInterval(intervalId);
      console.log(`[Scheduler] Stopped job: ${name}`);
    }

    this.intervals.clear();
    this.isStarted = false;
    console.log('[Scheduler] All jobs stopped');
  }

  // Get job status
  getStatus(): Array<{ name: string; intervalMs: number; lastRun?: Date; isRunning: boolean }> {
    return this.jobs.map(job => ({
      name: job.name,
      intervalMs: job.intervalMs,
      lastRun: job.lastRun,
      isRunning: job.isRunning || false,
    }));
  }
}

// Singleton scheduler instance
export const scheduler = new JobScheduler();

// Job handlers
async function runSLAChecker(): Promise<void> {
  try {
    console.log('[SLAChecker] Checking for SLA violations...');
    await checkSLAs();
  } catch (error) {
    console.error('[SLAChecker] Error checking SLA violations:', error);
    throw error;
  }
}

async function runAgentHealthChecker(): Promise<void> {
  try {
    console.log('[AgentHealthChecker] Checking agent health...');
    
    // For now, just log active agents
    // In the future, this could check:
    // - Last heartbeat times
    // - Error rates
    // - Performance metrics
    // - Resource usage
    
    const activeAgents = await db
      .select({ id: agents.id, name: agents.name, status: agents.status })
      .from(agents)
      .where(eq(agents.status, 'active'));
    
    console.log(`[AgentHealthChecker] Found ${activeAgents.length} active agents`);
    
    // TODO: Add actual health checks here
    // - Check for agents that haven't reported in too long
    // - Check for agents with high error rates
    // - Check for agents consuming too many resources
    
  } catch (error) {
    console.error('[AgentHealthChecker] Error checking agent health:', error);
    throw error;
  }
}

async function runExpiredSessionCleanup(): Promise<void> {
  try {
    console.log('[SessionCleanup] Cleaning up expired sessions...');
    
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()))
      .returning({ id: sessions.id });
    
    console.log(`[SessionCleanup] Cleaned up ${result.length} expired sessions`);
  } catch (error) {
    console.error('[SessionCleanup] Error cleaning up expired sessions:', error);
    throw error;
  }
}

async function runExpiredMemoryCleanup(): Promise<void> {
  try {
    console.log('[MemoryCleanup] Cleaning up expired memory entries...');
    
    const result = await db
      .delete(agentMemory)
      .where(
        and(
          lt(agentMemory.expiresAt, new Date()),
          // Only delete if expiresAt is not null
          sql`${agentMemory.expiresAt} IS NOT NULL`
        )
      )
      .returning({ id: agentMemory.id });
    
    console.log(`[MemoryCleanup] Cleaned up ${result.length} expired memory entries`);
  } catch (error) {
    console.error('[MemoryCleanup] Error cleaning up expired memory:', error);
    throw error;
  }
}

async function runCostAggregation(): Promise<void> {
  try {
    console.log('[CostAggregation] Running daily cost aggregation...');
    
    // Get yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Aggregate costs by agent for yesterday
    const costsByAgent = await db
      .select({
        agentId: costEntries.agentId,
        totalCost: sql`SUM(${costEntries.amount})`,
        totalTokens: sql`SUM(COALESCE(${costEntries.tokenCount}, 0))`,
        entryCount: sql`COUNT(*)`,
      })
      .from(costEntries)
      .where(
        and(
          sql`${costEntries.createdAt} >= ${yesterday}`,
          sql`${costEntries.createdAt} < ${todayStart}`
        )
      )
      .groupBy(costEntries.agentId);
    
    console.log(`[CostAggregation] Aggregated costs for ${costsByAgent.length} agents`);
    
    // TODO: Store aggregated costs in a daily summary table
    // TODO: Update agent total_spent_usd fields
    // TODO: Send daily cost reports
    
    for (const agentCost of costsByAgent) {
      if (agentCost.agentId) {
        console.log(`[CostAggregation] Agent ${agentCost.agentId}: $${Number(agentCost.totalCost) / 100} (${agentCost.totalTokens} tokens, ${agentCost.entryCount} entries)`);
      }
    }
  } catch (error) {
    console.error('[CostAggregation] Error running cost aggregation:', error);
    throw error;
  }
}

// Initialize default jobs
export function initializeScheduler(): void {
  console.log('[Scheduler] Initializing default jobs...');
  
  // SLA checker: every 5 minutes
  scheduler.registerJob(
    'sla-checker',
    5 * 60 * 1000, // 5 minutes
    runSLAChecker
  );
  
  // Agent health checker: every 5 minutes
  scheduler.registerJob(
    'agent-health-checker',
    5 * 60 * 1000, // 5 minutes
    runAgentHealthChecker
  );
  
  // Expired session cleanup: every hour
  scheduler.registerJob(
    'session-cleanup',
    60 * 60 * 1000, // 1 hour
    runExpiredSessionCleanup
  );
  
  // Expired memory cleanup: every hour
  scheduler.registerJob(
    'memory-cleanup',
    60 * 60 * 1000, // 1 hour
    runExpiredMemoryCleanup
  );
  
  // Cost aggregation: daily (every 24 hours)
  scheduler.registerJob(
    'cost-aggregation',
    24 * 60 * 60 * 1000, // 24 hours
    runCostAggregation
  );
  
  console.log('[Scheduler] Default jobs initialized');
}