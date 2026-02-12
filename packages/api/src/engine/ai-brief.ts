import { generateBrief, type DailyBrief } from './brief';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface AIBrief extends DailyBrief {
  ai_summary?: string;
  ai_highlights?: string[];
  ai_action_items?: string[];
}

// Cache: store the last generated AI brief with timestamp
let cachedBrief: { data: AIBrief; generatedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function callClaude(prompt: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    return '';
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('[AIBrief] Claude API error:', response.status, await response.text());
      return '';
    }

    const data = await response.json() as any;
    return data.content?.[0]?.text || '';
  } catch (error) {
    console.error('[AIBrief] Claude API call failed:', error);
    return '';
  }
}

export async function generateAIBrief(): Promise<AIBrief> {
  // Check cache
  if (cachedBrief && Date.now() - cachedBrief.generatedAt < CACHE_TTL_MS) {
    console.log('[AIBrief] Returning cached brief');
    return cachedBrief.data;
  }

  console.log('[AIBrief] Generating new AI brief...');

  // Get the data-driven brief first
  const baseBrief = await generateBrief();

  // If no API key, return base brief
  if (!ANTHROPIC_API_KEY) {
    console.log('[AIBrief] No ANTHROPIC_API_KEY, returning data-only brief');
    return baseBrief;
  }

  // Build prompt with real data
  const prompt = `You are the AI assistant for orkwork.space - a human-agent collaboration platform. Generate a concise daily brief for the CEO.

Current data:
- Date: ${baseBrief.date}
- System Health: ${baseBrief.system_health}%
- Active Agents: ${baseBrief.summary.active_agents}/${baseBrief.summary.total_agents}
- Tasks completed (24h): ${baseBrief.summary.tasks_completed_24h}
- Tasks created (24h): ${baseBrief.summary.tasks_created_24h}
- Tasks blocked: ${baseBrief.summary.tasks_blocked}
- Tasks overdue: ${baseBrief.summary.tasks_overdue}
- Daily spend: $${baseBrief.budget.daily_spent} / $${baseBrief.budget.daily_limit} limit
- Monthly spend: $${baseBrief.budget.monthly_spent} (forecast: $${baseBrief.budget.monthly_forecast})
- Pending decisions: ${baseBrief.decisions_pending}
- SLA violations: ${baseBrief.sla_violations}

Recent events:
${baseBrief.top_events.map(e => `- [${e.time}] ${e.agent ? e.agent + ': ' : ''}${e.event}`).join('\n') || '- No recent events'}

Existing recommendations:
${baseBrief.recommendations.map(r => `- ${r}`).join('\n') || '- None'}

Risks:
${baseBrief.risks.map(r => `- [${r.level}] ${r.description}`).join('\n') || '- None identified'}

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "2-3 sentence executive summary of the day",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "action_items": ["action 1", "action 2"]
}`;

  const aiResponse = await callClaude(prompt);

  let aiData = { summary: '', highlights: [] as string[], action_items: [] as string[] };

  if (aiResponse) {
    try {
      // Try to parse JSON from response
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiData = JSON.parse(cleaned);
    } catch (e) {
      console.error('[AIBrief] Failed to parse Claude response:', e);
      // Use the raw text as summary
      aiData.summary = aiResponse.slice(0, 300);
    }
  }

  const aiBrief: AIBrief = {
    ...baseBrief,
    ai_summary: aiData.summary || undefined,
    ai_highlights: aiData.highlights?.length ? aiData.highlights : undefined,
    ai_action_items: aiData.action_items?.length ? aiData.action_items : undefined,
  };

  // Cache the result
  cachedBrief = { data: aiBrief, generatedAt: Date.now() };

  console.log('[AIBrief] Generated AI brief successfully');
  return aiBrief;
}
