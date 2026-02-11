import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createHash, randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, users, sessions, type User } from '../db';
import { config, githubConfig, sessionConfig, isProduction } from '../config';

const app = new Hono();

// Helper to generate secure session token
function generateSessionToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

// Helper to fetch GitHub user data
async function fetchGitHubUser(accessToken: string) {
  const response = await fetch(githubConfig.userUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'orkwork-v2',
      'Accept': 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return await response.json();
}

// Helper to exchange GitHub code for access token
async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(githubConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'orkwork-v2',
    },
    body: JSON.stringify({
      client_id: githubConfig.clientId,
      client_secret: githubConfig.clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

// GET /api/auth/github - Redirect to GitHub OAuth
app.get('/github', async (c) => {
  const state = randomBytes(16).toString('base64url');
  
  // Store state in secure cookie for CSRF protection
  setCookie(c, 'oauth_state', state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  const authUrl = new URL(githubConfig.authorizeUrl);
  authUrl.searchParams.set('client_id', githubConfig.clientId);
  authUrl.searchParams.set('redirect_uri', githubConfig.callbackUrl);
  authUrl.searchParams.set('scope', githubConfig.scope);
  authUrl.searchParams.set('state', state);

  return c.redirect(authUrl.toString());
});

// GET /api/auth/github/callback - Handle GitHub OAuth callback
app.get('/github/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const storedState = getCookie(c, 'oauth_state');

    // Validate state parameter (CSRF protection)
    if (!state || !storedState || state !== storedState) {
      return c.json({ error: 'Invalid state parameter' }, 400);
    }

    // Clear state cookie
    setCookie(c, 'oauth_state', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    if (!code) {
      return c.json({ error: 'Authorization code is required' }, 400);
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);

    // Fetch user data from GitHub
    const githubUser = await fetchGitHubUser(accessToken);

    // Find or create user in database
    let user = await db.select().from(users).where(eq(users.githubId, githubUser.id)).limit(1);
    
    if (user.length === 0) {
      // Create new user
      const newUser = {
        githubId: githubUser.id,
        username: githubUser.login,
        displayName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        email: githubUser.email,
        role: 'viewer' as const, // Default role
      };
      
      const insertedUsers = await db.insert(users).values(newUser).returning();
      user = insertedUsers;
    } else {
      // Update existing user with latest GitHub data
      const updatedUsers = await db
        .update(users)
        .set({
          username: githubUser.login,
          displayName: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          email: githubUser.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user[0].id))
        .returning();
      
      user = updatedUsers;
    }

    // Create session
    const { token, hash } = generateSessionToken();
    const expiresAt = new Date(Date.now() + sessionConfig.maxAge * 1000);
    
    await db.insert(sessions).values({
      userId: user[0].id,
      tokenHash: hash,
      expiresAt,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
    });

    // Set session cookie
    setCookie(c, 'session_token', token, {
      httpOnly: sessionConfig.httpOnly,
      secure: sessionConfig.secure,
      sameSite: sessionConfig.sameSite,
      maxAge: sessionConfig.maxAge,
      path: '/',
    });

    // Redirect to frontend
    return c.redirect(config.WEB_URL);
    
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return c.json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// GET /api/auth/me - Get current user
app.get('/me', async (c) => {
  const user = c.get('user') as User | undefined;
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  // Return user without sensitive data
  const { ...publicUser } = user;
  return c.json({ user: publicUser });
});

// POST /api/auth/logout - Destroy session
app.post('/logout', async (c) => {
  const sessionToken = getCookie(c, 'session_token');
  
  if (sessionToken) {
    const hash = createHash('sha256').update(sessionToken).digest('hex');
    
    // Delete session from database
    await db.delete(sessions).where(eq(sessions.tokenHash, hash));
    
    // Clear session cookie
    setCookie(c, 'session_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  return c.json({ message: 'Logged out successfully' });
});

export default app;