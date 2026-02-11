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
      const restartApiResult = await executeCommand('sudo systemctl restart orkwork-v2-api');
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
      const restartWebResult = await executeCommand('sudo systemctl restart orkwork-v2-web');
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


// GitHub Webhook — auto-deploy on push to main
app.post('/webhook/github', async (c) => {
  try {
    const secret = process.env.DEPLOY_WEBHOOK_SECRET;
    if (!secret) {
      return c.json({ error: 'Webhook secret not configured' }, 500);
    }

    const signature = c.req.header('x-hub-signature-256');
    if (!signature) {
      return c.json({ error: 'Missing signature' }, 401);
    }

    const body = await c.req.text();
    const { createHmac } = await import('crypto');
    const expectedSig = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
    
    if (signature !== expectedSig) {
      return c.json({ error: 'Invalid signature' }, 401);
    }

    const payload = JSON.parse(body);
    
    if (payload.ref !== 'refs/heads/main') {
      return c.json({ message: 'Skipped - not main branch' });
    }

    const event = c.req.header('x-github-event');
    if (event !== 'push') {
      return c.json({ message: 'Skipped - not push event' });
    }

    console.log('[Deploy] GitHub webhook: deploying push to main by', payload.pusher?.name);

    const { exec: execCb } = await import('child_process');
    execCb('/opt/orkwork-v2/deploy.sh', (error) => {
      if (error) {
        console.error('[Deploy] Script failed:', error.message);
      } else {
        console.log('[Deploy] Script completed');
      }
    });

    return c.json({ 
      message: 'Deploy triggered',
      commit: payload.head_commit?.id?.substring(0, 7),
      pusher: payload.pusher?.name,
    });
  } catch (error: any) {
    console.error('[Deploy] Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export default app;
