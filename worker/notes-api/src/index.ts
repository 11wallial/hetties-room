// Hettie's Room — notes API (Cloudflare Worker + KV)
// Endpoints:
//   GET    /notes       → { notes: Note[] }
//   POST   /notes       → Note (creates; caps at MAX_NOTES oldest-first)
//   DELETE /notes/:id   → { ok: true }   (body: { author } must match note.author)

export interface Env {
  HETTIES_NOTES: KVNamespace;
}

interface Note {
  id: string;
  text: string;
  author: string;
  color: string;
  rotation: number;
  createdAt: string;
}

const KV_KEY = 'notes';
const MAX_NOTES = 100;
const MAX_TEXT = 200;
const MAX_AUTHOR = 24;

const ALLOWED_ORIGINS = [
  'https://11wallial.github.io',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Any localhost / 127.0.0.1 port — lets `vite dev` (which may pick 5173, 5174, 5179, …) work
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin: string | null): HeadersInit {
  const allow = isAllowedOrigin(origin) ? (origin as string) : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

async function getNotes(env: Env): Promise<Note[]> {
  const stored = await env.HETTIES_NOTES.get(KV_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as Note[]) : [];
  } catch {
    return [];
  }
}

async function saveNotes(env: Env, notes: Note[]): Promise<void> {
  await env.HETTIES_NOTES.put(KV_KEY, JSON.stringify(notes));
}

function sanitiseStr(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // GET /notes
    if (url.pathname === '/notes' && request.method === 'GET') {
      const notes = await getNotes(env);
      return json({ notes }, 200, origin);
    }

    // POST /notes
    if (url.pathname === '/notes' && request.method === 'POST') {
      let body: Partial<Note>;
      try {
        body = await request.json() as Partial<Note>;
      } catch {
        return json({ error: 'invalid JSON' }, 400, origin);
      }

      const text = sanitiseStr(body.text, MAX_TEXT);
      if (!text) return json({ error: 'text required' }, 400, origin);
      const author = sanitiseStr(body.author, MAX_AUTHOR) || 'anonymous';

      const note: Note = {
        id: crypto.randomUUID(),
        text,
        author,
        color: typeof body.color === 'string' ? body.color.slice(0, 12) : '#fff4c8',
        rotation: typeof body.rotation === 'number'
          ? Math.max(-12, Math.min(12, body.rotation))
          : 0,
        createdAt: new Date().toISOString(),
      };

      const notes = await getNotes(env);
      notes.push(note);
      // Cap board size — drop the oldest entries if we've exceeded the cap
      const capped = notes.length > MAX_NOTES ? notes.slice(-MAX_NOTES) : notes;
      await saveNotes(env, capped);

      return json(note, 201, origin);
    }

    // DELETE /notes/:id
    const deleteMatch = url.pathname.match(/^\/notes\/([0-9a-f-]+)$/i);
    if (deleteMatch && request.method === 'DELETE') {
      const id = deleteMatch[1];
      let requester = '';
      try {
        const body = await request.json() as { author?: string };
        requester = sanitiseStr(body.author, MAX_AUTHOR);
      } catch {
        // allow body-less delete for offline-mode calls; will 403 below
      }

      const notes = await getNotes(env);
      const target = notes.find((n) => n.id === id);
      if (!target) return json({ error: 'not found' }, 404, origin);
      if (!requester || requester !== target.author) {
        return json({ error: 'only the author can remove a note' }, 403, origin);
      }

      const filtered = notes.filter((n) => n.id !== id);
      await saveNotes(env, filtered);
      return json({ ok: true }, 200, origin);
    }

    return json({ error: 'not found' }, 404, origin);
  },
};
