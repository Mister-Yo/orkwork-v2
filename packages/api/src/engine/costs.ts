import { eq, sql, gte, lte } from 'drizzle-orm';
import { db, agents, costEntries } from '../db';

export interface BudgetStatus {
  within_budget: boolean;
  daily_spent: number; // USD
  daily_limit: number; // USD  
  remaining: number; // USD
  utilization_percent: number;
}

/**
 * Check if agent is within their daily budget
 */
export async function checkAgentBudget(agentId: string): Promise<BudgetStatus> {
  // Get agent's daily budget
  const [agent] = await db
    .select({
      dailyBudgetUsd: agents.dailyBudgetUsd,
    })
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (!agent || !agent.dailyBudgetUsd) {
    return {
      within_budget: true,
      daily_spent: 0,
      daily_limit: 0,
      remaining: 0,
      utilization_percent: 0,
    };
  }

  const dailyLimitUsd = agent.dailyBudgetUsd / 100; // Convert cents to USD

  // Get today's spending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [spendingResult] = await db
    .select({
      dailySpent: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as('dailySpent'),
    })
    .from(costEntries)
    .where(
      eq(costEntries.agentId, agentId) &&
      gte(costEntries.createdAt, today) &&
      lte(costEntries.createdAt, tomorrow)
    );

  const dailySpentCents = Number(spendingResult.dailySpent || 0);
  const dailySpentUsd = dailySpentCents / 100;
  const remainingUsd = Math.max(0, dailyLimitUsd - dailySpentUsd);
  const utilizationPercent = dailyLimitUsd > 0 ? (dailySpentUsd / dailyLimitUsd) * 100 : 0;

  return {
    within_budget: dailySpentUsd <= dailyLimitUsd,
    daily_spent: Math.round(dailySpentUsd * 100) / 100,
    daily_limit: Math.round(dailyLimitUsd * 100) / 100,
    remaining: Math.round(remainingUsd * 100) / 100,
    utilization_percent: Math.round(utilizationPercent * 100) / 100,
  };
}

/**
 * Update agent's total spent amount
 */
export async function updateAgentSpent(agentId: string, amountUsd: number): Promise<void> {
  const amountCents = Math.round(amountUsd * 100);
  
  await db
    .update(agents)
    .set({
      totalSpentUsd: sql`${agents.totalSpentUsd} + ${amountCents}`,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}