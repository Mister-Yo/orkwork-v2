// Chat-to-Action Hooks
// Processes chat messages for commands and @mentions
// Creates tasks, assigns agents, saves knowledge, and provides status updates

import { eq, and, desc, sql } from "drizzle-orm";
import {
  db,
  agents,
  tasks,
  taskExecutions,
  projects,
  chatMessages,
  chatChannels,
  costEntries,
  decisions,
  type Agent,
} from "../db";
import { emitTaskCreated, emitTaskUpdated } from "./events";
import { autoAssignTask } from "./assigner";

// ============================================================
// Command Definitions
// ============================================================

interface ChatCommand {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string, context: CommandContext) => Promise<string>;
}

interface CommandContext {
  channelId: string;
  authorId: string;
  authorType: "user" | "agent";
  authorName: string;
  messageId: string;
}

// ============================================================
// Command Handlers
// ============================================================

async function handleTaskCommand(
  args: string,
  context: CommandContext
): Promise<string> {
  if (!args.trim()) {
    return "Usage: /task <title> [| description] [| priority:high]";
  }

  // Parse: /task Fix login bug | Users cant login after password reset | priority:urgent
  const parts = args.split("|").map((p) => p.trim());
  const title = parts[0];
  let description = parts[1] || null;
  let priority = "normal";

  // Check for priority in any part
  for (const part of parts) {
    const priorityMatch = part.match(/priority:\s*(urgent|high|normal|low)/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase();
      if (part === description) description = null;
    }
  }

  // Find default project (orkwork v2 or first active)
  const [project] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.status, "active"))
    .limit(1);

  if (!project) {
    return "Error: No active project found. Create a project first.";
  }

  // Create the task
  const [newTask] = await db
    .insert(tasks)
    .values({
      projectId: project.id,
      title,
      description,
      status: "ready",
      priority: priority as "urgent" | "high" | "normal" | "low",
    })
    .returning();

  emitTaskCreated({ id: newTask.id, title, status: "ready", priority });

  // Try auto-assign
  let assignMsg = "";
  try {
    const assignResult = await autoAssignTask(newTask.id);
    if (assignResult.assigned && assignResult.agentId) {
      const [assignedAgent] = await db
        .select({ name: agents.name })
        .from(agents)
        .where(eq(agents.id, assignResult.agentId))
        .limit(1);
      assignMsg = ` Auto-assigned to ${assignedAgent?.name || "agent"}.`;
    }
  } catch {
    // Auto-assign failed, task stays ready
  }

  return `Task created: "${title}" [${priority}] in ${project.name}.${assignMsg} The Agent Executor will pick it up within 30 seconds.`;
}

async function handleStatusCommand(
  _args: string,
  _context: CommandContext
): Promise<string> {
  // Get active agents
  const activeAgents = await db
    .select({ id: agents.id, name: agents.name, status: agents.status })
    .from(agents)
    .where(eq(agents.status, "active"));

  // Get task counts by status
  const taskCounts = await db
    .select({
      status: tasks.status,
      count: sql`count(*)`.as("count"),
    })
    .from(tasks)
    .groupBy(tasks.status);

  // Get recent executions
  const recentExecs = await db
    .select({
      status: taskExecutions.status,
      count: sql`count(*)`.as("count"),
    })
    .from(taskExecutions)
    .where(
      sql`${taskExecutions.startedAt} > NOW() - INTERVAL '24 hours'`
    )
    .groupBy(taskExecutions.status);

  // Get today cost
  const [todayCost] = await db
    .select({
      total: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as("total"),
      tokens: sql`COALESCE(SUM(${costEntries.tokenCount}), 0)`.as("tokens"),
    })
    .from(costEntries)
    .where(
      sql`${costEntries.createdAt} > NOW() - INTERVAL '24 hours'`
    );

  const statusParts: string[] = [];
  statusParts.push(`SYSTEM STATUS`);
  statusParts.push(
    `Agents: ${activeAgents.length} active (${activeAgents.map((a) => a.name).join(", ")})`
  );

  const taskStatusMap = Object.fromEntries(
    taskCounts.map((t) => [t.status, Number(t.count)])
  );
  statusParts.push(
    `Tasks: ${Object.values(taskStatusMap).reduce((a, b) => a + b, 0)} total | ` +
      `ready: ${taskStatusMap.ready || 0} | in_progress: ${taskStatusMap.in_progress || 0} | ` +
      `completed: ${taskStatusMap.completed || 0} | blocked: ${taskStatusMap.blocked || 0}`
  );

  const execStatusMap = Object.fromEntries(
    recentExecs.map((e) => [e.status, Number(e.count)])
  );
  statusParts.push(
    `Executions (24h): success: ${execStatusMap.success || 0} | ` +
      `failed: ${execStatusMap.failed || 0} | running: ${execStatusMap.running || 0}`
  );

  const costTotal = Number(todayCost?.total || 0);
  const tokenTotal = Number(todayCost?.tokens || 0);
  statusParts.push(
    `Cost (24h): $${(costTotal / 100).toFixed(2)} | ${tokenTotal} tokens`
  );

  return statusParts.join("\n");
}

