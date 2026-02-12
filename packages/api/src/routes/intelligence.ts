import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, agents } from '../db';
import { requireAuth } from '../auth/middleware';
import { requireScope } from '../auth/scopes';
import { calculateAgentScore } from '../engine/performance';
import { generateBrief } from '../engine/brief';
import { generateAIBrief } from '../engine/ai-brief';
import { detectAnomalies } from '../engine/anomalies';
import { projectForecast, costForecast, bottleneckDetection } from '../engine/forecast';

const app = new Hono();

// Validation schemas
const leaderboardSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(10),
});

const projectForecastSchema = z.object({
  project_id: z.string().uuid(),
});

const costForecastSchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(30),
});

// GET /api/v2/intelligence/brief - Generate and return daily brief
app.get('/brief', requireAuth, async (c) => {
  try {
    const brief = await generateAIBrief();
    
    return c.json({
      data: brief,
    });
  } catch (error) {
    console.error('Error generating brief:', error);
    return c.json({ error: 'Failed to generate daily brief' }, 500);
  }
});

// GET /api/v2/intelligence/brief/history - Last N briefs (placeholder)
app.get('/brief/history', requireAuth, async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '10', 10), 30);
    
    // For now, just return a placeholder since we're generating briefs on demand
    // In a production system, you'd store briefs in a table and query them here
    return c.json({
      data: [],
      message: 'Brief history not implemented - briefs are generated on demand',
      pagination: {
        limit,
        total: 0,
        hasNext: false,
        hasPrev: false,
      },
    });
  } catch (error) {
    console.error('Error fetching brief history:', error);
    return c.json({ error: 'Failed to fetch brief history' }, 500);
  }
});

// GET /api/v2/intelligence/anomalies - Current anomalies
app.get('/anomalies', requireAuth, async (c) => {
  try {
    const anomalies = await detectAnomalies();
    
    return c.json({
      data: anomalies,
      summary: {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        warning: anomalies.filter(a => a.severity === 'warning').length,
        info: anomalies.filter(a => a.severity === 'info').length,
      },
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return c.json({ error: 'Failed to detect anomalies' }, 500);
  }
});

// GET /api/v2/intelligence/leaderboard - All agents ranked by performance score
app.get('/leaderboard', requireAuth, async (c) => {
  try {
    const params = {
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10,
    };

    const validatedParams = leaderboardSchema.parse(params);

    // Get all agents
    const allAgents = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.createdAt));

    // Calculate scores for each agent
    const leaderboard = [];
    
    for (const agent of allAgents) {
      try {
        const performanceData = await calculateAgentScore(agent.id);
        leaderboard.push({
          rank: 0, // Will be set after sorting
          agent_id: agent.id,
          agent_name: agent.name,
          agent_type: agent.type,
          agent_status: agent.status,
          overall_score: performanceData.overall_score,
          breakdown: performanceData.breakdown,
          trend: performanceData.trend,
        });
      } catch (error) {
        console.error(`Error calculating score for agent ${agent.id}:`, error);
        // Include agent with zero score if calculation fails
        leaderboard.push({
          rank: 0,
          agent_id: agent.id,
          agent_name: agent.name,
          agent_type: agent.type,
          agent_status: agent.status,
          overall_score: 0,
          breakdown: null,
          trend: { last_7_days: 0, last_30_days: 0 },
        });
      }
    }

    // Sort by score descending and assign ranks
    leaderboard.sort((a, b) => b.overall_score - a.overall_score);
    leaderboard.forEach((agent, index) => {
      agent.rank = index + 1;
    });

    // Apply limit
    const limitedLeaderboard = leaderboard.slice(0, validatedParams.limit);

    return c.json({
      data: limitedLeaderboard,
      summary: {
        total_agents: leaderboard.length,
        average_score: leaderboard.length > 0 ? 
          Math.round((leaderboard.reduce((sum, agent) => sum + agent.overall_score, 0) / leaderboard.length) * 100) / 100 : 0,
        top_score: leaderboard.length > 0 ? leaderboard[0].overall_score : 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error generating leaderboard:', error);
    return c.json({ error: 'Failed to generate leaderboard' }, 500);
  }
});

// GET /api/v2/intelligence/forecast - All forecasts
app.get('/forecast', requireAuth, async (c) => {
  try {
    const params = {
      days: c.req.query('days') ? parseInt(c.req.query('days')!) : 30,
    };

    const validatedParams = costForecastSchema.parse(params);

    // Get cost forecast
    const costForecastData = await costForecast(validatedParams.days);
    
    // Get bottleneck analysis
    const bottlenecks = await bottleneckDetection();

    return c.json({
      data: {
        cost_forecast: costForecastData,
        bottlenecks: bottlenecks,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error generating forecast:', error);
    return c.json({ error: 'Failed to generate forecast' }, 500);
  }
});

// GET /api/v2/intelligence/forecast/projects/:id - Specific project forecast
app.get('/forecast/projects/:id', requireAuth, async (c) => {
  try {
    const projectId = c.req.param('id');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const forecast = await projectForecast(projectId);

    if (!forecast) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({
      data: forecast,
    });
  } catch (error) {
    console.error('Error generating project forecast:', error);
    return c.json({ error: 'Failed to generate project forecast' }, 500);
  }
});

export default app;