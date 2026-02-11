import { Hono } from 'hono';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { db, decisions, type NewDecision } from '../db';

const app = new Hono();
const execAsync = promisify(exec);

// Helper function to execute shell command with timeout
async function executeCommand(command: string, cwd?: string, timeoutMs = 300000): Promise<{ stdout: string; stderr: string }> {
  console.log(`[Deploy] Executing: ${command}${cwd ? ` (in ${cwd})` : ''}`);
  
  try {
    const result = await execAsync(command, { 
      cwd, 
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    
    console.log(`[Deploy] Command completed successfully`);
    return result;
  } catch (error: any) {
    console.error(`[Deploy] Command failed:`, error);
    throw new Error(`Command failed: ${error.message}`);
  }
}

// Helper function to log deployment decision
async function logDeployDecision(
  userId: string,
  action: string,
  context: string,
  outcome: string,
  success: boolean
): Promise<void> {
  try {
    const decision: NewDecision = {
      decisionType: 'deploy',
      madeBy: userId,
      context,
      decision: action,
      reasoning: 'Automated deployment via API',
      outcome,
    };

    await db.insert(decisions).values(decision);
    console.log(`[Deploy] Logged deployment decision: ${action} - ${success ? 'success' : 'failed'}`);
  } catch (error) {
    console.error('[Deploy] Error logging deployment decision:', error);
  }
}

// POST /api/v2/deploy/pull - Git pull and restart (admin+ only)
app.post('/pull', requireAuth, requireRole('admin'), async (c) => {
  const user = getAuthUser(c);
  if (!user || !user.id) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const startTime = Date.now();
  const deployLog: string[] = [];
  
  try {
    deployLog.push(`[${new Date().toISOString()}] Deploy started by ${user.username || user.id}`);
    
    // Change to deployment directory
    const deployDir = '/opt/orkwork-v2';
    
    // Step 1: Git pull
    deployLog.push(`[${new Date().toISOString()}] Pulling latest code...`);
    try {
      const gitResult = await executeCommand('git pull', deployDir);
      deployLog.push(`[${new Date().toISOString()}] Git pull output:`);
      deployLog.push(gitResult.stdout);
      if (gitResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] Git pull stderr:`);
        deployLog.push(gitResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] Git pull failed: ${error.message}`);
      throw new Error(`Git pull failed: ${error.message}`);
    }

    // Step 2: Install dependencies for API
    deployLog.push(`[${new Date().toISOString()}] Installing API dependencies...`);
    try {
      const installApiResult = await executeCommand('bun install', `${deployDir}/packages/api`);
      deployLog.push(`[${new Date().toISOString()}] API bun install output:`);
      deployLog.push(installApiResult.stdout);
      if (installApiResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] API bun install stderr:`);
        deployLog.push(installApiResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] API bun install failed: ${error.message}`);
      throw new Error(`API bun install failed: ${error.message}`);
    }

    // Step 3: Install dependencies for Web
    deployLog.push(`[${new Date().toISOString()}] Installing Web dependencies...`);
    try {
      const installWebResult = await executeCommand('bun install', `${deployDir}/packages/web`);
      deployLog.push(`[${new Date().toISOString()}] Web bun install output:`);
      deployLog.push(installWebResult.stdout);
      if (installWebResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] Web bun install stderr:`);
        deployLog.push(installWebResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] Web bun install failed: ${error.message}`);
      throw new Error(`Web bun install failed: ${error.message}`);
    }

    // Step 4: Build web application
    deployLog.push(`[${new Date().toISOString()}] Building web application...`);
    try {
      const buildResult = await executeCommand('bun run build', `${deployDir}/packages/web`);
      deployLog.push(`[${new Date().toISOString()}] Web build output:`);
      deployLog.push(buildResult.stdout);
      if (buildResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] Web build stderr:`);
        deployLog.push(buildResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] Web build failed: ${error.message}`);
      throw new Error(`Web build failed: ${error.message}`);
    }

    // Step 5: Restart services
    deployLog.push(`[${new Date().toISOString()}] Restarting services...`);
    
    // Restart API service (assuming systemd service)
    try {
      const restartApiResult = await executeCommand('sudo systemctl restart orkwork-api');
      deployLog.push(`[${new Date().toISOString()}] API service restarted`);
      if (restartApiResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] API restart stderr:`);
        deployLog.push(restartApiResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] API restart failed: ${error.message}`);
      // Don't throw here, try to restart web service anyway
    }

    // Restart Web service (assuming systemd service)
    try {
      const restartWebResult = await executeCommand('sudo systemctl restart orkwork-web');
      deployLog.push(`[${new Date().toISOString()}] Web service restarted`);
      if (restartWebResult.stderr) {
        deployLog.push(`[${new Date().toISOString()}] Web restart stderr:`);
        deployLog.push(restartWebResult.stderr);
      }
    } catch (error: any) {
      deployLog.push(`[${new Date().toISOString()}] Web restart failed: ${error.message}`);
      // Don't throw here, deployment might still be successful
    }

    const duration = Date.now() - startTime;
    deployLog.push(`[${new Date().toISOString()}] Deploy completed in ${duration}ms`);

    // Log successful deployment decision
    await logDeployDecision(
      user.id,
      'deploy',
      'Automated deployment via API pull endpoint',
      `Deployment completed successfully in ${duration}ms`,
      true
    );

    console.log('[Deploy] Deployment completed successfully');

    return c.json({
      message: 'Deployment completed successfully',
      duration,
      log: deployLog,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    deployLog.push(`[${new Date().toISOString()}] Deploy failed: ${error.message}`);
    deployLog.push(`[${new Date().toISOString()}] Total duration: ${duration}ms`);

    // Log failed deployment decision
    await logDeployDecision(
      user.id,
      'deploy',
      'Automated deployment via API pull endpoint',
      `Deployment failed: ${error.message}`,
      false
    );

    console.error('[Deploy] Deployment failed:', error);

    return c.json({
      error: 'Deployment failed',
      message: error.message,
      duration,
      log: deployLog,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// GET /api/v2/deploy/status - Get current git status
app.get('/status', requireAuth, requireRole('admin'), async (c) => {
  try {
    const deployDir = '/opt/orkwork-v2';
    
    // Get git branch
    const branchResult = await executeCommand('git branch --show-current', deployDir);
    const currentBranch = branchResult.stdout.trim();

    // Get last commit info
    const commitResult = await executeCommand('git log -1 --pretty=format:"%H|%s|%an|%ad" --date=iso', deployDir);
    const [hash, subject, author, date] = commitResult.stdout.split('|');

    // Get git status
    const statusResult = await executeCommand('git status --porcelain', deployDir);
    const hasChanges = statusResult.stdout.trim().length > 0;

    // Get remote status
    let behindCount = 0;
    let aheadCount = 0;
    try {
      const remoteResult = await executeCommand('git rev-list --left-right --count origin/main...HEAD', deployDir);
      const [behind, ahead] = remoteResult.stdout.trim().split('\t').map(Number);
      behindCount = behind || 0;
      aheadCount = ahead || 0;
    } catch (error) {
      console.warn('[Deploy] Could not get remote status:', error);
    }

    return c.json({
      branch: currentBranch,
      lastCommit: {
        hash: hash?.substring(0, 7) || 'unknown',
        fullHash: hash || 'unknown',
        subject: subject || 'unknown',
        author: author || 'unknown',
        date: date || 'unknown',
      },
      status: {
        hasLocalChanges: hasChanges,
        changedFiles: hasChanges ? statusResult.stdout.trim().split('\n').length : 0,
        behindRemote: behindCount,
        aheadOfRemote: aheadCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Deploy] Error getting git status:', error);
    
    return c.json({
      error: 'Failed to get deployment status',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export default app;