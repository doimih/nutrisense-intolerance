import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

type OpenAIMessage = { role: 'system' | 'user'; content: string };

function resolveBaseUrl(model: string): string {
  if (model.startsWith('gemini')) return 'https://generativelanguage.googleapis.com/v1beta/openai';
  if (model.startsWith('claude')) return 'https://api.anthropic.com/v1';
  return 'https://api.openai.com/v1';
}

async function callModel(
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const baseUrl = resolveBaseUrl(model);
  const endpoint = `${baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(50_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI API ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned empty content.');
  return content;
}

export async function POST(request: NextRequest) {
  // Auth: internal secret required
  const internalSecret = process.env.INTERNAL_SYNC_SECRET;
  if (internalSecret) {
    const incoming = request.headers.get('x-internal-secret');
    if (incoming !== internalSecret) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  let body: { prompt?: unknown; lang?: unknown } = {};
  try {
    body = (await request.json()) as { prompt?: unknown; lang?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required.' }, { status: 400 });
  }

  // Read AI config from DB (same source as guidance orchestrator)
  const dbSettings = readDb().settings;
  const aiBrain = dbSettings?.aiBrain;

  const dbApiKey = dbSettings?.ai?.apiKeyMasked ?? '';
  const isPlaceholder = !dbApiKey || dbApiKey.includes('****');
  const apiKey = (!isPlaceholder ? dbApiKey : (process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? '')).trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI API key not configured.' },
      { status: 503 },
    );
  }

  const model = (aiBrain?.defaultModel || process.env.AI_PRIMARY_MODEL || 'gpt-4o').trim();
  const fallbackModel = (aiBrain?.fallbackModel || process.env.AI_FALLBACK_MODEL || 'gpt-4o-mini').trim();
  const temperature = Math.max(0, Math.min(1, Number(aiBrain?.temperature ?? '0.7')));
  const maxTokens = Math.max(1024, Math.min(8192, Number(aiBrain?.maxTokens ?? '3000')));

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are a professional chef and nutritionist. Return ONLY valid JSON without markdown fences or extra text.',
    },
    { role: 'user', content: prompt },
  ];

  let rawText: string;
  try {
    rawText = await callModel(apiKey, model, messages, temperature, maxTokens);
  } catch {
    // Try fallback model
    if (fallbackModel && fallbackModel !== model) {
      try {
        rawText = await callModel(apiKey, fallbackModel, messages, temperature, maxTokens);
      } catch (fallbackErr) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : 'AI call failed.';
        return NextResponse.json({ error: msg }, { status: 502 });
      }
    } else {
      return NextResponse.json({ error: 'AI call failed.' }, { status: 502 });
    }
  }

  return NextResponse.json({ rawText });
}
