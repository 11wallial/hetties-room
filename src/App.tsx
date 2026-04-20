import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Scene } from './Scene';
import { LocationTracker } from './LocationTracker';
import { NoteBoard } from './NoteBoard';
import { RecentNotes } from './RecentNotes';
import { pickWeather } from './weather';

const RETURN = new Date('2026-06-04T00:00:00');
const DEPARTURE = new Date('2026-04-16T00:00:00');

function pickGreeting(daysRemaining: number, slot: number): string {
  if (daysRemaining <= 0) return "you're home, my love 💛";
  const pool = [
    'love you lots ❤️ xx',
    'see you soon!',
    'spicy garlic pasta pls',
    'murphy awaits...',
    'head scratches loading.....',
  ];
  return pool[slot % pool.length];
}

function App() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const fakeHour = params.get('h');
  // Identity — ?who=hettie (or anything else) labels the author for the pinboard
  const who = ((params.get('who') ?? 'xan').toLowerCase().trim()) || 'xan';

  const initialNow = (() => {
    if (!fakeHour) return new Date();
    const h = parseFloat(fakeHour);
    const d = new Date();
    d.setHours(Math.floor(h), Math.round((h - Math.floor(h)) * 60), 0, 0);
    return d;
  })();

  const [now, setNow] = useState(initialNow);
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [audioOn, setAudioOn] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesVersion, setNotesVersion] = useState(0);
  // Weather is picked once per page-load (or pinned via ?weather=)
  const [weather] = useState(() => pickWeather(params.get('weather')));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (fakeHour) return;
    const tick = () => setNow(new Date());
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [fakeHour]);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(0, Math.ceil((RETURN.getTime() - now.getTime()) / msPerDay));
  const daysSince = Math.max(0, Math.floor((now.getTime() - DEPARTURE.getTime()) / msPerDay));
  const totalDays = Math.ceil((RETURN.getTime() - DEPARTURE.getTime()) / msPerDay);
  const progress = Math.min(100, Math.max(0, (daysSince / totalDays) * 100));


  // Rotate every ~3 hours, but stable within a window
  const greetingSlot = Math.floor(now.getTime() / (1000 * 60 * 60 * 3));
  const greeting = useMemo(() => pickGreeting(daysRemaining, greetingSlot), [daysRemaining, greetingSlot]);

  // Lo-fi tracks — HoliznaCC0 "Lo-fi And Chill" album, CC0 1.0 (no attribution required)
  const trackList = useMemo(() => [
    `${import.meta.env.BASE_URL}lofi.mp3`,
    `${import.meta.env.BASE_URL}lofi-autumn.mp3`,
    `${import.meta.env.BASE_URL}lofi-a-little-shade.mp3`,
    `${import.meta.env.BASE_URL}lofi-cellar-door.mp3`,
  ], []);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  // Lazy-init via useState to keep render pure
  const [initialTrack] = useState(() => Math.floor(Math.random() * 4));
  const trackIdxRef = useRef<number>(initialTrack);

  const toggleAudio = async () => {
    if (audioOn) {
      stopAudioRef.current?.();
      stopAudioRef.current = null;
      setAudioOn(false);
      return;
    }
    try {
      if (!audioElRef.current) {
        const el = new Audio();
        el.preload = 'auto';
        el.volume = 0;
        audioElRef.current = el;
      }
      const el = audioElRef.current;
      el.src = trackList[trackIdxRef.current];
      el.loop = false;

      const onEnded = () => {
        trackIdxRef.current = (trackIdxRef.current + 1) % trackList.length;
        el.src = trackList[trackIdxRef.current];
        el.play().catch(() => {});
      };
      el.addEventListener('ended', onEnded);

      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 1.6);
      master.connect(ctx.destination);

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer; noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 900; noiseFilter.Q.value = 0.55;
      noise.connect(noiseFilter); noiseFilter.connect(master);
      noise.start();

      el.volume = 0;
      await el.play().catch(() => {});
      const fadeIn = setInterval(() => {
        if (el.volume < 0.55) el.volume = Math.min(0.55, el.volume + 0.04);
        else clearInterval(fadeIn);
      }, 80);

      stopAudioRef.current = () => {
        clearInterval(fadeIn);
        el.removeEventListener('ended', onEnded);
        const fadeOut = setInterval(() => {
          if (el.volume > 0.04) el.volume = Math.max(0, el.volume - 0.05);
          else { clearInterval(fadeOut); el.pause(); }
        }, 60);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        setTimeout(() => { try { noise.stop(); } catch { /* already stopped */ } }, 700);
      };
      setAudioOn(true);
    } catch (e) {
      console.warn('audio failed', e);
    }
  };

  const handleTapMurphy = () => {
    const newHearts = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: 24 + Math.random() * 16,
      delay: i * 140,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
    }, 3500);
  };

  return (
    <div className="stage">
      <div className="scene-frame fade-in">
        <Scene now={now} weather={weather} daysRemaining={daysRemaining} daysSince={daysSince} totalDays={totalDays} onTapMurphy={handleTapMurphy} />
        <div className="hearts-layer">
          {hearts.map((h) => (
            <span key={h.id} className="heart" style={{ left: `${h.x}%`, animationDelay: `${h.delay}ms` }}>💛</span>
          ))}
        </div>
        <div className="overlay-ui">
          <div className="overlay-top">
            <div className="title-stamp">
              hettie's room
              <span className="small">a little corner of home</span>
            </div>
          </div>
          <div className="overlay-mid">
            <div className="countdown-card" role="status" aria-live="polite" aria-label={`${daysRemaining} days until home`}>
              <div className="countdown-label">until you're home</div>
              <div className="countdown-number">
                <span className="num">{daysRemaining}</span>
                <span className="unit">day{daysRemaining === 1 ? '' : 's'}</span>
              </div>
              <div className="countdown-progress">
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                <div className="progress-meta">
                  <span>day {daysSince} of {totalDays}</span>
                  <span className="progress-sep" aria-hidden>·</span>
                  <span>home thu 4 jun</span>
                </div>
              </div>
            </div>
          </div>
          <div className="overlay-bottom">
            <RecentNotes version={notesVersion} onOpen={() => setShowNotes(true)} />
            <div className="note-card">{greeting}</div>
          </div>
        </div>

        {/* Corner buttons */}
        <button
          className="corner-toggle audio-toggle"
          onClick={toggleAudio}
          aria-label={audioOn ? 'mute ambient' : 'play ambient'}
          title={audioOn ? 'mute' : 'play ambient sound'}
        >
          <span className="corner-icon" aria-hidden>{audioOn ? '♪' : '♫'}</span>
          <span className="corner-label">{audioOn ? 'playing' : 'lo-fi'}</span>
        </button>

        <button
          className="corner-toggle map-toggle"
          onClick={() => setShowMap(true)}
          aria-label="open the journey map"
          title="where next?"
        >
          <span className="corner-icon" aria-hidden>🗺</span>
          <span className="corner-label">where next</span>
        </button>

        <button
          className="corner-toggle notes-toggle"
          onClick={() => setShowNotes(true)}
          aria-label="open the wish board"
          title="things to do together"
        >
          <span className="corner-icon" aria-hidden>📌</span>
          <span className="corner-label">wishes</span>
        </button>
      </div>

      {showMap && <LocationTracker now={now} onClose={() => setShowMap(false)} />}
      {showNotes && (
        <NoteBoard
          onClose={() => { setShowNotes(false); setNotesVersion((v) => v + 1); }}
          onChange={() => setNotesVersion((v) => v + 1)}
          author={who}
        />
      )}
    </div>
  );
}

export default App;
