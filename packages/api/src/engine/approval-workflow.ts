// CEO Approval Workflow
// Manages decisions that require human approval before execution
// Integrates with chat commands and notifications

import { eq, and, desc, sql, isNull } from "drizzle-orm";
import {
  db,
  agents,
  tasks,
  decisions,
  notifications,
  chatMessages,
  type Agent,
} from "../db";
import { emitDecisionNeeded, emitNotificationNew } from "./events";

// ============================================================
// Decision Types
// ============================================================

export interface ApprovalRequest {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  context: string;
  reasoning: string;
  taskId?: string;
  projectId?: string;
  createdAt: Date;
}

export interface ApprovalResult {
  approved: boolean;
  decisionId: string;
  approvedBy: string;
  comment?: string;
}

// ============================================================
// Create Approval Request
// ============================================================

export async function requestApproval(
  agentId: string,
  action: string,
  context: string,
  reasoning: string,
  userId: string,
  taskId?: string,
  projectId?: string
): Promise<string> {
  // Create a pending decision
  const [decision] = await db
    .insert(decisions)
    .values({
      decisionType: mapActionToDecisionType(action),
      madeBy: userId,
      context: `[PENDING APPROVAL] Agent action: ${action}\n${context}`,
      decision: "PENDING",
      reasoning,
      taskId: taskId || null,
      projectId: projectId || null,
    })
    .returning();

  // Create notification for CEO
  await db.insert(notifications).values({
    recipientType: "user",
    recipientId: userId,
    channel: "web",
    priority: "high",
    title: `Approval needed: ${action}`,
    body: `Agent requires approval for: ${context.substring(0, 200)}`,
    metadata: {
      decisionId: decision.id,
      agentId,
      action,
    },
  });

  // Emit events
  emitDecisionNeeded({
    id: decision.id,
    agentId,
    action,
    context,
  });

  emitNotificationNew({
    type: "approval_needed",
    decisionId: decision.id,
  });

  // Get agent name for chat notification
  const [agent] = await db
    .select({ name: agents.name })
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  console.log(
    `[ApprovalWorkflow] Created approval request ${decision.id} for agent ${agent?.name || agentId}`
  );

  return decision.id;
}

// ============================================================
// Process Approval/Rejection
// ============================================================

export async function processApproval(
  decisionId: string,
  approved: boolean,
  approvedBy: string,
  comment?: string
): Promise<ApprovalResult> {
  // Get the decision
  const [decision] = await db
    .select()
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (!decision) {
    throw new Error("Decision not found");
  }

  if (!decision.decision.includes("PENDING")) {
    throw new Error("Decision already processed");
  }

  // Update decision
  const newDecision = approved
    ? `APPROVED by ${approvedBy}${comment ? ": " + comment : ""}`
    : `REJECTED by ${approvedBy}${comment ? ": " + comment : ""}`;

  await db
    .update(decisions)
    .set({
      decision: newDecision,
      outcome: approved ? "approved" : "rejected",
    })
    .where(eq(decisions.id, decisionId));

  // If related to a task, update task status
  if (decision.taskId) {
    if (approved) {
      await db
        .update(tasks)
        .set({
          status: "ready",
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, decision.taskId));
    } else {
      await db
        .update(tasks)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, decision.taskId));
    }
  }

  console.log(
    `[ApprovalWorkflow] Decision ${decisionId} ${approved ? "APPROVED" : "REJECTED"} by ${approvedBy}`
  );

  return {
    approved,
    decisionId,
    approvedBy,
    comment,
  };
}

// ============================================================
// List Pending Approvals
// ============================================================

export async function listPendingApprovals(): Promise<ApprovalRequest[]> {
  const pendingDecisions = await db
    .select({
      id: decisions.id,
      context: decisions.context,
      decision: decisions.decision,
      reasoning: decisions.reasoning,
      taskId: decisions.taskId,
      projectId: decisions.projectId,
      createdAt: decisions.createdAt,
    })
    .from(decisions)
    .where(sql`${decisions.decision} = 'PENDING'`)
    .orderBy(desc(decisions.createdAt))
    .limit(20);

  return pendingDecisions.map((d) => ({
    id: d.id,
    agentId: "",
    agentName: "",
    action: d.context.match(/Agent action: (\w+)/)?.[1] || "unknown",
    context: d.context.replace("[PENDING APPROVAL] ", ""),
    reasoning: d.reasoning,
    taskId: d.taskId || undefined,
    projectId: d.projectId || undefined,
    createdAt: d.createdAt,
  }));
}

// ============================================================
// Chat Command Handlers for Approval
// ============================================================

export async function handleApproveCommand(
  args: string,
  approvedBy: string
): Promise<string> {
  if (!args.trim()) {
    // List pending approvals
    const pending = await listPendingApprovals();
    if (pending.length === 0) {
      return "No pending approvals.";
    }

    const list = pending
      .map(
        (p, i) =>
          `${i + 1}. [${p.id.substring(0, 8)}] ${p.action}: ${p.context.substring(0, 100)}`
      )
      .join("\n");

    return `Pending approvals:\n${list}\n\nUse /approve <id> to approve or /reject <id> to reject.`;
  }

  // Find matching decision
  const searchId = args.trim().split(" ")[0];
  const comment = args.trim().substring(searchId.length).trim() || undefined;

  const [decision] = await db
    .select()
    .from(decisions)
    .where(
      and(
        sql`${decisions.id}::text LIKE ${searchId + "%"}`,
        sql`${decisions.decision} = 'PENDING'`
      )
    )
    .limit(1);

  if (!decision) {
    return `No pending approval matching "${searchId}". Use /approve to list all.`;
  }

  const result = await processApproval(
    decision.id,
    true,
    approvedBy,
    comment
  );

  return `APPROVED: ${decision.context.substring(0, 100)}${comment ? " (" + comment + ")" : ""}`;
}

export async function handleRejectCommand(
  args: string,
  rejectedBy: string
): Promise<string> {
  if (!args.trim()) {
    return "Usage: /reject <decision-id> [reason]";
  }

  const searchId = args.trim().split(" ")[0];
  const reason = args.trim().substring(searchId.length).trim() || undefined;

  const [decision] = await db
    .select()
    .from(decisions)
    .where(
      and(
        sql`${decisions.id}::text LIKE ${searchId + "%"}`,
        sql`${decisions.decision} = 'PENDING'`
      )
    )
    .limit(1);

  if (!decision) {
    return `No pending approval matching "${searchId}". Use /approve to list all.`;
  }

  const result = await processApproval(
    decision.id,
    false,
    rejectedBy,
    reason
  );

  return `REJECTED: ${decision.context.substring(0, 100)}${reason ? " (" + reason + ")" : ""}`;
}

// ============================================================
// Helpers
// ============================================================

function mapActionToDecisionType(
  action: string
): "task_assign" | "deploy" | "escalate" | "approve" | "budget" {
  const mapping: Record<
    string,
    "task_assign" | "deploy" | "escalate" | "approve" | "budget"
  > = {
    execute_assigned_task: "task_assign",
    suggest_approach: "task_assign",
    self_assign_task: "task_assign",
    create_subtasks: "task_assign",
    deploy_production: "deploy",
    delegate_to_agent: "task_assign",
    create_tasks: "task_assign",
    modify_strategy: "approve",
    spend_over_10: "budget",
  };

  return mapping[action] || "approve";
}