async function handleSaveCommand(
  args: string,
  context: CommandContext
): Promise<string> {
  if (!args.trim()) {
    return "Usage: /save <content to save to knowledge base> [| category:general]";
  }

  // Parse: /save Important: API rate limit is 120/min | category:technical
  const parts = args.split("|").map((p) => p.trim());
  const content = parts[0];
  let category = "general";

  for (const part of parts) {
    const catMatch = part.match(/category:\s*(\w+)/i);
    if (catMatch) {
      category = catMatch[1].toLowerCase();
    }
  }

  // Generate a title from content (first 50 chars)
  const title = content.substring(0, 80).replace(/\n/g, " ");

  try {
    // Use agentMemory to store knowledge (no dedicated knowledge table yet)
    // Store as system-level memory entry
    // For user-authored saves, use the first available agent
    let saveAgentId = context.authorId;
    if (context.authorType === "user") {
      const [firstAgent] = await db.select({ id: agents.id }).from(agents).limit(1);
      if (firstAgent) saveAgentId = firstAgent.id;
      else return "Error: No agents configured to store knowledge.";
    }
    await db.insert(agentMemory).values({
      agentId: saveAgentId,
      memoryType: "fact",
      content: "[" + category + "] " + content,
    });

    return `Saved to knowledge base [${category}]: "${title}"`;
  } catch (error: any) {
    return `Failed to save: ${error.message}`;
  }
}

async function handleAssignCommand(
  args: string,
  context: CommandContext
): Promise<string> {
  if (!args.trim()) {
    return "Usage: /assign @agent-name task-title";
  }

  // Parse: /assign @CLAUDE Fix the login bug
  const mentionMatch = args.match(/@(\w+)\s+(.*)/);
  if (!mentionMatch) {
    return "Usage: /assign @agent-name task-title";
  }

  const agentName = mentionMatch[1];
  const taskTitle = mentionMatch[2];

  // Find agent
  const [agent] = await db
    .select()
    .from(agents)
    .where(sql`LOWER(${agents.name}) = ${agentName.toLowerCase()}`)
    .limit(1);

  if (!agent) {
    return `Agent "${agentName}" not found. Use /status to see available agents.`;
  }

  // Find task by title (partial match)
  const matchingTasks = await db
    .select()
    .from(tasks)
    .where(
      sql`LOWER(${tasks.title}) LIKE ${"%" + taskTitle.toLowerCase() + "%"}`
    )
    .limit(5);

  if (matchingTasks.length === 0) {
    return `No task matching "${taskTitle}" found. Use /task to create one first.`;
  }

  if (matchingTasks.length > 1) {
    const taskList = matchingTasks
      .map((t) => `  - ${t.title} [${t.status}]`)
      .join("\n");
    return `Multiple tasks match. Be more specific:\n${taskList}`;
  }

  const task = matchingTasks[0];

  // Update task status to assigned and create a decision record
  await db
    .update(tasks)
    .set({
      status: "assigned",
      autoAssigned: false,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, task.id));

  // Create decision record for the assignment
  // madeBy must be a user ID (FK to users). Use system user as fallback for agents
  const systemUserId = "00000000-0000-0000-0000-000000000000";
  await db.insert(decisions).values({
    decisionType: "task_assign",
    madeBy: context.authorType === "user" ? context.authorId : systemUserId,
    context: `Chat assignment for task: ${task.title}`,
    decision: `Assigned to agent ${agent.id}`,
    reasoning: `Manually assigned via chat by ${context.authorName}`,
    taskId: task.id,
  });

  emitTaskUpdated({ id: task.id, status: "assigned", agentId: agent.id });

  return `Task "${task.title}" assigned to ${agent.name}. Agent Executor will pick it up within 30 seconds.`;
}

