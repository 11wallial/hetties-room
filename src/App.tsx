import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Scene } from './Scene';

const RETURN = new Date('2026-06-04T00:00:00');
const DEPARTURE = new Date('2026-04-16T00:00:00');

function pickGreeting(daysRemaining: number): string {
  if (daysRemaining <= 0) return "you're home, my love 💛";
  const pool = [
    'love you lots ❤️ xx',
    'See you soon!',
    'Spicy Garlic Pasta pls',
    'Murphy awaits...',
    'head scratches loading.....',
  ];
  // rotate every ~3 hours so she sees a different one through the day, but stable for a while
  const idx = Math.floor((Date.now() / (1000 * 60 * 60 * 3)) % pool.length);
  return pool[idx];
}

function App() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const fakeHour = params.get('h');
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

  const weeks = Math.floor(daysRemaining / 7);
  const extra = daysRemaining % 7;
  const weekText = useMemo(() => {
    if (daysRemaining === 0) return "you're home 💛";
    if (weeks > 0 && extra > 0) return `about ${weeks} week${weeks === 1 ? '' : 's'} & ${extra} day${extra === 1 ? '' : 's'}`;
    if (weeks > 0) return `about ${weeks} week${weeks === 1 ? '' : 's'} now`;
    return `just ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} now`;
  }, [daysRemaining, weeks, extra]);

  const greeting = useMemo(() => pickGreeting(daysRemaining), [daysRemaining, Math.floor(Date.now() / (1000 * 60 * 60 * 3))]);

  // Lo-fi tracks — HoliznaCC0 "Lo-fi And Chill" album, CC0 1.0 Universal license
  // (no attribution required, public domain dedication)
  const trackList = useMemo(() => [
    `${import.meta.env.BASE_URL}lofi.mp3`,                  // Everything You Ever Dreamed
    `${import.meta.env.BASE_URL}lofi-autumn.mp3`,           // Autumn
    `${import.meta.env.BASE_URL}lofi-a-little-shade.mp3`,   // A Little Shade
    `${import.meta.env.BASE_URL}lofi-cellar-door.mp3`,      // Cellar Door
  ], []);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const trackIdxRef = useRef<number>(Math.floor(Math.random() * 4));

  const toggleAudio = async () => {
    if (audioOn) {
      stopAudioRef.current?.();
      stopAudioRef.current = null;
      setAudioOn(false);
      return;
    }
    try {
      // Use HTMLAudioElement for the lofi track (better for streaming long files)
      if (!audioElRef.current) {
        const el = new Audio();
        el.preload = 'auto';
        el.volume = 0;
        audioElRef.current = el;
      }
      const el = audioElRef.current;
      el.src = trackList[trackIdxRef.current];
      el.loop = false; // we'll advance to next track on ended

      const onEnded = () => {
        trackIdxRef.current = (trackIdxRef.current + 1) % trackList.length;
        el.src = trackList[trackIdxRef.current];
        el.play().catch(() => {});
      };
      el.addEventListener('ended', onEnded);

      // Add a soft rain layer on top, low volume — keeps the cosy ambience
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
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

      // Fade music in
      el.volume = 0;
      await el.play().catch(() => {});
      const fadeIn = setInterval(() => {
        if (el.volume < 0.55) el.volume = Math.min(0.55, el.volume + 0.04);
        else clearInterval(fadeIn);
      }, 80);

      stopAudioRef.current = () => {
        clearInterval(fadeIn);
        el.removeEventListener('ended', onEnded);
        // fade music out
        const fadeOut = setInterval(() => {
          if (el.volume > 0.04) el.volume = Math.max(0, el.volume - 0.05);
          else { clearInterval(fadeOut); el.pause(); }
        }, 60);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        setTimeout(() => { try { noise.stop(); } catch {} }, 700);
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
        <Scene now={now} daysRemaining={daysRemaining} daysSince={daysSince} totalDays={totalDays} onTapMurphy={handleTapMurphy} />
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
            <div className="countdown-card">
              <div className="label">until you're home</div>
              <div className="days">
                <span className="num">{daysRemaining}</span>
                <span className="unit">days</span>
              </div>
              <div className="sub">{weekText}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div className="progress-meta">day {daysSince} of {totalDays} · home thurs 4 june</div>
            </div>
          </div>
          <div className="overlay-bottom">
            <div className="note-card">{greeting}</div>
          </div>
        </div>

        <button className="audio-toggle" onClick={toggleAudio} aria-label={audioOn ? 'mute ambient' : 'play ambient'} title={audioOn ? 'mute' : 'play ambient sound'}>
          {audioOn ? '♪' : '♫'}
        </button>
      </div>
    </div>
  );
}

export default App;
