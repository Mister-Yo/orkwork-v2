import { Hono } from 'hono';
import { eq, desc, sql, count } from 'drizzle-orm';
import { z } from 'zod';
import { 
  db, 
  slaRules,
  type SlaRule,
  type NewSlaRule,
} from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { checkSLAs, getCurrentSlaViolations } from '../engine/sla';
import { logAuditEntry } from '../middleware/audit';

const app = new Hono();

// Validation schemas
const createSlaRuleSchema = z.object({
  name: z.string().min(1).max(255),
  targetType: z.enum(['all_tasks', 'priority', 'project', 'status']),
  targetValue: z.string().min(1).max(255),
  maxResponseMinutes: z.number().int().min(1).max(43200), // max 30 days
  maxResolutionMinutes: z.number().int().min(1).max(43200), // max 30 days
  escalationChain: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

const updateSlaRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  targetType: z.enum(['all_tasks', 'priority', 'project', 'status']).optional(),
  targetValue: z.string().min(1).max(255).optional(),
  maxResponseMinutes: z.number().int().min(1).max(43200).optional(),
  maxResolutionMinutes: z.number().int().min(1).max(43200).optional(),
  escalationChain: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v2/sla - List SLA rules
app.get('/', requireAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const isActive = c.req.query('is_active');
    const targetType = c.req.query('target_type');

    // Build query conditions
    const conditions = [];
    if (isActive !== undefined) {
      conditions.push(eq(slaRules.isActive, isActive === 'true'));
    }
    if (targetType) {
      conditions.push(eq(slaRules.targetType, targetType));
    }

    // Get SLA rules
    const [rules, totalResult] = await Promise.all([
      db
        .select()
        .from(slaRules)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(desc(slaRules.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(slaRules)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      data: {
        rules,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching SLA rules:', error);
    return c.json({ error: 'Failed to fetch SLA rules' }, 500);
  }
});

// POST /api/v2/sla - Create SLA rule (admin+)
app.post('/', requireRole('admin'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createSlaRuleSchema.parse(body);

    // Validate escalation chain structure
    const escalationValidation = validateEscalationChain(validatedData.escalationChain);
    if (!escalationValidation.isValid) {
      return c.json({
        error: 'Invalid escalation chain',
        issues: escalationValidation.errors,
      }, 400);
    }

    // Check for duplicate names
    const [existingRule] = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.name, validatedData.name))
      .limit(1);

    if (existingRule) {
      return c.json({ 
        error: 'SLA rule with this name already exists',
        name: validatedData.name,
      }, 409);
    }

    // Create SLA rule
    const newSlaRule: NewSlaRule = validatedData;
    const [createdRule] = await db
      .insert(slaRules)
      .values(newSlaRule)
      .returning();

    // Log the creation
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'create',
      resourceType: 'sla_rule',
      resourceId: createdRule.id,
      details: {
        name: createdRule.name,
        targetType: createdRule.targetType,
        targetValue: createdRule.targetValue,
        maxResponseMinutes: createdRule.maxResponseMinutes,
        maxResolutionMinutes: createdRule.maxResolutionMinutes,
      },
    });

    return c.json({ data: createdRule }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error creating SLA rule:', error);
    return c.json({ error: 'Failed to create SLA rule' }, 500);
  }
});

// GET /api/v2/sla/:id - Get specific SLA rule
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'SLA rule ID is required' }, 400);
    }

    const [rule] = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.id, id))
      .limit(1);

    if (!rule) {
      return c.json({ error: 'SLA rule not found' }, 404);
    }

    return c.json({ data: rule });
  } catch (error) {
    console.error('Error fetching SLA rule:', error);
    return c.json({ error: 'Failed to fetch SLA rule' }, 500);
  }
});

// PATCH /api/v2/sla/:id - Update SLA rule (admin+)
app.patch('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!id) {
      return c.json({ error: 'SLA rule ID is required' }, 400);
    }

    const validatedData = updateSlaRuleSchema.parse(body);

    // Check if rule exists
    const [existingRule] = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.id, id))
      .limit(1);

    if (!existingRule) {
      return c.json({ error: 'SLA rule not found' }, 404);
    }

    // Validate escalation chain if provided
    if (validatedData.escalationChain) {
      const escalationValidation = validateEscalationChain(validatedData.escalationChain);
      if (!escalationValidation.isValid) {
        return c.json({
          error: 'Invalid escalation chain',
          issues: escalationValidation.errors,
        }, 400);
      }
    }

    // Check for duplicate names if name is being changed
    if (validatedData.name && validatedData.name !== existingRule.name) {
      const [duplicateRule] = await db
        .select()
        .from(slaRules)
        .where(eq(slaRules.name, validatedData.name))
        .limit(1);

      if (duplicateRule) {
        return c.json({ 
          error: 'SLA rule with this name already exists',
          name: validatedData.name,
        }, 409);
      }
    }

    // Update SLA rule
    const [updatedRule] = await db
      .update(slaRules)
      .set(validatedData)
      .where(eq(slaRules.id, id))
      .returning();

    // Log the update
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'update',
      resourceType: 'sla_rule',
      resourceId: id,
      details: {
        updatedFields: Object.keys(validatedData),
      },
    });

    return c.json({ data: updatedRule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating SLA rule:', error);
    return c.json({ error: 'Failed to update SLA rule' }, 500);
  }
});

