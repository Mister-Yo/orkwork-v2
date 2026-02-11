import { eq, and, gte } from 'drizzle-orm';
import { db, agentCapabilities, agents, type Agent } from '../db';

/**
 * Update agent proficiency after task completion
 * @param agentId - The agent's ID
 * @param capability - The capability being updated
 * @param taskOutcome - 'success' or 'failed'
 */
export async function updateProficiency(
  agentId: string,
  capability: string,
  taskOutcome: 'success' | 'failed'
): Promise<void> {
  try {
    // Find the agent's capability record
    const [existingCapability] = await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.capability, capability),
          eq(agentCapabilities.enabled, true)
        )
      )
      .limit(1);

    if (!existingCapability) {
      // If capability doesn't exist, create it with initial proficiency based on outcome
      const initialProficiency = taskOutcome === 'success' ? 55 : 40;
      
      await db.insert(agentCapabilities).values({
        agentId,
        capability,
        proficiency: initialProficiency,
        enabled: true,
      });
      
      return;
    }

    // Calculate new proficiency based on outcome
    let newProficiency = existingCapability.proficiency;
    
    if (taskOutcome === 'success') {
      // Success: +5 points (max 100)
      newProficiency = Math.min(100, newProficiency + 5);
    } else {
      // Failure: -10 points (min 0)
      newProficiency = Math.max(0, newProficiency - 10);
    }

    // Update the proficiency
    await db
      .update(agentCapabilities)
      .set({ proficiency: newProficiency })
      .where(eq(agentCapabilities.id, existingCapability.id));
      
    console.log(
      `Updated proficiency for agent ${agentId}, capability "${capability}": ` +
      `${existingCapability.proficiency} -> ${newProficiency} (${taskOutcome})`
    );
  } catch (error) {
    console.error('Error updating agent proficiency:', error);
    throw error;
  }
}

/**
 * Find agents with a specific capability
 * @param capability - The capability to search for
 * @param minProficiency - Minimum proficiency level (0-100)
 * @returns Array of agents with their proficiency levels
 */
export async function findAgentsByCapability(
  capability: string,
  minProficiency: number = 0
): Promise<Array<Agent & { proficiency: number; capability_id: string }>> {
  try {
    const agentsWithCapability = await db
      .select({
        // Agent fields
        id: agents.id,
        name: agents.name,
        type: agents.type,
        model: agents.model,
        systemPrompt: agents.systemPrompt,
        capabilities: agents.capabilities,
        status: agents.status,
        config: agents.config,
        dailyBudgetUsd: agents.dailyBudgetUsd,
        totalSpentUsd: agents.totalSpentUsd,
        autonomyLevel: agents.autonomyLevel,
        maxConcurrentTasks: agents.maxConcurrentTasks,
        slaRuleId: agents.slaRuleId,
        createdAt: agents.createdAt,
        updatedAt: agents.updatedAt,
        // Capability fields
        proficiency: agentCapabilities.proficiency,
        capability_id: agentCapabilities.id,
      })
      .from(agentCapabilities)
      .innerJoin(agents, eq(agentCapabilities.agentId, agents.id))
      .where(
        and(
          eq(agentCapabilities.capability, capability),
          eq(agentCapabilities.enabled, true),
          eq(agents.status, 'active'), // Only return active agents
          gte(agentCapabilities.proficiency, minProficiency)
        )
      )
      .orderBy(agentCapabilities.proficiency); // Highest proficiency first

    return agentsWithCapability;
  } catch (error) {
    console.error('Error finding agents by capability:', error);
    throw error;
  }
}

/**
 * Get all capabilities for an agent
 * @param agentId - The agent's ID
 * @returns Array of agent capabilities
 */
export async function getAgentCapabilities(agentId: string) {
  try {
    return await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.enabled, true)
        )
      )
      .orderBy(agentCapabilities.proficiency);
  } catch (error) {
    console.error('Error getting agent capabilities:', error);
    throw error;
  }
}

/**
 * Check if an agent has a specific capability with minimum proficiency
 * @param agentId - The agent's ID
 * @param capability - The capability to check
 * @param minProficiency - Minimum required proficiency (default: 50)
 * @returns Boolean indicating if agent has the capability
 */
export async function agentHasCapability(
  agentId: string,
  capability: string,
  minProficiency: number = 50
): Promise<boolean> {
  try {
    const [capabilityRecord] = await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.capability, capability),
          eq(agentCapabilities.enabled, true),
          gte(agentCapabilities.proficiency, minProficiency)
        )
      )
      .limit(1);

    return !!capabilityRecord;
  } catch (error) {
    console.error('Error checking agent capability:', error);
    return false;
  }
}

/**
 * Get proficiency level for a specific capability
 * @param agentId - The agent's ID
 * @param capability - The capability to check
 * @returns Proficiency level (0-100) or null if not found
 */
export async function getCapabilityProficiency(
  agentId: string,
  capability: string
): Promise<number | null> {
  try {
    const [capabilityRecord] = await db
      .select({ proficiency: agentCapabilities.proficiency })
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.capability, capability),
          eq(agentCapabilities.enabled, true)
        )
      )
      .limit(1);

    return capabilityRecord?.proficiency ?? null;
  } catch (error) {
    console.error('Error getting capability proficiency:', error);
    return null;
  }
}

/**
 * Recommend agents for a set of required capabilities
 * @param requiredCapabilities - Array of capability names with optional minimum proficiency
 * @returns Ranked list of agents that match the requirements
 */
export async function recommendAgentsForCapabilities(
  requiredCapabilities: Array<{ capability: string; minProficiency?: number }>
): Promise<Array<{
  agent: Agent;
  matchedCapabilities: number;
  averageProficiency: number;
  capabilities: Array<{ capability: string; proficiency: number }>;
}>> {
  try {
    const recommendations = new Map<string, {
      agent: Agent;
      capabilities: Array<{ capability: string; proficiency: number }>;
    }>();

    // For each required capability, find agents that have it
    for (const req of requiredCapabilities) {
      const agentsWithCapability = await findAgentsByCapability(
        req.capability,
        req.minProficiency || 0
      );

      for (const agent of agentsWithCapability) {
        const agentId = agent.id;
        
        if (!recommendations.has(agentId)) {
          // Remove capability-specific fields to get clean Agent object
          const { proficiency, capability_id, ...cleanAgent } = agent;
          recommendations.set(agentId, {
            agent: cleanAgent,
            capabilities: [],
          });
        }

        recommendations.get(agentId)!.capabilities.push({
          capability: req.capability,
          proficiency: agent.proficiency,
        });
      }
    }

    // Calculate scores and return sorted list
    const results = Array.from(recommendations.values()).map(rec => {
      const matchedCapabilities = rec.capabilities.length;
      const averageProficiency = rec.capabilities.reduce(
        (sum, cap) => sum + cap.proficiency, 0
      ) / matchedCapabilities;

      return {
        agent: rec.agent,
        matchedCapabilities,
        averageProficiency,
        capabilities: rec.capabilities,
      };
    });

    // Sort by number of matched capabilities (desc), then by average proficiency (desc)
    return results.sort((a, b) => {
      if (a.matchedCapabilities !== b.matchedCapabilities) {
        return b.matchedCapabilities - a.matchedCapabilities;
      }
      return b.averageProficiency - a.averageProficiency;
    });
  } catch (error) {
    console.error('Error recommending agents for capabilities:', error);
    throw error;
  }
}