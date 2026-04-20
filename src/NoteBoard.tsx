import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import './NoteBoard.css';

const NOTES_API = (import.meta.env.VITE_NOTES_API as string | undefined) ?? '';
const LOCAL_KEY = 'hetties-room:notes-local';

// Warmer, dusk-friendly post-it palette — matches the amber/purple room
const NOTE_COLORS = [
  { paper: '#fff4c8', tape: '#ffd98a' }, // butter yellow
  { paper: '#ffd9b8', tape: '#f0a070' }, // peach
  { paper: '#f7c6b2', tape: '#d58068' }, // coral
  { paper: '#e6d4a8', tape: '#c9a46e' }, // sand
  { paper: '#d8c89a', tape: '#a68c5a' }, // olive cream
  { paper: '#f4b8c0', tape: '#c87080' }, // dusty rose
];

interface Note {
  id: string;
  text: string;
  author: string;
  color: string;
  rotation: number;
  createdAt: string;
}

interface NoteBoardProps {
  onClose: () => void;
  author: string;
  /** Fired whenever notes are added or deleted, so the in-scene strip can refresh. */
  onChange?: () => void;
  /** Fired when the user changes who they're pinning as via the byline tap. */
  onAuthorChange?: (next: string) => void;
}

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function pickColor(): { paper: string; tape: string } {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

function tapeFor(paper: string): string {
  return NOTE_COLORS.find((c) => c.paper === paper)?.tape ?? '#ffd98a';
}

function noteStyle(note: Note): CSSProperties {
  const rot = Math.max(-10, Math.min(10, note.rotation));
  return {
    background: `linear-gradient(160deg, ${note.color} 0%, ${shade(note.color, -8)} 100%)`,
    ['--rot' as string]: `${rot}deg`,
    ['--tape-color' as string]: tapeFor(note.color),
    transform: `rotate(${rot}deg)`,
  };
}

// Lighten/darken a hex by N (−100…100)
function shade(hex: string, n: number): string {
  const h = hex.replace('#', '');
  const p = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = Math.max(0, Math.min(255, ((p >> 16) & 0xff) + n));
  const g = Math.max(0, Math.min(255, ((p >> 8)  & 0xff) + n));
  const b = Math.max(0, Math.min(255, (p & 0xff) + n));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function loadLocal(): Note[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Note[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveLocal(notes: Note[]): void {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(notes)); } catch { /* quota? ignore */ }
}

export function NoteBoard({ onClose, author, onChange, onAuthorChange }: NoteBoardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(Boolean(NOTES_API));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const offline = !NOTES_API;

  const fetchNotes = useCallback(async () => {
    if (offline) { setNotes(loadLocal()); setLoading(false); return; }
    try {
      const res = await fetch(`${NOTES_API}/notes`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { notes: Note[] };
      setNotes(data.notes ?? []);
      setError(null);
    } catch {
      // Fall back to local copy if the API is unreachable
      const cached = loadLocal();
      if (cached.length) setNotes(cached);
      setError("couldn't reach the board — showing local copy");
    } finally {
      setLoading(false);
    }
  }, [offline]);

  useEffect(() => {
    // Initial hydrate + polling for remote updates. The set-state-in-effect
    // warning is a known false positive for data-fetch-on-mount patterns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
    if (offline) return;
    const poll = setInterval(fetchNotes, 25_000);
    return () => clearInterval(poll);
  }, [fetchNotes, offline]);

  // ESC to close + body scroll lock + focus input on open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // slight delay so the input exists and animations have settled
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [onClose]);

  const addNote = async () => {
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    const { paper } = pickColor();
    const rotation = (Math.random() - 0.5) * 14;

    if (offline) {
      const demo: Note = {
        id: crypto.randomUUID(),
        text, author, color: paper, rotation,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => {
        const next = [...prev, demo];
        saveLocal(next);
        return next;
      });
      setNewText('');
      setSubmitting(false);
      onChange?.();
      return;
    }

    try {
      const res = await fetch(`${NOTES_API}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author, color: paper, rotation }),
      });
      if (!res.ok) throw new Error('save failed');
      const saved = await res.json() as Note;
      setNotes((prev) => [...prev, saved]);
      setNewText('');
      setError(null);
      onChange?.();
    } catch {
      setError("couldn't pin the note — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (offline) {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        saveLocal(next);
        return next;
      });
      onChange?.();
      return;
    }
    // Optimistic remove
    const before = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const res = await fetch(`${NOTES_API}/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author }),
      });
      if (!res.ok) throw new Error('delete failed');
      onChange?.();
    } catch {
      // Restore and surface error
      setNotes(before);
      setError("couldn't remove — try again");
    }
  };

  return (
    <div className="nb-overlay" onClick={onClose} role="dialog" aria-label="wish board">
      <div className="nb-panel" onClick={(e) => e.stopPropagation()}>
        <div className="nb-handle" aria-hidden />
        <div className="nb-header">
          <div className="nb-title">
            things to do together
            <span className="nb-title-sub">
              {offline ? 'saved locally' : 'shared board'} · {notes.length} {notes.length === 1 ? 'wish' : 'wishes'}
            </span>
          </div>
          <button className="nb-close" onClick={onClose} aria-label="close">✕</button>
        </div>

        {/* The corkboard */}
        <div className="nb-board">
          {loading && <div className="nb-state-msg">loading the board…</div>}

          {!loading && offline && notes.length === 0 && (
            <div className="nb-state-msg nb-demo-notice">
              notes saved on this device only
              <span>(share-board coming once the api's live)</span>
            </div>
          )}

          {!loading && notes.length === 0 && !error && !offline && (
            <div className="nb-empty"><span>add the first thing ↓</span></div>
          )}

          {notes.map((note) => (
            <div key={note.id} className="postit" style={noteStyle(note)}>
              <div className="postit-tape" />
              <p className="postit-text">{note.text}</p>
              <div className="postit-footer">
                <div className="postit-meta">
                  <span className="postit-author">— {note.author}</span>
                  <span className="postit-time">{formatAgo(note.createdAt)}</span>
                </div>
                {note.author === author && (
                  <button
                    className="postit-del"
                    onClick={() => deleteNote(note.id)}
                    aria-label={`remove note: ${note.text.slice(0, 30)}`}
                  >✕</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && <div className="nb-error">{error}</div>}

        {/* Input */}
        <div className="nb-input-area">
          <textarea
            ref={inputRef}
            className="nb-input"
            placeholder="something we should do together…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); }
            }}
            rows={2}
            maxLength={200}
            aria-label="new wish"
          />
          <button
            className="nb-add-btn"
            onClick={addNote}
            disabled={!newText.trim() || submitting}
          >
            {submitting ? '…' : 'pin it'}
          </button>
        </div>
        <div className="nb-byline">
          pinning as {author}
          {onAuthorChange && (
            <>
              {' '}·{' '}
              <button
                type="button"
                className="nb-byline-change"
                onClick={() => {
                  const next = window.prompt('who are you?', author);
                  if (next !== null && next.trim()) onAuthorChange(next);
                }}
              >change</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