// DELETE /api/v2/sla/:id - Deactivate SLA rule (admin+)
app.delete('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'SLA rule ID is required' }, 400);
    }

    // Check if rule exists
    const [existingRule] = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.id, id))
      .limit(1);

    if (!existingRule) {
      return c.json({ error: 'SLA rule not found' }, 404);
    }

    // Soft delete by setting isActive to false
    const [deactivatedRule] = await db
      .update(slaRules)
      .set({ isActive: false })
      .where(eq(slaRules.id, id))
      .returning();

    // Log the deactivation
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'deactivate',
      resourceType: 'sla_rule',
      resourceId: id,
      details: {
        name: existingRule.name,
      },
    });

    return c.json({ 
      data: deactivatedRule,
      message: 'SLA rule deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deactivating SLA rule:', error);
    return c.json({ error: 'Failed to deactivate SLA rule' }, 500);
  }
});

// GET /api/v2/sla/violations - Get current SLA violations
app.get('/violations', requireAuth, async (c) => {
  try {
    const violations = await getCurrentSlaViolations();

    // Format violations for API response
    const formattedViolations = violations.map(violation => ({
      taskId: violation.taskId,
      task: {
        id: violation.task.id,
        title: violation.task.title,
        status: violation.task.status,
        priority: violation.task.priority,
        createdAt: violation.task.createdAt,
        projectId: violation.task.projectId,
      },
      slaRule: {
        id: violation.slaRule.id,
        name: violation.slaRule.name,
        targetType: violation.slaRule.targetType,
        targetValue: violation.slaRule.targetValue,
      },
      violationType: violation.violationType,
      expectedMinutes: violation.expectedMinutes,
      actualMinutes: violation.actualMinutes,
      overdueBy: violation.overdueLy,
      severity: getViolationSeverity(violation.overdueLy),
    }));

    return c.json({ 
      data: {
        violations: formattedViolations,
        summary: {
          total: violations.length,
          byType: {
            response: violations.filter(v => v.violationType === 'response').length,
            resolution: violations.filter(v => v.violationType === 'resolution').length,
          },
          bySeverity: {
            low: formattedViolations.filter(v => v.severity === 'low').length,
            medium: formattedViolations.filter(v => v.severity === 'medium').length,
            high: formattedViolations.filter(v => v.severity === 'high').length,
            critical: formattedViolations.filter(v => v.severity === 'critical').length,
          },
        },
      }
    });
  } catch (error) {
    console.error('Error fetching SLA violations:', error);
    return c.json({ error: 'Failed to fetch SLA violations' }, 500);
  }
});

// POST /api/v2/sla/check - Manually trigger SLA check (admin+)
app.post('/check', requireRole('admin'), async (c) => {
  try {
    const result = await checkSLAs();

    // Log the manual SLA check
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'manual_sla_check',
      resourceType: 'sla_system',
      resourceId: '00000000-0000-0000-0000-000000000000',
      details: {
        totalTasks: result.totalTasks,
        violations: result.violations.length,
        notificationsCreated: result.notificationsCreated,
      },
    });

    return c.json({ 
      data: {
        totalTasks: result.totalTasks,
        violationsFound: result.violations.length,
        notificationsCreated: result.notificationsCreated,
        summary: {
          byType: {
            response: result.violations.filter(v => v.violationType === 'response').length,
            resolution: result.violations.filter(v => v.violationType === 'resolution').length,
          },
        },
      }
    });
  } catch (error) {
    console.error('Error running manual SLA check:', error);
    return c.json({ error: 'Failed to run SLA check' }, 500);
  }
});

/**
 * Validate escalation chain structure
 */
function validateEscalationChain(escalationChain: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof escalationChain !== 'object' || escalationChain === null) {
    errors.push('Escalation chain must be an object');
    return { isValid: false, errors };
  }

  // Validate escalation levels
  const validLevels = ['level1', 'level2', 'level3'];
  
  for (const [key, value] of Object.entries(escalationChain)) {
    if (!validLevels.includes(key)) {
      errors.push(`Invalid escalation level: ${key}. Valid levels: ${validLevels.join(', ')}`);
      continue;
    }

    // Validate level structure
    if (typeof value === 'string') {
      // Simple user ID
      if (!value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        errors.push(`${key}: Invalid UUID format`);
      }
    } else if (Array.isArray(value)) {
      // Array of recipients
      for (let i = 0; i < value.length; i++) {
        const recipient = value[i];
        if (typeof recipient === 'string') {
          if (!recipient.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            errors.push(`${key}[${i}]: Invalid UUID format`);
          }
        } else if (typeof recipient === 'object') {
          if (!recipient.type || !['user', 'agent'].includes(recipient.type)) {
            errors.push(`${key}[${i}]: type must be 'user' or 'agent'`);
          }
          if (!recipient.id || typeof recipient.id !== 'string') {
            errors.push(`${key}[${i}]: id is required and must be a string`);
          }
          if (recipient.channel && !['web', 'email', 'telegram', 'slack'].includes(recipient.channel)) {
            errors.push(`${key}[${i}]: invalid channel`);
          }
        } else {
          errors.push(`${key}[${i}]: must be string or object`);
        }
      }
    } else {
      errors.push(`${key}: must be string or array`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get violation severity based on overdue time
 */
function getViolationSeverity(overdueMinutes: number): 'low' | 'medium' | 'high' | 'critical' {
  const overdueHours = overdueMinutes / 60;
  
  if (overdueHours >= 24) return 'critical';
  if (overdueHours >= 8) return 'high';
  if (overdueHours >= 2) return 'medium';
  
  return 'low';
}

export default app;