async function handleHelpCommand(
  _args: string,
  _context: CommandContext
): Promise<string> {
  return `Available commands:
/task <title> [| description] [| priority:urgent] - Create a new task
/assign @agent <task-title> - Assign a task to an agent
/save <content> [| category:technical] - Save to knowledge base
/status - Show system status (agents, tasks, costs)
/help - Show this help message`;
}

// ============================================================
// Command Registry
// ============================================================

const COMMANDS: ChatCommand[] = [
  {
    name: "task",
    aliases: ["t", "newtask", "create"],
    description: "Create a new task",
    usage: "/task <title> [| description] [| priority:high]",
    handler: handleTaskCommand,
  },
  {
    name: "status",
    aliases: ["s", "stat", "dashboard"],
    description: "Show system status",
    usage: "/status",
    handler: handleStatusCommand,
  },
  {
    name: "save",
    aliases: ["kb", "knowledge", "remember"],
    description: "Save to knowledge base",
    usage: "/save <content> [| category:general]",
    handler: handleSaveCommand,
  },
  {
    name: "assign",
    aliases: ["a"],
    description: "Assign task to agent",
    usage: "/assign @agent <task-title>",
    handler: handleAssignCommand,
  },
  {
    name: "help",
    aliases: ["h", "?"],
    description: "Show help",
    usage: "/help",
    handler: handleHelpCommand,
  },
];

// ============================================================
// Message Processor
// ============================================================

function findCommand(input: string): { command: ChatCommand; args: string } | null {
  if (!input.startsWith("/")) return null;

  const spaceIndex = input.indexOf(" ");
  const cmdName = (spaceIndex === -1 ? input : input.substring(0, spaceIndex))
    .substring(1) // remove /
    .toLowerCase();
  const args = spaceIndex === -1 ? "" : input.substring(spaceIndex + 1);

  for (const cmd of COMMANDS) {
    if (cmd.name === cmdName || cmd.aliases.includes(cmdName)) {
      return { command: cmd, args };
    }
  }

  return null;
}

export async function processMessage(
  message: {
    id: string;
    channelId: string;
    authorId: string;
    authorType: "user" | "agent";
    content: string;
  },
  authorName: string
): Promise<string | null> {
  const context: CommandContext = {
    channelId: message.channelId,
    authorId: message.authorId,
    authorType: message.authorType,
    authorName,
    messageId: message.id,
  };

  // Check for slash commands
  const parsed = findCommand(message.content);
  if (parsed) {
    try {
      const response = await parsed.command.handler(parsed.args, context);
      return response;
    } catch (error: any) {
      console.error(
        `[ChatHooks] Command /${parsed.command.name} failed:`,
        error
      );
      return `Error executing /${parsed.command.name}: ${error.message}`;
    }
  }

  // Check for @mentions (route to DM or tag agent)
  const mentions = message.content.match(/@(\w+)/g);
  if (mentions) {
    for (const mention of mentions) {
      const agentName = mention.substring(1); // remove @
      const [agent] = await db
        .select({ id: agents.id, name: agents.name })
        .from(agents)
        .where(sql`LOWER(${agents.name}) = ${agentName.toLowerCase()}`)
        .limit(1);

      if (agent) {
        console.log(
          `[ChatHooks] @${agent.name} mentioned in message ${message.id}`
        );
        // For now, just log the mention
        // Future: create a notification for the agent
      }
    }
  }

  return null; // No command, no action needed
}

// ============================================================
// Post Command Response to Chat
// ============================================================

export async function postCommandResponse(
  channelId: string,
  botId: string,
  response: string,
  replyTo?: string
): Promise<void> {
  try {
    await db.insert(chatMessages).values({
      channelId,
      authorId: botId,
      authorType: "agent",
      content: response,
      replyTo: replyTo || null,
    });
  } catch (error) {
    console.error("[ChatHooks] Failed to post response:", error);
  }
}
