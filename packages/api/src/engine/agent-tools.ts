import { spawn } from "child_process";

// Tool definitions for Claude API tool_use
export const AGENT_TOOLS = [
  {
    name: "run_shell",
    description: "Execute a shell command on the server. Use for file operations, git commands, build tools, system checks. Commands run in /opt/orkwork-v2 directory. Avoid destructive commands without approval.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute",
        },
        working_dir: {
          type: "string",
          description: "Optional working directory (default: /opt/orkwork-v2)",
        },
        timeout_ms: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000, max: 120000)",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "read_file",
    description: "Read the contents of a file. Use to inspect code, configs, logs.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Absolute path to the file to read",
        },
        max_lines: {
          type: "number",
          description: "Maximum number of lines to read (default: 200)",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file. Creates the file if it does not exist. Use for creating/modifying code, configs.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Absolute path to write to",
        },
        content: {
          type: "string",
          description: "The content to write",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory with optional pattern matching.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Directory path to list",
        },
        pattern: {
          type: "string",
          description: "Optional glob pattern to filter (e.g. *.ts)",
        },
      },
      required: ["path"],
    },
  },
];

// Blocked commands that could be destructive
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\/(?!opt\/orkwork)/i,  // rm -rf outside of project
  /mkfs/i,
  /dd\s+if=/i,
  /shutdown/i,
  /reboot/i,
  /init\s+0/i,
  /systemctl\s+(stop|disable)\s+(ssh|sshd|caddy|postgres)/i,
  /DROP\s+DATABASE/i,
  /DROP\s+TABLE/i,
  /TRUNCATE/i,
  /passwd/i,
  /useradd/i,
  /userdel/i,
  /chmod\s+777\s+\//i,
  /iptables\s+-F/i,
  /curl.*\|\s*sh/i, // pipe to shell
  /wget.*\|\s*sh/i,
];

// Allowed base directories for file operations
const ALLOWED_DIRS = [
  "/opt/orkwork-v2",
  "/tmp",
];

function isPathAllowed(path: string): boolean {
  const normalized = path.replace(/\/+/g, "/");
  return ALLOWED_DIRS.some(dir => normalized.startsWith(dir));
}

function isCommandBlocked(command: string): string | null {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return `Command blocked by security policy: matches ${pattern}`;
    }
  }
  return null;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  duration_ms: number;
}

async function executeShell(command: string, workingDir?: string, timeoutMs?: number): Promise<ToolResult> {
  const start = Date.now();
  const cwd = workingDir || "/opt/orkwork-v2";
  const timeout = Math.min(timeoutMs || 30000, 120000);

  // Security check
  const blocked = isCommandBlocked(command);
  if (blocked) {
    return { success: false, output: "", error: blocked, duration_ms: Date.now() - start };
  }

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let killed = false;

    const proc = spawn("bash", ["-c", command], {
      cwd,
      timeout,
      env: {
        ...process.env,
        PATH: "/root/.bun/bin:/usr/local/bin:/usr/bin:/bin",
        HOME: "/root",
      },
    });

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > 50000) {
        stdout = stdout.slice(0, 50000) + "\n...[truncated]";
        proc.kill();
        killed = true;
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      if (stderr.length > 10000) {
        stderr = stderr.slice(0, 10000) + "\n...[truncated]";
      }
    });

    proc.on("close", (code) => {
      const duration = Date.now() - start;
      if (killed) {
        resolve({ success: false, output: stdout, error: "Output truncated (>50KB)", duration_ms: duration });
      } else if (code === 0) {
        resolve({ success: true, output: stdout.trim(), duration_ms: duration });
      } else {
        resolve({ success: false, output: stdout.trim(), error: stderr.trim() || `Exit code ${code}`, duration_ms: duration });
      }
    });

    proc.on("error", (err) => {
      resolve({ success: false, output: "", error: err.message, duration_ms: Date.now() - start });
    });
  });
}

async function readFile(path: string, maxLines?: number): Promise<ToolResult> {
  const start = Date.now();

  if (!isPathAllowed(path)) {
    return { success: false, output: "", error: `Access denied: path ${path} is outside allowed directories`, duration_ms: 0 };
  }

  try {
    const file = Bun.file(path);
    const exists = await file.exists();
    if (!exists) {
      return { success: false, output: "", error: `File not found: ${path}`, duration_ms: Date.now() - start };
    }

    let content = await file.text();
    if (maxLines && maxLines > 0) {
      const lines = content.split("\n");
      if (lines.length > maxLines) {
        content = lines.slice(0, maxLines).join("\n") + `\n...[${lines.length - maxLines} more lines]`;
      }
    }

    // Truncate very large files
    if (content.length > 50000) {
      content = content.slice(0, 50000) + "\n...[truncated]";
    }

    return { success: true, output: content, duration_ms: Date.now() - start };
  } catch (err: any) {
    return { success: false, output: "", error: err.message, duration_ms: Date.now() - start };
  }
}

async function writeFile(path: string, content: string): Promise<ToolResult> {
  const start = Date.now();

  if (!isPathAllowed(path)) {
    return { success: false, output: "", error: `Access denied: path ${path} is outside allowed directories`, duration_ms: 0 };
  }

  try {
    await Bun.write(path, content);
    return { success: true, output: `File written: ${path} (${content.length} bytes)`, duration_ms: Date.now() - start };
  } catch (err: any) {
    return { success: false, output: "", error: err.message, duration_ms: Date.now() - start };
  }
}

async function listFiles(dirPath: string, pattern?: string): Promise<ToolResult> {
  const start = Date.now();

  if (!isPathAllowed(dirPath)) {
    return { success: false, output: "", error: `Access denied: path ${dirPath} is outside allowed directories`, duration_ms: 0 };
  }

  const command = pattern
    ? `find ${dirPath} -maxdepth 3 -name "${pattern}" -type f | head -100`
    : `ls -la ${dirPath} | head -100`;

  return executeShell(command);
}

// Execute a tool call from Claude
export async function executeTool(toolName: string, toolInput: Record<string, any>): Promise<ToolResult> {
  console.log(`[AgentTools] Executing tool: ${toolName}`, JSON.stringify(toolInput).slice(0, 200));

  switch (toolName) {
    case "run_shell":
      return executeShell(toolInput.command, toolInput.working_dir, toolInput.timeout_ms);
    case "read_file":
      return readFile(toolInput.path, toolInput.max_lines);
    case "write_file":
      return writeFile(toolInput.path, toolInput.content);
    case "list_files":
      return listFiles(toolInput.path, toolInput.pattern);
    default:
      return { success: false, output: "", error: `Unknown tool: ${toolName}`, duration_ms: 0 };
  }
}
