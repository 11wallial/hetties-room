import { useEffect, useState, type CSSProperties } from 'react';
import './RecentNotes.css';

const NOTES_API = (import.meta.env.VITE_NOTES_API as string | undefined) ?? '';
const LOCAL_KEY = 'hetties-room:notes-local';

interface Note {
  id: string;
  text: string;
  author: string;
  color: string;
  rotation: number;
  createdAt: string;
}

interface RecentNotesProps {
  /** Bump to force a re-read — the board pushes this when notes change. */
  version: number;
  onOpen: () => void;
  limit?: number;
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

export function RecentNotes({ version, onOpen, limit = 3 }: RecentNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Mirror the board's data source; initial read is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!NOTES_API) { setNotes(loadLocal()); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${NOTES_API}/notes`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { notes: Note[] };
        if (!cancelled) setNotes(data.notes ?? []);
      } catch {
        if (!cancelled) setNotes(loadLocal());
      }
    })();
    return () => { cancelled = true; };
  }, [version]);

  // Most-recent first, up to `limit`
  const recent = notes.slice(-limit).reverse();
  if (recent.length === 0) return null;

  return (
    <button
      type="button"
      className="recent-pins"
      onClick={onOpen}
      aria-label={`open wish board (${notes.length} pinned)`}
    >
      {recent.map((note, i) => {
        const rot = Math.max(-6, Math.min(6, (note.rotation ?? 0) * 0.7));
        return (
          <span
            key={note.id}
            className="recent-pin"
            style={{
              background: `linear-gradient(160deg, ${note.color} 0%, ${shade(note.color, -10)} 100%)`,
              ['--rot' as string]: `${rot + (i - 1) * 3}deg`,
              ['--delay' as string]: `${i * 80}ms`,
            } as CSSProperties}
          >
            <span className="recent-pin-text">{note.text}</span>
          </span>
        );
      })}
      <span className="recent-pins-hint">+ {notes.length} pinned · tap to see</span>
    </button>
  );
}

function shade(hex: string, n: number): string {
  const h = hex.replace('#', '');
  const p = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = Math.max(0, Math.min(255, ((p >> 16) & 0xff) + n));
  const g = Math.max(0, Math.min(255, ((p >> 8)  & 0xff) + n));
  const b = Math.max(0, Math.min(255, (p & 0xff) + n));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
