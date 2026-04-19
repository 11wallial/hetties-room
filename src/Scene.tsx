import { useMemo } from 'react';
import './Scene.css';

interface SceneProps { now: Date; daysRemaining?: number }

function getSkyPalette(hour: number) {
  const anchors: { h: number; sky: [string, string, string]; sun: string; sunY: number; haze: string; tint: string; }[] = [
    { h: 0,  sky: ['#0d1530', '#1b1640', '#2a1d44'], sun: '#5a4a7a', sunY: 380, haze: '#3a2848', tint: '#09060f' },
    { h: 5,  sky: ['#3d2548', '#7a4a5e', '#e0a07a'], sun: '#ffd9a8', sunY: 320, haze: '#a86a6a', tint: '#1a0e1f' },
    { h: 8,  sky: ['#9ec3df', '#fbe2ba', '#fcd296'], sun: '#fff4d8', sunY: 240, haze: '#e6c098', tint: '#2a1620' },
    { h: 12, sky: ['#a9d4ee', '#dde8f0', '#f4e4c4'], sun: '#fff8e8', sunY: 160, haze: '#d8c8b0', tint: '#3a2030' },
    { h: 16, sky: ['#cbd9e8', '#fce5b8', '#fcb37a'], sun: '#fff0c0', sunY: 240, haze: '#e89a78', tint: '#3a1d28' },
    { h: 19, sky: ['#3e2654', '#a85970', '#f4a06a'], sun: '#fff0c0', sunY: 320, haze: '#bd6a6a', tint: '#1a0e1f' },
    { h: 21, sky: ['#1a1438', '#3d2050', '#7a3858'], sun: '#fcd092', sunY: 380, haze: '#5a3050', tint: '#0e0612' },
    { h: 24, sky: ['#0d1530', '#1b1640', '#2a1d44'], sun: '#5a4a7a', sunY: 380, haze: '#3a2848', tint: '#09060f' },
  ];
  let i = 0;
  while (i < anchors.length - 1 && hour >= anchors[i + 1].h) i++;
  const a = anchors[i]; const b = anchors[Math.min(i + 1, anchors.length - 1)];
  const t = (hour - a.h) / (b.h - a.h || 1);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const lerpColor = (c1: string, c2: string) => {
    const p1 = parseInt(c1.slice(1), 16); const p2 = parseInt(c2.slice(1), 16);
    const r = Math.round(lerp((p1 >> 16) & 0xff, (p2 >> 16) & 0xff));
    const g = Math.round(lerp((p1 >> 8) & 0xff, (p2 >> 8) & 0xff));
    const bl = Math.round(lerp(p1 & 0xff, p2 & 0xff));
    return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
  };
  return {
    sky: a.sky.map((c, j) => lerpColor(c, b.sky[j])) as [string, string, string],
    sun: lerpColor(a.sun, b.sun),
    sunY: lerp(a.sunY, b.sunY),
    haze: lerpColor(a.haze, b.haze),
    tint: lerpColor(a.tint, b.tint),
  };
}

export function Scene({ now, daysRemaining = 0 }: SceneProps) {
  const hour = now.getHours() + now.getMinutes() / 60;
  const palette = useMemo(() => getSkyPalette(hour), [Math.floor(hour * 12) / 12]);
  const isNight = hour < 6 || hour > 20;
  const isEvening = hour >= 17 && hour <= 21;
  const seed = now.getDate();

  return (
    <svg
      className="scene-svg"
      viewBox="0 0 720 1280"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* SKY */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.sky[0]} />
          <stop offset="55%" stopColor={palette.sky[1]} />
          <stop offset="100%" stopColor={palette.sky[2]} />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={palette.sun} stopOpacity="1" />
          <stop offset="35%" stopColor={palette.sun} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palette.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.haze} stopOpacity="0" />
          <stop offset="60%" stopColor={palette.haze} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.haze} stopOpacity="0.85" />
        </linearGradient>

        {/* HILLS */}
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7e8aa0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5a6a82" />
        </linearGradient>
        <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#658260" />
          <stop offset="100%" stopColor="#3d5240" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d6443" />
          <stop offset="100%" stopColor="#2c3a2a" />
        </linearGradient>

        {/* WALL */}
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4838" />
          <stop offset="35%" stopColor="#a06a4e" />
          <stop offset="100%" stopColor="#5a3424" />
        </linearGradient>
        <linearGradient id="wallShadow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern id="wallpaperPattern" x="0" y="0" width="60" height="80" patternUnits="userSpaceOnUse">
          <path d="M 30 20 Q 38 28 30 36 Q 22 28 30 20 Z" fill="#8a4a36" opacity="0.18" />
          <circle cx="30" cy="60" r="2" fill="#c97a4a" opacity="0.18" />
        </pattern>

        {/* FLOOR */}
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6e3e22" />
          <stop offset="50%" stopColor="#5a3018" />
          <stop offset="100%" stopColor="#3a1d10" />
        </linearGradient>
        <radialGradient id="floorPool" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#ffd896" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffa860" stopOpacity="0" />
        </radialGradient>

        {/* WINDOW FRAME */}
        <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d2418" />
          <stop offset="50%" stopColor="#5a3520" />
          <stop offset="100%" stopColor="#2a1810" />
        </linearGradient>

        {/* CURTAINS */}
        <linearGradient id="curtainGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a2438" />
          <stop offset="50%" stopColor="#8a3850" />
          <stop offset="100%" stopColor="#4a1d2e" />
        </linearGradient>
        <linearGradient id="curtainShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>

        {/* HETTIE */}
        <linearGradient id="hairBase" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#f4a868" />
          <stop offset="35%" stopColor="#d96a2c" />
          <stop offset="75%" stopColor="#9c3818" />
          <stop offset="100%" stopColor="#5a1e0e" />
        </linearGradient>
        <linearGradient id="hairLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe0a8" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#ffb070" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffa060" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hairCurl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e87838" />
          <stop offset="100%" stopColor="#7a2818" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fde2cc" />
          <stop offset="55%" stopColor="#f4c8a8" />
          <stop offset="100%" stopColor="#c08a72" />
        </linearGradient>
        <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fdf5e8" />
          <stop offset="60%" stopColor="#e8d8c0" />
          <stop offset="100%" stopColor="#a08470" />
        </linearGradient>

        {/* MURPHY */}
        <linearGradient id="murphyCoat" x1="0" y1="0" x2="0.7" y2="0.7">
          <stop offset="0%" stopColor="#3a2e26" />
          <stop offset="50%" stopColor="#1a120e" />
          <stop offset="100%" stopColor="#050302" />
        </linearGradient>
        <linearGradient id="murphyBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a120e" />
          <stop offset="100%" stopColor="#3a2820" />
        </linearGradient>
        <linearGradient id="murphyRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd896" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffa060" stopOpacity="0" />
        </linearGradient>

        {/* DESK */}
        <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4828" />
          <stop offset="60%" stopColor="#5a3420" />
          <stop offset="100%" stopColor="#3a2010" />
        </linearGradient>

        {/* LAMP */}
        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe6a8" stopOpacity="1" />
          <stop offset="40%" stopColor="#ffc878" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4c8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffae6a" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="lampMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1410" />
          <stop offset="50%" stopColor="#3a2818" />
          <stop offset="100%" stopColor="#0e0a06" />
        </linearGradient>

        <linearGradient id="mugBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fdf5e0" />
          <stop offset="60%" stopColor="#e8d0a8" />
          <stop offset="100%" stopColor="#9a7a5a" />
        </linearGradient>

        <linearGradient id="leafGrad" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7a9c5e" />
          <stop offset="100%" stopColor="#2a3e22" />
        </linearGradient>

        <radialGradient id="fairyGlow">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffc878" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="vignette" cx="0.5" cy="0.55" r="0.7">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>

        <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="warmGlow" cx="0.5" cy="0.85" r="0.55">
          <stop offset="0%" stopColor="#ffce8a" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffae6a" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="sunbeam" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffc878" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="hairShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff0c8" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffd078" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff0c8" stopOpacity="0" />
        </linearGradient>

        <clipPath id="windowGlassClip">
          <rect x="60" y="80" width="600" height="500" />
        </clipPath>
      </defs>

      {/* ============= WALL BACKGROUND ============= */}
      <rect width="720" height="1280" fill="url(#wallGrad)" />
      <rect width="720" height="1280" fill="url(#wallpaperPattern)" opacity="0.7" />

      {/* ============= TOP CEILING SHADOW ============= */}
      <rect x="0" y="0" width="720" height="80" fill="#3a1808" opacity="0.55" />
      <rect x="0" y="0" width="720" height="120" fill="url(#wallShadow)" />

      {/* ============= WINDOW FRAME (back / outline) ============= */}
      <WindowFrameBack />

      {/* ============= WINDOW (GLASS / SKY / HILLS — clipped) ============= */}
      <g clipPath="url(#windowGlassClip)">
        {/* sky */}
        <rect x="60" y="80" width="600" height="500" fill="url(#skyGrad)" />
        {/* sun/moon */}
        <g style={{ transformOrigin: '360px 200px', animation: 'sunBreathe 14s ease-in-out infinite' }}>
          <circle cx="360" cy={palette.sunY} r="160" fill="url(#sunGlow)" />
          <circle cx="360" cy={palette.sunY} r="36" fill={palette.sun} opacity="0.95" />
          {isNight && (
            <>
              <circle cx="346" cy={palette.sunY - 12} r="6" fill="#3a2848" opacity="0.55" />
              <circle cx="372" cy={palette.sunY + 4} r="9" fill="#3a2848" opacity="0.45" />
              <circle cx="356" cy={palette.sunY + 18} r="5" fill="#3a2848" opacity="0.5" />
            </>
          )}
        </g>

        {isNight && <Stars />}

        {/* drifting clouds */}
        <g opacity="0.92" style={{ animation: 'cloudDriftA 110s linear infinite' }}>
          <Cloud cx={120} cy={170} scale={1.2} fill="#ffe5b8" opacity={0.55} />
          <Cloud cx={420} cy={140} scale={0.85} fill="#ffd8a8" opacity={0.5} />
          <Cloud cx={680} cy={210} scale={1.1} fill="#ffe5b8" opacity={0.55} />
        </g>
        <g opacity="0.7" style={{ animation: 'cloudDriftB 160s linear infinite' }}>
          <Cloud cx={200} cy={250} scale={0.9} fill="#fff0d0" opacity={0.45} />
          <Cloud cx={520} cy={280} scale={1} fill="#ffd8a0" opacity={0.45} />
          <Cloud cx={800} cy={240} scale={0.8} fill="#fff0d0" opacity={0.4} />
        </g>

        {/* MALVERN HILLS */}
        <MalvernHills seed={seed} />

        {/* atmospheric haze */}
        <rect x="60" y="80" width="600" height="380" fill="url(#hazeGrad)" pointerEvents="none" />

        {/* sunbeam through window */}
        <path d="M 60 80 L 660 220 L 660 580 L 60 580 Z" fill="url(#sunbeam)" opacity="0.6" pointerEvents="none" />

        <RainDroplets active={hour < 9 || hour > 17} />

        <rect x="60" y="80" width="600" height="500" fill="url(#glassReflection)" pointerEvents="none" />
      </g>

      {/* ============= WINDOW FRAME (front / mullions) ============= */}
      <WindowFrameFront />

      {/* ============= WINDOW SILL ============= */}
      <WindowSill />

      {/* ============= MURPHY ON SILL ============= */}
      <MurphyOnSill alert={isEvening} />

      {/* ============= CURTAINS ============= */}
      <Curtains />

      {/* ============= FAIRY LIGHTS ============= */}
      <FairyLights />

      {/* ============= BUNTING above window ============= */}
      <Bunting />

      {/* ============= POLAROIDS ON WALL (around window edges) ============= */}
      <PolaroidWall />

      {/* ============= WALL CALENDAR / COUNTDOWN CHALKBOARD ============= */}
      <WallChalkboard daysRemaining={daysRemaining} />

      {/* ============= WALL CLOCK ============= */}
      <WallClock now={now} />

      {/* ============= HANGING PLANT (top corners) ============= */}
      <HangingPlant />

      {/* ============= WARM AMBIENT GLOW ============= */}
      <rect width="720" height="1280" fill="url(#warmGlow)" pointerEvents="none" />

      {/* ============= LIGHT POOL ON FLOOR ============= */}
      <ellipse cx="360" cy="1180" rx="380" ry="80" fill="url(#floorPool)" pointerEvents="none" />

      {/* ============= FLOOR ============= */}
      <Floor />

      {/* ============= LAMP (in front of window) ============= */}
      <Lamp />

      {/* ============= DESK ============= */}
      <Desk />

      {/* ============= HETTIE ============= */}
      <Hettie />

      {/* ============= STEAM FROM MUG ============= */}
      <Steam />

      {/* ============= MUSIC NOTES ============= */}
      <MusicNotes />

      {/* ============= DUST MOTES ============= */}
      <DustMotes />

      {/* ============= TINT + VIGNETTE ============= */}
      <rect width="720" height="1280" fill={palette.tint} opacity="0.16" pointerEvents="none" />
      <rect width="720" height="1280" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  );
}

/* =================================================================================
   SUB-COMPONENTS
   ================================================================================= */

function Cloud({ cx, cy, scale, fill, opacity = 0.6 }: { cx: number; cy: number; scale: number; fill: string; opacity?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="60" ry="14" fill={fill} />
      <ellipse cx="-30" cy="-6" rx="32" ry="14" fill={fill} />
      <ellipse cx="20" cy="-10" rx="36" ry="16" fill={fill} />
      <ellipse cx="50" cy="-2" rx="28" ry="12" fill={fill} />
    </g>
  );
}

function Stars() {
  const stars = [
    { x: 100, y: 130, r: 1.2, d: 0 }, { x: 180, y: 150, r: 0.9, d: 1.2 }, { x: 260, y: 110, r: 1.4, d: 0.5 },
    { x: 340, y: 145, r: 1, d: 1.8 }, { x: 420, y: 120, r: 1.1, d: 0.9 }, { x: 500, y: 160, r: 0.8, d: 2.1 },
    { x: 580, y: 130, r: 1.2, d: 1.4 }, { x: 640, y: 110, r: 0.7, d: 1.7 },
    { x: 130, y: 220, r: 0.8, d: 2.4 }, { x: 250, y: 250, r: 1, d: 0.7 }, { x: 380, y: 270, r: 0.9, d: 1.5 },
    { x: 510, y: 230, r: 1.1, d: 0.4 }, { x: 600, y: 260, r: 0.8, d: 2.0 },
    { x: 200, y: 320, r: 0.7, d: 1.3 }, { x: 460, y: 340, r: 0.9, d: 0.6 },
  ];
  return <g>{stars.map((s, i) => (
    <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff8e0"
      style={{ animation: `starTwinkle ${3 + (i % 4) * 0.6}s ease-in-out infinite`, animationDelay: `${s.d}s` }} />
  ))}</g>;
}

function MalvernHills({ seed }: { seed: number }) {
  const sheep = (seed % 3) + 2;
  return (
    <g>
      {/* Far ridge — Worcestershire Beacon profile */}
      <path
        d="M 60 460 L 60 360 L 110 340 L 160 326 L 200 320 L 240 308 L 280 286 L 320 264 L 360 242 L 390 226 L 420 230 L 450 246 L 480 262 L 520 278 L 560 294 L 600 310 L 640 330 L 660 344 L 660 460 Z"
        fill="url(#hillFar)" opacity="0.78"
      />
      {/* Mid ridge */}
      <path
        d="M 60 490 L 60 388 L 100 376 L 140 362 L 180 348 L 230 336 L 270 328 L 310 318 L 350 306 L 390 296 L 430 304 L 470 318 L 510 338 L 550 358 L 590 376 L 630 392 L 660 404 L 660 490 Z"
        fill="url(#hillMid)"
      />
      {/* Near hill */}
      <path
        d="M 60 580 L 60 440 L 110 430 L 160 422 L 210 418 L 260 410 L 310 402 L 360 390 L 400 382 L 430 388 L 470 402 L 510 420 L 550 438 L 590 452 L 630 464 L 660 472 L 660 580 Z"
        fill="url(#hillNear)"
      />
      {/* Hedgerow line */}
      <path
        d="M 60 510 Q 120 502 180 508 Q 260 514 340 508 Q 420 502 500 510 Q 580 518 660 512"
        fill="none" stroke="#2a3a22" strokeWidth="3" opacity="0.45"
      />
      {/* Foreground TREES — silhouettes for depth */}
      <g>
        {/* big oak left */}
        <g transform="translate(110 540)">
          <path d="M -2 0 Q -3 30 0 50" stroke="#1a1408" strokeWidth="3" fill="none" />
          <ellipse cx="-2" cy="-12" rx="22" ry="20" fill="#1a2818" />
          <ellipse cx="-12" cy="-18" rx="14" ry="14" fill="#1a2818" />
          <ellipse cx="8" cy="-22" rx="14" ry="14" fill="#1a2818" />
          <ellipse cx="0" cy="-30" rx="12" ry="10" fill="#22321e" opacity="0.85" />
        </g>
        {/* tall pine right */}
        <g transform="translate(620 540)">
          <path d="M 0 0 L 0 50" stroke="#1a1408" strokeWidth="3" fill="none" />
          <path d="M 0 -32 L -10 -8 L 10 -8 Z" fill="#1a2818" />
          <path d="M 0 -22 L -14 8 L 14 8 Z" fill="#1a2818" />
          <path d="M 0 -10 L -12 18 L 12 18 Z" fill="#1a2818" />
        </g>
      </g>
      {/* fence posts in mid-distance */}
      <g opacity="0.45">
        {[180, 240, 300, 380, 440, 500].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="510" x2={x} y2="530" stroke="#3a2418" strokeWidth="1.2" />
          </g>
        ))}
        <line x1="180" y1="518" x2="500" y2="518" stroke="#3a2418" strokeWidth="0.8" />
        <line x1="180" y1="524" x2="500" y2="524" stroke="#3a2418" strokeWidth="0.8" />
      </g>
      {/* Trees on ridge */}
      {[120, 180, 260, 340, 420, 500, 580, 640].map((x, i) => (
        <g key={i} transform={`translate(${x + (i % 2) * 4} ${488 + (i % 3) * 4})`}>
          <ellipse cx="0" cy="-4" rx="3" ry="6" fill="#2a3a22" opacity="0.7" />
          <ellipse cx="0" cy="-2" rx="2" ry="4" fill="#3a4e2a" opacity="0.85" />
        </g>
      ))}
      {/* Sheep */}
      {Array.from({ length: sheep }).map((_, i) => (
        <g key={i} transform={`translate(${200 + i * 90} ${478 - (i % 2) * 8})`}>
          <ellipse cx="0" cy="0" rx="3.5" ry="2.4" fill="#f4ead8" opacity="0.9" />
          <circle cx="-2.6" cy="-0.6" r="1.2" fill="#3a2418" opacity="0.7" />
          <line x1="-2" y1="2" x2="-2" y2="3.5" stroke="#3a2418" strokeWidth="0.5" />
          <line x1="2" y1="2" x2="2" y2="3.5" stroke="#3a2418" strokeWidth="0.5" />
        </g>
      ))}
      {/* Path winding */}
      <path d="M 320 580 Q 360 530 380 480 Q 400 430 380 400" stroke="#c89c70" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M 320 580 Q 360 530 380 480 Q 400 430 380 400" stroke="#fde0b8" strokeWidth="1.4" fill="none" opacity="0.3" />
      {/* Dry stone wall */}
      <path d="M 60 532 Q 130 538 200 535 Q 280 530 360 540" stroke="#8a8678" strokeWidth="2" fill="none" opacity="0.4" />
    </g>
  );
}

function RainDroplets({ active }: { active: boolean }) {
  if (!active) return null;
  const drops = Array.from({ length: 14 }, (_, i) => ({
    x: 80 + (i * 47) % 560,
    y: 90 + (i * 31) % 200,
    d: (i * 0.5) % 7,
    dur: 6 + (i % 5),
  }));
  return (
    <g opacity="0.6">
      {drops.map((dp, i) => (
        <g key={i} style={{ animation: `dropSlide ${dp.dur}s linear infinite`, animationDelay: `${dp.d}s` }}>
          <ellipse cx={dp.x} cy={dp.y} rx="1.3" ry="2.4" fill="#cfe6f0" opacity="0.7" />
          <path d={`M ${dp.x} ${dp.y} Q ${dp.x - 1} ${dp.y + 8} ${dp.x} ${dp.y + 14}`}
            stroke="#cfe6f0" strokeWidth="0.5" fill="none" opacity="0.45" />
        </g>
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={`c${i}`} cx={80 + (i * 37) % 560} cy={90 + (i * 53) % 470}
          r={0.6 + (i % 3) * 0.3} fill="#ffffff" opacity="0.18" />
      ))}
    </g>
  );
}

/* WindowFrameBack — drawn BEHIND the glass content. Provides the wooden border around the window. */
function WindowFrameBack() {
  return (
    <g>
      {/* outer wood frame as a hollow border (4 thin rects) */}
      {/* top */}
      <rect x="48" y="68" width="624" height="14" fill="url(#frameGrad)" />
      {/* bottom */}
      <rect x="48" y="578" width="624" height="14" fill="url(#frameGrad)" />
      {/* left */}
      <rect x="48" y="68" width="14" height="524" fill="url(#frameGrad)" />
      {/* right */}
      <rect x="658" y="68" width="14" height="524" fill="url(#frameGrad)" />
      {/* highlights/shadows on edges */}
      <rect x="48" y="68" width="624" height="3" fill="#7a4830" opacity="0.65" />
      <rect x="48" y="68" width="3" height="524" fill="#1a0e08" opacity="0.65" />
      <rect x="669" y="68" width="3" height="524" fill="#1a0e08" opacity="0.55" />
      <rect x="48" y="589" width="624" height="3" fill="#1a0e08" opacity="0.55" />
    </g>
  );
}

/* WindowFrameFront — drawn IN FRONT of the glass content (mullions and inner trim). */
function WindowFrameFront() {
  return (
    <g>
      {/* CENTRAL VERTICAL MULLION — splits window into 2 panes */}
      <rect x="356" y="80" width="8" height="500" fill="url(#frameGrad)" />
      <rect x="356" y="80" width="8" height="3" fill="#7a4830" opacity="0.7" />
      <rect x="356" y="80" width="2" height="500" fill="#1a0e08" opacity="0.5" />
      <rect x="362" y="80" width="2" height="500" fill="#7a4830" opacity="0.4" />

      {/* HIGH HORIZONTAL MULLION — splits sky band off, well above the hills (y=200) */}
      <rect x="60" y="196" width="600" height="6" fill="url(#frameGrad)" opacity="0.92" />
      <rect x="60" y="196" width="600" height="2" fill="#7a4830" opacity="0.65" />
      <rect x="60" y="200" width="600" height="2" fill="#1a0e08" opacity="0.45" />

      {/* inner trim highlights along top inside */}
      <rect x="62" y="82" width="596" height="2" fill="#ffce8a" opacity="0.4" />
    </g>
  );
}

function WindowSill() {
  return (
    <g>
      {/* sill top */}
      <rect x="36" y="582" width="648" height="20" fill="#7a4828" />
      <rect x="36" y="582" width="648" height="4" fill="#a06a4e" />
      <rect x="28" y="602" width="664" height="18" fill="#5a3420" />
      {/* shadow under sill */}
      <rect x="36" y="620" width="648" height="6" fill="#000" opacity="0.45" />

      {/* small potted plant on left of sill */}
      <g style={{ transformOrigin: '110px 600px', animation: 'leafSwayA 9s ease-in-out infinite' }}>
        <path d="M 88 596 L 132 596 L 128 622 L 92 622 Z" fill="#7a3e22" />
        <ellipse cx="110" cy="596" rx="22" ry="4" fill="#5a2a14" />
        <path d="M 92 594 Q 82 564 92 539" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="86" cy="554" rx="6" ry="13" fill="url(#leafGrad)" transform="rotate(-30 86 554)" />
        <ellipse cx="94" cy="546" rx="5" ry="12" fill="#7a9c5e" transform="rotate(-15 94 546)" />
        <path d="M 128 594 Q 138 564 130 539" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="132" cy="556" rx="6" ry="14" fill="url(#leafGrad)" transform="rotate(25 132 556)" />
        <ellipse cx="138" cy="566" rx="5" ry="12" fill="#7a9c5e" transform="rotate(35 138 566)" />
        <path d="M 110 594 Q 112 572 110 552" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="108" cy="556" rx="6" ry="14" fill="#8aae6a" />
        <ellipse cx="114" cy="566" rx="5" ry="11" fill="#7a9c5e" transform="rotate(15 114 566)" />
      </g>

      {/* Book on right of sill */}
      <g transform="translate(60 580)">
        <rect width="62" height="14" fill="#8a3838" rx="1" />
        <rect width="62" height="3" fill="#6a2828" />
        <line x1="2" y1="2" x2="60" y2="2" stroke="#5a1a1a" strokeWidth="0.4" />
        <line x1="2" y1="11" x2="60" y2="11" stroke="#5a1a1a" strokeWidth="0.4" />
        <text x="31" y="10" textAnchor="middle" fontSize="6" fill="#fff8e0" fontFamily="serif">poetry</text>
      </g>
    </g>
  );
}

function MurphyOnSill({ alert: _alert }: { alert: boolean }) {
  // Murphy sits upright on the LEFT half of the sill, in 3/4 view facing slightly right (toward viewer / Hettie below).
  // Sill top is at y=582. Murphy's bum on sill at y=580, body extends up to y=440, head at y=440-510.
  return (
    <g style={{ transformOrigin: '200px 540px', animation: 'breathe 5s ease-in-out infinite' }}>
      {/* TAIL — peeking from his right side, curled up */}
      <g style={{ transformOrigin: '290px 580px', animation: 'tailSwishGentle 4.5s ease-in-out infinite' }}>
        <path d="M 270 588 Q 296 568 310 540 Q 314 530 304 530 Q 286 552 268 580 Q 264 586 270 588 Z" fill="url(#murphyCoat)" />
        <path d="M 296 552 Q 302 548 308 540" stroke="#0a0605" strokeWidth="0.7" fill="none" opacity="0.6" />
      </g>

      {/* BACK / RUMP sitting on sill */}
      <ellipse cx="240" cy="568" rx="56" ry="20" fill="url(#murphyCoat)" />

      {/* SITTING BODY — torso rising from rump up to neck */}
      <path d="M 184 564 Q 156 540 156 506 Q 156 472 178 460 Q 218 452 240 466 Q 264 478 268 510 Q 268 540 252 562 Q 220 580 184 564 Z" fill="url(#murphyCoat)" />
      {/* belly shading */}
      <path d="M 188 524 Q 210 510 240 516 Q 258 524 256 548 Q 232 562 200 558 Q 184 548 188 524 Z" fill="url(#murphyBelly)" opacity="0.85" />

      {/* HEAD — slightly cocked to viewer's right */}
      <g style={{ transformOrigin: '212px 478px', animation: 'headTilt 12s ease-in-out infinite' }}>
        {/* skull */}
        <ellipse cx="212" cy="470" rx="44" ry="40" fill="url(#murphyCoat)" />
        {/* highlight on top of head */}
        <ellipse cx="220" cy="448" rx="22" ry="10" fill="#3a2e26" opacity="0.7" />

        {/* MUZZLE — pointing forward-right */}
        <path d="M 222 488 Q 256 488 270 502 Q 270 518 256 522 Q 232 522 218 514 Q 212 502 222 488 Z" fill="#1a120e" />
        <path d="M 232 514 Q 252 520 268 514" stroke="#0a0605" strokeWidth="0.8" fill="none" opacity="0.55" />
        {/* nose */}
        <ellipse cx="266" cy="500" rx="7" ry="5.5" fill="#0a0605" />
        <ellipse cx="264" cy="498" rx="2" ry="1.2" fill="#5a4a3a" opacity="0.7" />
        {/* mouth */}
        <path d="M 248 514 Q 256 522 264 516" stroke="#0a0605" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
        {/* tongue */}
        <ellipse cx="256" cy="520" rx="3" ry="1.6" fill="#c95a4a" opacity="0.55" />

        {/* EYES — large puppy eyes facing forward */}
        {/* left eye (further from viewer, smaller) */}
        <g>
          <ellipse cx="200" cy="470" rx="6" ry="4.5" fill="#fff8e0" opacity="0.35" />
          <ellipse cx="200" cy="471" rx="4.5" ry="3.6" fill="#1a0e08" />
          <ellipse cx="200" cy="471" rx="3.4" ry="2.6" fill="url(#murphyEye)" />
          <circle cx="201.5" cy="469.5" r="1.4" fill="#fff8e0" />
          <circle cx="199.5" cy="472" r="0.6" fill="#fff" opacity="0.7" />
        </g>
        {/* right eye (closer to viewer, larger) */}
        <g>
          <ellipse cx="234" cy="468" rx="7" ry="5" fill="#fff8e0" opacity="0.35" />
          <ellipse cx="234" cy="469" rx="5.4" ry="4" fill="#1a0e08" />
          <ellipse cx="234" cy="469" rx="4.4" ry="3.2" fill="url(#murphyEye)" />
          <circle cx="236" cy="467" r="1.7" fill="#fff8e0" />
          <circle cx="233" cy="470.5" r="0.7" fill="#fff" opacity="0.7" />
        </g>

        {/* eyebrows */}
        <path d="M 192 462 Q 200 458 208 462" stroke="#0a0605" strokeWidth="1.1" fill="none" opacity="0.5" />
        <path d="M 226 460 Q 234 456 244 460" stroke="#0a0605" strokeWidth="1.2" fill="none" opacity="0.55" />

        {/* whiskers */}
        <path d="M 220 504 L 200 500 M 220 508 L 198 510 M 222 512 L 200 516" stroke="#5a4030" strokeWidth="0.4" opacity="0.6" />

        {/* BIG FLOPPY EARS — hanging down beside face */}
        <g style={{ transformOrigin: '170px 446px', animation: 'earSway 6s ease-in-out infinite' }}>
          <path
            d="M 168 444
               Q 138 478 132 540
               Q 130 562 154 568
               Q 184 562 196 530
               Q 202 488 196 444 Z"
            fill="url(#murphyCoat)"
          />
          <path d="M 144 552 Q 138 562 148 572 M 158 558 Q 152 568 162 574 M 174 552 Q 170 562 174 568" stroke="#0a0605" strokeWidth="0.8" fill="none" opacity="0.55" />
          <path d="M 168 462 Q 152 502 152 548" stroke="#0a0605" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M 180 462 Q 170 500 168 540" stroke="#3a2e26" strokeWidth="0.7" fill="none" opacity="0.6" />
        </g>
        <g style={{ transformOrigin: '252px 446px', animation: 'earSwayB 7s ease-in-out infinite' }}>
          <path
            d="M 250 444
               Q 280 478 286 530
               Q 290 552 270 558
               Q 252 552 244 528
               Q 240 488 246 444 Z"
            fill="url(#murphyCoat)"
          />
          <path d="M 256 462 Q 268 500 270 538" stroke="#0a0605" strokeWidth="0.8" fill="none" opacity="0.5" />
        </g>
      </g>

      {/* WHITE CHEST — visible patch in center */}
      <path d="M 200 528 Q 220 522 240 528 Q 246 548 232 558 Q 214 562 198 554 Q 192 540 200 528 Z" fill="#f5ebe0" opacity="0.9" />
      <path d="M 208 540 Q 222 540 232 542" stroke="#dccab0" strokeWidth="0.5" fill="none" opacity="0.6" />

      {/* FRONT PAWS — resting on sill */}
      <g>
        <ellipse cx="206" cy="580" rx="13" ry="7" fill="#1a120e" />
        <ellipse cx="208" cy="584" rx="8" ry="3" fill="#f5ebe0" opacity="0.95" />
        <line x1="204" y1="582" x2="204" y2="586" stroke="#3d2818" strokeWidth="0.6" />
        <line x1="208" y1="582" x2="208" y2="586" stroke="#3d2818" strokeWidth="0.6" />
        <line x1="212" y1="582" x2="212" y2="586" stroke="#3d2818" strokeWidth="0.6" />

        <ellipse cx="244" cy="580" rx="13" ry="7" fill="#1a120e" />
        <ellipse cx="248" cy="584" rx="8" ry="3" fill="#f5ebe0" opacity="0.95" />
        <line x1="240" y1="582" x2="240" y2="586" stroke="#3d2818" strokeWidth="0.6" />
        <line x1="244" y1="582" x2="244" y2="586" stroke="#3d2818" strokeWidth="0.6" />
        <line x1="248" y1="582" x2="248" y2="586" stroke="#3d2818" strokeWidth="0.6" />
      </g>

      {/* COLLAR */}
      <path d="M 188 522 Q 220 532 250 522" stroke="#c75a4a" strokeWidth="3.4" fill="none" />
      <path d="M 188 522 Q 220 532 250 522" stroke="#a84030" strokeWidth="1.2" fill="none" opacity="0.5" />
      <circle cx="220" cy="532" r="3" fill="#fcd092" />
      <circle cx="220" cy="532" r="1.4" fill="#a87030" opacity="0.7" />

      {/* RIM LIGHT from sky behind */}
      <path d="M 252 446 Q 286 480 290 540" stroke="url(#murphyRim)" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 270 560 Q 280 570 290 580" stroke="url(#murphyRim)" strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M 232 444 Q 250 440 264 444" stroke="#fff4d8" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
    </g>
  );
}

function Curtains() {
  return (
    <g>
      {/* curtain rod */}
      <rect x="20" y="56" width="680" height="6" rx="3" fill="#3a2418" />
      <circle cx="20" cy="59" r="8" fill="#3a2418" />
      <circle cx="700" cy="59" r="8" fill="#3a2418" />

      {/* left curtain */}
      <g style={{ transformOrigin: '50px 60px', animation: 'curtainSway 14s ease-in-out infinite' }}>
        <path d="M 20 62 Q 18 320 26 600 L 50 600 Q 48 340 50 62 Z" fill="url(#curtainGrad)" />
        <path d="M 26 80 Q 24 320 28 590" stroke="#3a1828" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M 38 80 Q 36 320 40 590" stroke="#3a1828" strokeWidth="0.6" fill="none" opacity="0.5" />
        <path d="M 20 62 Q 18 320 26 600 L 50 600" fill="url(#curtainShadow)" opacity="0.6" />
      </g>
      {/* right curtain */}
      <g style={{ transformOrigin: '670px 60px', animation: 'curtainSway 16s ease-in-out infinite reverse' }}>
        <path d="M 670 62 Q 672 320 670 600 L 700 600 Q 706 320 700 62 Z" fill="url(#curtainGrad)" />
        <path d="M 678 80 Q 680 320 678 590" stroke="#3a1828" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M 692 80 Q 694 320 692 590" stroke="#3a1828" strokeWidth="0.6" fill="none" opacity="0.5" />
      </g>
      {/* tie-back */}
      <ellipse cx="36" cy="320" rx="6" ry="14" fill="#5a1d2a" opacity="0.85" />
      <ellipse cx="688" cy="320" rx="6" ry="14" fill="#5a1d2a" opacity="0.85" />
    </g>
  );
}

function FairyLights() {
  const beads = [
    { x: 60, y: 86 }, { x: 120, y: 92 }, { x: 180, y: 96 }, { x: 240, y: 94 },
    { x: 300, y: 90 }, { x: 360, y: 88 }, { x: 420, y: 90 }, { x: 480, y: 92 },
    { x: 540, y: 96 }, { x: 600, y: 92 }, { x: 660, y: 86 },
  ];
  return (
    <g>
      <path d="M 50 76 Q 200 102 360 92 Q 520 82 670 88" stroke="#3a2418" strokeWidth="0.6" fill="none" opacity="0.65" />
      {beads.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r="11" fill="url(#fairyGlow)"
            style={{ animation: `fairyPulse ${2.5 + (i % 4) * 0.4}s ease-in-out infinite`, animationDelay: `${(i * 0.3) % 2}s` }} />
          <circle cx={b.x} cy={b.y} r="2.6" fill="#fff4d6" />
          <circle cx={b.x} cy={b.y} r="1.2" fill="#fff8e8" />
        </g>
      ))}
    </g>
  );
}

function PolaroidWall() {
  // polaroids hung on left/right wall sides next to window
  return (
    <g opacity="0.95">
      {/* left side stack */}
      <g transform="translate(-2 380)">
        {/* string */}
        <path d="M 6 -10 Q 30 -4 56 -8" stroke="#3a2418" strokeWidth="0.5" fill="none" opacity="0.5" />
        <g transform="translate(4 0) rotate(-6)">
          <rect width="38" height="46" fill="#fbf1e0" rx="1.5" />
          <rect x="3" y="3" width="32" height="32" fill="#7a8aa0" />
          <path d="M 3 22 L 35 22 L 35 35 L 3 35 Z" fill="#5a7088" />
          <path d="M 3 14 Q 12 12 20 16 Q 28 18 35 14 L 35 22 L 3 22 Z" fill="#3a4a5a" opacity="0.85" />
          <text x="19" y="42" textAnchor="middle" fontSize="5" fill="#5a3424" fontFamily="Caveat, cursive">garda</text>
        </g>
      </g>

      {/* right side */}
      <g transform="translate(670 360) rotate(4)">
        <rect width="42" height="50" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="36" height="36" fill="#1a1410" />
        {/* tiny murphy */}
        <ellipse cx="22" cy="28" rx="11" ry="7" fill="#2a1e16" />
        <ellipse cx="16" cy="22" rx="6.5" ry="6.5" fill="#2a1e16" />
        <ellipse cx="13" cy="24" rx="3" ry="5" fill="#1a1410" />
        <ellipse cx="19" cy="24" rx="3" ry="5" fill="#1a1410" />
        <circle cx="14.5" cy="22" r="0.6" fill="#fff" opacity="0.7" />
        <circle cx="17.5" cy="22" r="0.6" fill="#fff" opacity="0.7" />
        <ellipse cx="11" cy="25" rx="1.4" ry="0.8" fill="#0a0605" />
        <text x="22" y="46" textAnchor="middle" fontSize="5" fill="#5a3424" fontFamily="Caveat, cursive">murphy</text>
      </g>

      {/* heart polaroid lower right */}
      <g transform="translate(670 460) rotate(-3)">
        <rect width="38" height="46" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="32" height="32" fill="#c97844" />
        <path d="M 19 14 q -5 -5 -8 -1 q -3 4 8 13 q 11 -9 8 -13 q -3 -4 -8 1 Z" fill="#fff4d8" opacity="0.92" />
        <text x="19" y="42" textAnchor="middle" fontSize="5" fill="#5a3424" fontFamily="Caveat, cursive">us</text>
      </g>

      {/* tape pieces */}
      <rect x="14" y="376" width="10" height="5" fill="#fce4a8" opacity="0.7" />
      <rect x="680" y="356" width="10" height="5" fill="#fce4a8" opacity="0.7" />
      <rect x="680" y="456" width="10" height="5" fill="#fce4a8" opacity="0.7" />

      {/* postcard at upper-left */}
      <g transform="translate(-4 200) rotate(-4)">
        <rect width="68" height="44" fill="#fef8e0" rx="1.5" />
        <rect width="68" height="14" fill="#9ec3df" />
        <path d="M 0 12 L 14 8 L 28 12 L 42 6 L 56 10 L 68 6 L 68 14 L 0 14 Z" fill="#5a7e4a" />
        <text x="34" y="26" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">malvern</text>
        <text x="34" y="36" textAnchor="middle" fontSize="4" fill="#5a3424" fontFamily="Caveat, cursive" fontStyle="italic">wish u were here</text>
        <rect x="56" y="20" width="10" height="12" fill="#c97844" stroke="#fff" strokeWidth="0.7" />
      </g>
    </g>
  );
}

function WallChalkboard({ daysRemaining }: { daysRemaining: number }) {
  // small chalkboard hanging on right wall side, between sill and desk
  return (
    <g transform="translate(560 700) rotate(4)">
      {/* string from above */}
      <line x1="50" y1="-12" x2="20" y2="0" stroke="#3a2418" strokeWidth="0.7" opacity="0.7" />
      <line x1="50" y1="-12" x2="80" y2="0" stroke="#3a2418" strokeWidth="0.7" opacity="0.7" />

      {/* wood frame */}
      <rect x="-2" y="-2" width="104" height="80" fill="#5a3018" rx="3" />
      <rect x="-2" y="-2" width="104" height="3" fill="#7a4830" opacity="0.6" />
      {/* slate */}
      <rect x="4" y="4" width="92" height="70" fill="#1f2a26" rx="1.5" />
      {/* chalk text */}
      <text x="50" y="24" textAnchor="middle" fontSize="11" fill="#fff8e0" fontFamily="Caveat, cursive" opacity="0.9">days till</text>
      <text x="50" y="34" textAnchor="middle" fontSize="11" fill="#fff8e0" fontFamily="Caveat, cursive" opacity="0.9">you're home</text>
      <text x="50" y="64" textAnchor="middle" fontSize="28" fontWeight="500" fill="#fff8e0" fontFamily="Caveat, cursive">{daysRemaining}</text>
      {/* tiny chalk smudges */}
      <circle cx="12" cy="68" r="0.6" fill="#fff8e0" opacity="0.4" />
      <circle cx="86" cy="14" r="0.5" fill="#fff8e0" opacity="0.5" />
      <path d="M 8 44 q 4 -1 8 0" stroke="#fff8e0" strokeWidth="0.4" fill="none" opacity="0.3" />
      <path d="M 84 56 q -4 -1 -8 0" stroke="#fff8e0" strokeWidth="0.4" fill="none" opacity="0.3" />
    </g>
  );
}

/* Wall clock on left side */
function WallClock({ now }: { now: Date }) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const hourAngle = (h + m / 60) * 30; // 360/12
  const minAngle = m * 6; // 360/60
  return (
    <g transform="translate(80 656)">
      {/* shadow */}
      <circle cx="46" cy="48" r="40" fill="#1a0a06" opacity="0.4" />
      {/* outer ring */}
      <circle cx="44" cy="46" r="40" fill="#3a2418" />
      <circle cx="44" cy="46" r="36" fill="#fbf1e0" />
      <circle cx="44" cy="46" r="36" fill="#0a0605" opacity="0.05" />
      {/* hour marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const x1 = 44 + Math.cos(a) * 32;
        const y1 = 46 + Math.sin(a) * 32;
        const x2 = 44 + Math.cos(a) * 28;
        const y2 = 46 + Math.sin(a) * 28;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3a2418" strokeWidth={i % 3 === 0 ? 1.6 : 0.8} />;
      })}
      {/* hour hand */}
      <line x1="44" y1="46"
        x2={44 + Math.cos((hourAngle - 90) * Math.PI / 180) * 18}
        y2={46 + Math.sin((hourAngle - 90) * Math.PI / 180) * 18}
        stroke="#3a2418" strokeWidth="2.4" strokeLinecap="round" />
      {/* minute hand */}
      <line x1="44" y1="46"
        x2={44 + Math.cos((minAngle - 90) * Math.PI / 180) * 26}
        y2={46 + Math.sin((minAngle - 90) * Math.PI / 180) * 26}
        stroke="#3a2418" strokeWidth="1.6" strokeLinecap="round" />
      {/* center cap */}
      <circle cx="44" cy="46" r="2.4" fill="#c75a4a" />
      {/* highlight */}
      <ellipse cx="36" cy="32" rx="14" ry="8" fill="#ffffff" opacity="0.18" />
    </g>
  );
}

/* Bunting along top of room (above the window) */
function Bunting() {
  const colors = ['#c75a4a', '#fbe2ba', '#9abe7a', '#a85970', '#fce4a8', '#5a7e4a', '#c75a4a', '#fbe2ba', '#9abe7a', '#a85970'];
  return (
    <g>
      {/* drooping string */}
      <path d="M 60 30 Q 200 80 360 70 Q 520 80 660 30" stroke="#7a4830" strokeWidth="1" fill="none" opacity="0.75" />
      {colors.map((c, i) => {
        const t = i / (colors.length - 1);
        const x = 60 + t * 600;
        const y = 30 + Math.sin(t * Math.PI) * 50;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 2 === 0 ? -10 : 10)})`}>
            <path d="M -10 0 L 10 0 L 0 22 Z" fill={c} opacity="0.95" />
            <path d="M -10 0 L 10 0 L 0 4 Z" fill="#000" opacity="0.25" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#5a3424" strokeWidth="0.4" opacity="0.55" />
          </g>
        );
      })}
    </g>
  );
}

function HangingPlant() {
  return (
    <g transform="translate(36 0)" style={{ transformOrigin: '36px 80px', animation: 'leafSwayA 11s ease-in-out infinite' }}>
      <line x1="0" y1="0" x2="-10" y2="80" stroke="#5a3424" strokeWidth="0.6" />
      <line x1="0" y1="0" x2="10" y2="80" stroke="#5a3424" strokeWidth="0.6" />
      <line x1="0" y1="0" x2="0" y2="78" stroke="#5a3424" strokeWidth="0.6" />
      <path d="M -18 80 L 18 80 L 14 104 L -14 104 Z" fill="#7a4828" />
      <ellipse cx="0" cy="80" rx="18" ry="4" fill="#5a3018" />
      <path d="M -14 80 Q -22 130 -28 180 Q -32 200 -26 198" stroke="#5a7e4a" strokeWidth="1.4" fill="none" />
      <ellipse cx="-18" cy="130" rx="3" ry="8" fill="#7a9c5e" transform="rotate(-30 -18 130)" />
      <ellipse cx="-22" cy="150" rx="3" ry="9" fill="#8aae6a" transform="rotate(-25 -22 150)" />
      <ellipse cx="-26" cy="178" rx="3" ry="8" fill="#7a9c5e" transform="rotate(-20 -26 178)" />
      <ellipse cx="-28" cy="200" rx="2.6" ry="7" fill="#6a8e4e" transform="rotate(-15 -28 200)" />

      <path d="M 14 80 Q 24 144 32 200" stroke="#5a7e4a" strokeWidth="1.4" fill="none" />
      <ellipse cx="20" cy="130" rx="3" ry="8" fill="#8aae6a" transform="rotate(25 20 130)" />
      <ellipse cx="26" cy="158" rx="3" ry="9" fill="#7a9c5e" transform="rotate(28 26 158)" />
      <ellipse cx="30" cy="186" rx="3" ry="8" fill="#9abe7a" transform="rotate(30 30 186)" />

      <path d="M 0 80 Q 2 130 4 170" stroke="#5a7e4a" strokeWidth="1.4" fill="none" />
      <ellipse cx="2" cy="116" rx="4" ry="10" fill="#8aae6a" />
      <ellipse cx="4" cy="142" rx="3" ry="9" fill="#7a9c5e" transform="rotate(10 4 142)" />
      <ellipse cx="0" cy="78" rx="28" ry="12" fill="url(#leafGrad)" />
      <ellipse cx="-10" cy="74" rx="9" ry="12" fill="#8aae6a" />
      <ellipse cx="12" cy="74" rx="10" ry="14" fill="#9abe7a" />
    </g>
  );
}

function Floor() {
  return (
    <g>
      <rect x="0" y="1080" width="720" height="200" fill="url(#floorGrad)" />
      {[1110, 1140, 1170, 1200, 1230, 1260].map(yy => (
        <line key={yy} x1="0" y1={yy} x2="720" y2={yy} stroke="#2a1408" strokeWidth="0.6" opacity="0.5" />
      ))}
      {[120, 280, 440, 580].map((xx, i) => (
        <line key={xx} x1={xx} y1="1080" x2={xx + (i % 2 === 0 ? 14 : -10)} y2="1280" stroke="#2a1408" strokeWidth="0.5" opacity="0.4" />
      ))}

      {/* rug */}
      <g transform="translate(120 1130)">
        <ellipse cx="240" cy="80" rx="280" ry="48" fill="#6a2828" opacity="0.95" />
        <ellipse cx="240" cy="76" rx="240" ry="40" fill="#8a3838" />
        <ellipse cx="240" cy="76" rx="200" ry="32" fill="#3a1818" opacity="0.7" />
        <path d="M 70 76 Q 240 80 410 76" stroke="#fce4a8" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M 90 96 Q 240 100 390 96" stroke="#fce4a8" strokeWidth="1" fill="none" opacity="0.35" />
        {/* fringe */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={20 + i * 17} y1="124" x2={22 + i * 17} y2="138" stroke="#3a1808" strokeWidth="1" />
        ))}
      </g>

      {/* slippers — fluffy pink */}
      <g transform="translate(80 1190)">
        <ellipse cx="32" cy="20" rx="34" ry="8" fill="#1a0a06" opacity="0.5" />
        <path d="M 4 20 Q 0 8 14 4 Q 32 0 50 4 Q 64 8 60 20 Q 56 26 32 26 Q 8 26 4 20 Z" fill="#e89a96" />
        <path d="M 4 20 Q 0 14 12 12 Q 32 8 50 12 Q 60 16 60 20" stroke="#a85060" strokeWidth="0.6" fill="none" opacity="0.7" />
        {/* pom-pom */}
        <circle cx="22" cy="10" r="5" fill="#fdf0e8" opacity="0.95" />
        <circle cx="22" cy="10" r="5" fill="#f8d8c8" opacity="0.5" />
      </g>
      <g transform="translate(120 1196) rotate(8)">
        <ellipse cx="32" cy="20" rx="34" ry="8" fill="#1a0a06" opacity="0.5" />
        <path d="M 4 20 Q 0 8 14 4 Q 32 0 50 4 Q 64 8 60 20 Q 56 26 32 26 Q 8 26 4 20 Z" fill="#e89a96" />
        <circle cx="42" cy="10" r="5" fill="#fdf0e8" opacity="0.95" />
        <circle cx="42" cy="10" r="5" fill="#f8d8c8" opacity="0.5" />
      </g>

      {/* small dog bed for Murphy on right */}
      <g transform="translate(520 1180)">
        <ellipse cx="70" cy="44" rx="80" ry="14" fill="#1a0a06" opacity="0.4" />
        <path d="M 0 40 Q -4 14 30 8 Q 70 4 110 8 Q 144 14 140 40 Q 138 54 70 56 Q 4 54 0 40 Z" fill="#7a4828" />
        <path d="M 12 40 Q 8 22 36 18 Q 70 14 104 18 Q 132 22 128 40" stroke="#5a3018" strokeWidth="1" fill="none" opacity="0.6" />
        {/* cushion inside */}
        <ellipse cx="70" cy="40" rx="60" ry="14" fill="#dccab0" opacity="0.85" />
        <ellipse cx="70" cy="38" rx="56" ry="11" fill="#f4ead8" opacity="0.55" />
        {/* paw print on bed */}
        <g opacity="0.4" fill="#9a7a5a">
          <ellipse cx="70" cy="42" rx="3" ry="2.4" />
          <ellipse cx="64" cy="38" rx="1.4" ry="1.2" />
          <ellipse cx="68" cy="36" rx="1.4" ry="1.2" />
          <ellipse cx="72" cy="36" rx="1.4" ry="1.2" />
          <ellipse cx="76" cy="38" rx="1.4" ry="1.2" />
        </g>
      </g>
    </g>
  );
}

function Desk() {
  return (
    <g>
      {/* desktop surface */}
      <rect x="0" y="900" width="720" height="22" fill="url(#deskGrad)" />
      <rect x="0" y="900" width="720" height="3" fill="#a06a4e" opacity="0.7" />

      {/* desk apron */}
      <rect x="0" y="922" width="720" height="56" fill="#3a2010" />
      <rect x="0" y="922" width="720" height="3" fill="#5a3420" />

      {/* drawer */}
      <rect x="540" y="930" width="100" height="40" fill="#5a3420" />
      <rect x="540" y="930" width="100" height="2" fill="#7a4828" />
      <circle cx="590" cy="950" r="2.6" fill="#3a2010" />

      {/* notebook open — small, off to right of Hettie */}
      <g transform="translate(530 868) rotate(-5)">
        <rect width="120" height="36" fill="#fbf1e0" />
        <line x1="0" y1="0" x2="120" y2="0" stroke="#3a2418" strokeWidth="0.8" />
        <line x1="60" y1="0" x2="60" y2="36" stroke="#c8b8a0" strokeWidth="0.6" />
        {[8, 16, 24, 32].map(yy => (
          <line key={yy} x1="4" y1={yy} x2="56" y2={yy} stroke="#5c8aae" strokeWidth="0.35" opacity="0.6" />
        ))}
        {[8, 16, 24, 32].map(yy => (
          <line key={`r${yy}`} x1="64" y1={yy} x2="116" y2={yy} stroke="#5c8aae" strokeWidth="0.35" opacity="0.6" />
        ))}
        {/* handwriting scribbles */}
        <path d="M 6 14 Q 10 12 14 14 Q 18 16 22 14 Q 26 12 30 14 Q 34 16 38 14 Q 42 12 46 14" stroke="#3a2418" strokeWidth="0.5" fill="none" opacity="0.7" />
        <path d="M 6 22 Q 10 20 14 22 Q 18 24 22 22 Q 26 20 30 22" stroke="#3a2418" strokeWidth="0.5" fill="none" opacity="0.6" />
        <path d="M 6 30 Q 14 28 24 30 Q 34 32 42 30" stroke="#3a2418" strokeWidth="0.4" fill="none" opacity="0.55" />
        {/* doodle heart on right page */}
        <path d="M 86 14 q -3 -3 -5 0 q -2 3 5 8 q 7 -5 5 -8 q -2 -3 -5 0 Z" fill="#c75a4a" opacity="0.7" />
      </g>

      {/* coffee mug */}
      <g transform="translate(40 838)">
        <path d="M 0 0 L 50 0 L 46 64 L 4 64 Z" fill="url(#mugBody)" />
        <ellipse cx="25" cy="0" rx="25" ry="5" fill="#3a1d10" />
        <ellipse cx="25" cy="0" rx="22" ry="3.5" fill="#6a3818" />
        <path d="M 50 8 Q 64 8 64 30 Q 64 44 54 44" stroke="#9a7a5a" strokeWidth="4" fill="none" />
        {/* heart on mug */}
        <path d="M 18 16 q -4 -4 -8 0 q -4 4 8 12 q 12 -8 8 -12 q -4 -4 -8 0 Z" fill="#c75a4a" opacity="0.85" />
      </g>

      {/* pen */}
      <g transform="translate(420 870)">
        <rect width="68" height="3.5" fill="#3a4858" rx="1" transform="rotate(-12)" />
        <rect width="7" height="3.5" fill="#c75a4a" rx="1" transform="rotate(-12)" />
      </g>

      {/* book stack on right */}
      <g transform="translate(440 854)">
        <rect width="160" height="14" y="32" fill="#7a3e2e" rx="1" />
        <rect width="156" height="13" x="2" y="20" fill="#5c7b8e" rx="1" />
        <rect width="158" height="12" x="1" y="9" fill="#7a6843" rx="1" />
        <text x="80" y="42" textAnchor="middle" fontSize="6.5" fill="#fff8e0" fontFamily="serif">JOURNAL</text>
        <rect x="40" y="3" width="6" height="14" fill="#c75a4a" />
      </g>

      {/* small succulent in pot far right */}
      <g transform="translate(630 850)">
        <ellipse cx="20" cy="56" rx="22" ry="4" fill="#3a2418" opacity="0.4" />
        <path d="M -2 30 L 38 30 L 34 56 L 2 56 Z" fill="#7a4828" />
        <ellipse cx="18" cy="30" rx="20" ry="4" fill="#5a3018" />
        <ellipse cx="18" cy="20" rx="13" ry="7" fill="#6a8a4e" />
        <ellipse cx="8" cy="14" rx="6" ry="9" fill="#7a9c5e" />
        <ellipse cx="28" cy="10" rx="5" ry="8" fill="#8aae6a" />
        <ellipse cx="18" cy="6" rx="5" ry="7" fill="#9abe7a" />
      </g>

      {/* CD player (vinyl box) on left */}
      <g transform="translate(126 856)">
        <ellipse cx="40" cy="42" rx="44" ry="6" fill="#1a1410" opacity="0.4" />
        <rect width="80" height="36" y="6" fill="#1a1410" rx="3" />
        <circle cx="56" cy="24" r="14" fill="#0a0605" stroke="#3a2418" strokeWidth="0.6" />
        <circle cx="56" cy="24" r="2.6" fill="#5a3424" />
        <path d="M 44 22 L 44 26 M 47 21 L 47 27 M 50 20 L 50 28 M 60 20 L 60 28 M 63 21 L 63 27 M 66 22 L 66 26" stroke="#5a3424" strokeWidth="0.5" />
        <rect x="6" y="14" width="26" height="3" fill="#5a3424" rx="0.5" />
        <rect x="6" y="20" width="18" height="2" fill="#3a2418" />
        <rect x="6" y="24" width="18" height="2" fill="#3a2418" />
        <circle cx="74" cy="13" r="0.9" fill="#7afca8" style={{ animation: 'fairyPulse 3s ease-in-out infinite' }} />
      </g>
    </g>
  );
}

function Hettie() {
  return (
    <g style={{ transformOrigin: '360px 800px', animation: 'breathe 5s ease-in-out infinite' }}>
      {/* Hettie sits at desk; her head + shoulders + hands visible above the desk surface (y=900) */}

      {/* TORSO — hoodie (visible above desk) */}
      <g>
        {/* back of hoodie */}
        <path d="M 254 810 Q 230 850 232 905 L 488 905 Q 492 850 466 810 Q 440 776 396 770 Q 320 770 290 780 Q 270 794 254 810 Z" fill="url(#hoodieGrad)" />
        {/* hood scrunch behind neck */}
        <path d="M 312 770 Q 326 752 360 752 Q 394 752 408 770 Q 414 790 392 798 Q 360 802 328 798 Q 308 790 312 770 Z" fill="url(#hoodieGrad)" />
        <path d="M 320 786 Q 360 784 400 786" stroke="#a08470" strokeWidth="1" fill="none" opacity="0.6" />
        {/* drawstring */}
        <path d="M 348 798 Q 346 826 354 838" stroke="#9a7a5a" strokeWidth="1.6" fill="none" />
        <path d="M 372 798 Q 374 826 366 838" stroke="#9a7a5a" strokeWidth="1.6" fill="none" />
        <circle cx="354" cy="840" r="3.2" fill="#9a7a5a" />
        <circle cx="366" cy="840" r="3.2" fill="#9a7a5a" />
        {/* pocket */}
        <path d="M 296 868 Q 360 880 422 870 Q 432 884 422 902 L 298 902 Q 290 884 296 868 Z" fill="#dccab0" opacity="0.55" />
      </g>

      {/* RIGHT ARM (her right, viewer's left) — propped up holding head */}
      <g>
        <path d="M 250 808 Q 218 836 212 880 Q 210 902 232 902 L 270 902 Q 280 870 286 836 Q 286 818 270 810 Z" fill="url(#hoodieGrad)" />
        {/* sleeve cuff */}
        <ellipse cx="240" cy="900" rx="32" ry="6" fill="#dccab0" opacity="0.85" />
        {/* HAND propping up head — going UP */}
        <g transform="translate(258 776)">
          <path d="M 0 0 Q -10 -22 8 -34 Q 28 -38 38 -26 Q 44 -10 36 8 Q 24 20 12 22 Q 0 18 0 0 Z" fill="url(#skinGrad)" />
          <path d="M 22 -26 Q 28 -32 34 -28 M 26 -14 Q 32 -18 36 -10 M 18 -2 Q 26 -2 30 4" stroke="#c08a72" strokeWidth="0.6" fill="none" opacity="0.6" />
        </g>
      </g>

      {/* LEFT ARM resting forward — toward notebook on desk */}
      <g>
        <path d="M 460 808 Q 502 822 524 856 Q 530 880 514 896 L 488 902 Q 470 880 458 856 Q 450 832 460 808 Z" fill="url(#hoodieGrad)" />
        <ellipse cx="500" cy="900" rx="22" ry="8" fill="url(#skinGrad)" />
        <path d="M 494 898 Q 504 906 516 904 M 496 902 Q 508 910 518 908" stroke="#c08a72" strokeWidth="0.5" fill="none" opacity="0.6" />
      </g>

      {/* NECK */}
      <path d="M 348 740 Q 348 770 340 778 Q 372 786 384 778 Q 376 770 376 740 Z" fill="url(#skinGrad)" />
      <path d="M 348 748 Q 362 752 376 748" stroke="#c08a72" strokeWidth="0.8" fill="none" opacity="0.5" />

      {/* HEAD — slightly tilted to her right (resting on hand) */}
      <g style={{ transformOrigin: '362px 700px', animation: 'headTilt 12s ease-in-out infinite' }}>

        {/* hair back layer (curly volume falling onto shoulders, with bouncy tendrils) */}
        <g style={{ transformOrigin: '362px 690px', animation: 'hairSway 9s ease-in-out infinite' }}>
          {/* LEFT side mass */}
          <path d="M 290 670 Q 264 720 270 800 Q 278 856 326 858 Q 348 836 332 798 Q 312 752 314 686 Z" fill="url(#hairBase)" />
          {/* curl bumps along outer edge */}
          <ellipse cx="278" cy="724" rx="14" ry="18" fill="#9c3818" opacity="0.55" transform="rotate(-12 278 724)" />
          <ellipse cx="270" cy="770" rx="13" ry="20" fill="#7a2818" opacity="0.55" transform="rotate(-10 270 770)" />
          <ellipse cx="280" cy="820" rx="14" ry="18" fill="#9c3818" opacity="0.5" transform="rotate(-5 280 820)" />
          <ellipse cx="304" cy="850" rx="13" ry="14" fill="#a8451e" opacity="0.55" />

          <path d="M 286 690 Q 276 730 282 790" stroke="#5a1a08" strokeWidth="1.2" fill="none" opacity="0.55" />
          <path d="M 296 700 Q 286 740 296 790" stroke="#7a2818" strokeWidth="1" fill="none" opacity="0.5" />

          {/* curl tendrils — longer wavy spirals */}
          <path d="M 286 826 q -8 10 -4 22 q 6 14 -4 24 q -8 10 6 18" stroke="url(#hairCurl)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 312 850 q 6 12 -4 20 q -10 10 8 16" stroke="url(#hairCurl)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M 304 858 q -2 10 -8 16 q -6 6 0 12" stroke="url(#hairCurl)" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* RIGHT side mass */}
          <path d="M 434 670 Q 460 720 454 800 Q 446 856 398 858 Q 376 836 392 798 Q 412 752 410 686 Z" fill="url(#hairBase)" />
          {/* curl bumps on right outer edge */}
          <ellipse cx="446" cy="724" rx="14" ry="18" fill="#9c3818" opacity="0.55" transform="rotate(12 446 724)" />
          <ellipse cx="454" cy="770" rx="13" ry="20" fill="#7a2818" opacity="0.55" transform="rotate(10 454 770)" />
          <ellipse cx="444" cy="820" rx="14" ry="18" fill="#9c3818" opacity="0.5" transform="rotate(5 444 820)" />
          <ellipse cx="420" cy="850" rx="13" ry="14" fill="#a8451e" opacity="0.55" />

          <path d="M 438 690 Q 448 730 444 790" stroke="#5a1a08" strokeWidth="1.2" fill="none" opacity="0.55" />
          <path d="M 432 700 Q 438 740 430 790" stroke="#7a2818" strokeWidth="1" fill="none" opacity="0.5" />

          <path d="M 438 826 q 8 10 4 22 q -6 14 4 24 q 8 10 -6 18" stroke="url(#hairCurl)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 412 850 q -6 12 4 20 q 10 10 -8 16" stroke="url(#hairCurl)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M 420 858 q 2 10 8 16 q 6 6 0 12" stroke="url(#hairCurl)" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* highlight on hair (sun catching) */}
          <path d="M 296 670 Q 274 720 278 790 Q 286 840 322 854" stroke="url(#hairLight)" strokeWidth="6" fill="none" opacity="0.7" />
          <path d="M 432 670 Q 458 720 454 790 Q 446 840 410 854" stroke="url(#hairLight)" strokeWidth="6" fill="none" opacity="0.65" />
        </g>

        {/* face shape */}
        <path d="M 320 656 Q 302 670 302 706 Q 302 736 314 752 Q 332 768 360 768 Q 388 768 406 752 Q 418 736 418 706 Q 418 670 400 656 Q 360 644 320 656 Z" fill="url(#skinGrad)" />

        {/* ears */}
        <path d="M 302 706 Q 296 714 298 728 Q 304 736 312 728" fill="url(#skinGrad)" />
        <path d="M 418 706 Q 424 714 422 728 Q 416 736 408 728" fill="url(#skinGrad)" />
        <path d="M 420 712 Q 422 720 418 728" stroke="#c08a72" strokeWidth="0.4" fill="none" opacity="0.6" />

        {/* HAIR — front bangs and crown */}
        <g style={{ transformOrigin: '362px 670px', animation: 'hairSway 9s ease-in-out infinite' }}>
          <path d="M 302 668 Q 292 654 304 634 Q 326 612 362 612 Q 398 612 420 634 Q 432 654 422 670 Q 398 656 362 656 Q 326 656 302 668 Z" fill="url(#hairBase)" />
          {/* messy bangs across forehead */}
          <path d="M 314 666 Q 336 678 362 672 Q 388 678 410 666 Q 414 674 406 682 Q 384 692 362 686 Q 340 692 318 682 Q 312 674 314 666 Z" fill="url(#hairBase)" />
          {/* loose strands */}
          <path d="M 322 674 Q 326 692 332 706" stroke="#9a3818" strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M 358 676 Q 356 690 362 700" stroke="#9a3818" strokeWidth="1" fill="none" opacity="0.65" />
          <path d="M 392 674 Q 396 690 390 704" stroke="#9a3818" strokeWidth="1.1" fill="none" opacity="0.7" />

          {/* crown highlight */}
          <path d="M 318 622 Q 362 610 406 622" stroke="url(#hairShine)" strokeWidth="6" fill="none" opacity="0.85" />
          <path d="M 308 638 Q 332 632 358 634" stroke="#ffd078" strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
          <path d="M 372 634 Q 396 632 416 638" stroke="#ffb060" strokeWidth="1.2" fill="none" opacity="0.55" strokeLinecap="round" />

          {/* curl peeking by ear */}
          <path d="M 290 700 Q 288 712 292 720 Q 298 728 304 720" stroke="url(#hairCurl)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M 432 700 Q 434 712 430 720 Q 424 728 418 720" stroke="url(#hairCurl)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </g>

        {/* EYES — soft closed/peaceful, looking down at notebook */}
        {/* left eye */}
        <path d="M 320 712 Q 332 720 346 712" stroke="#2a1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M 320 712 Q 322 710 326 711 M 346 712 Q 344 710 340 711" stroke="#2a1408" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.55" />
        {/* eyelashes */}
        <path d="M 322 712 L 320 708 M 327 715 L 326 711 M 332 716 L 332 712 M 338 715 L 339 711 M 343 712 L 345 708" stroke="#2a1408" strokeWidth="0.6" strokeLinecap="round" />
        {/* eyebrow */}
        <path d="M 318 700 Q 332 694 346 700" stroke="#7a1e08" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* right eye */}
        <path d="M 378 712 Q 390 720 404 712" stroke="#2a1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M 378 712 Q 380 710 384 711 M 404 712 Q 402 710 398 711" stroke="#2a1408" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M 380 712 L 378 708 M 385 715 L 384 711 M 390 716 L 390 712 M 396 715 L 397 711 M 401 712 L 403 708" stroke="#2a1408" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M 376 700 Q 390 694 404 700" stroke="#7a1e08" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* nose */}
        <path d="M 362 720 Q 358 734 360 740 Q 364 744 368 742 Q 370 738 366 728" fill="none" stroke="#c08a72" strokeWidth="0.8" opacity="0.7" />
        <ellipse cx="363" cy="742" rx="2.2" ry="1" fill="#c08a72" opacity="0.55" />

        {/* lips — soft smile */}
        <path d="M 348 752 Q 362 758 376 752" stroke="#a8483a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 346 752 Q 362 760 378 752 Q 362 754 346 752 Z" fill="#d87060" opacity="0.55" />
        <path d="M 360 753 Q 363 752 364 753" stroke="#fde2cc" strokeWidth="0.6" fill="none" opacity="0.7" />

        {/* freckles */}
        {[
          {x:336,y:730,o:0.6},{x:342,y:732,o:0.5},{x:348,y:728,o:0.45},
          {x:354,y:732,o:0.55},{x:372,y:732,o:0.55},{x:378,y:728,o:0.45},
          {x:384,y:731,o:0.5},{x:390,y:733,o:0.6},{x:344,y:724,o:0.4},
          {x:382,y:723,o:0.4},{x:362,y:728,o:0.5}, {x:340,y:736,o:0.45}, {x:386,y:736,o:0.45},
        ].map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r="0.7" fill="#a8451e" opacity={f.o} />
        ))}

        {/* cheek blush */}
        <ellipse cx="324" cy="734" rx="11" ry="5" fill="#ff9a7a" opacity="0.25" />
        <ellipse cx="400" cy="734" rx="11" ry="5" fill="#ff9a7a" opacity="0.25" />

        {/* HEADPHONES */}
        <g>
          <path d="M 290 624 Q 362 580 434 624" stroke="#1a1410" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 290 624 Q 362 584 434 624" stroke="#3a2418" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* left earcup */}
          <ellipse cx="294" cy="712" rx="16" ry="22" fill="#1a1410" />
          <ellipse cx="294" cy="712" rx="11" ry="16" fill="#5a3424" opacity="0.7" />
          <circle cx="294" cy="712" r="3.4" fill="#3a2418" />
          {/* right earcup */}
          <ellipse cx="430" cy="712" rx="16" ry="22" fill="#1a1410" />
          <ellipse cx="430" cy="712" rx="11" ry="16" fill="#5a3424" opacity="0.7" />
          <circle cx="430" cy="712" r="3.4" fill="#3a2418" />
          <circle cx="430" cy="700" r="1" fill="#7afca8" style={{ animation: 'fairyPulse 3s ease-in-out infinite' }} />
        </g>

        {/* gold hoop earring */}
        <circle cx="436" cy="724" r="3.6" fill="none" stroke="#fcd092" strokeWidth="1.4" />
      </g>

      {/* small necklace hint */}
      <path d="M 346 770 Q 362 776 380 770" stroke="#fcd092" strokeWidth="0.7" fill="none" opacity="0.7" />
      <circle cx="362" cy="776" r="1.4" fill="#fcd092" />
    </g>
  );
}

function Lamp() {
  // angled desk lamp (Pixar-style)
  return (
    <g>
      {/* glow pool on desk */}
      <ellipse cx="200" cy="900" rx="180" ry="26" fill="url(#lampGlow)" opacity="0.85" pointerEvents="none" />
      {/* light cone (subtle, downward to right) */}
      <path d="M 180 740 L 80 902 L 320 902 L 220 740 Z" fill="url(#lampCone)" opacity="0.5" pointerEvents="none" />

      {/* lamp shape */}
      <g transform="translate(176 736)">
        {/* base — heavy round disc */}
        <ellipse cx="0" cy="160" rx="36" ry="7" fill="#0e0a06" opacity="0.5" />
        <ellipse cx="0" cy="158" rx="34" ry="7" fill="url(#lampMetal)" />
        <ellipse cx="0" cy="155" rx="34" ry="3" fill="#5a3424" opacity="0.6" />

        {/* stem — vertical pole */}
        <rect x="-3" y="0" width="6" height="158" fill="url(#lampMetal)" />
        <rect x="-2" y="0" width="2" height="158" fill="#7a4830" opacity="0.4" />

        {/* shoulder joint */}
        <circle cx="0" cy="0" r="7" fill="#1a1410" />
        <circle cx="0" cy="0" r="3.5" fill="#5a3424" />

        {/* upper arm — angled to support shade */}
        <g transform="rotate(-32 0 0)">
          <rect x="-3" y="-56" width="6" height="60" fill="url(#lampMetal)" />
          <rect x="-2" y="-56" width="2" height="60" fill="#7a4830" opacity="0.4" />
        </g>

        {/* elbow joint */}
        <circle cx="-30" cy="-46" r="5" fill="#1a1410" />

        {/* SHADE — proper bell/cone shape, angled down */}
        <g transform="translate(-30 -46) rotate(40)">
          {/* shade outer */}
          <path d="M -8 0 Q -22 0 -28 36 Q -22 46 28 46 Q 36 46 28 36 Q 22 0 8 0 Z" fill="url(#lampMetal)" />
          {/* shade inner highlight along bottom edge */}
          <path d="M -22 36 Q -16 44 28 44 Q 32 42 30 38" stroke="#7a4830" strokeWidth="1" fill="none" opacity="0.7" />
          {/* shade top opening */}
          <ellipse cx="0" cy="0" rx="8" ry="2.6" fill="#0a0605" />
          {/* light coming out the bottom */}
          <ellipse cx="0" cy="44" rx="22" ry="6" fill="#ffe6a8" opacity="0.95"
            style={{ animation: 'flicker 4s ease-in-out infinite' }} />
          <ellipse cx="0" cy="44" rx="14" ry="3" fill="#fff8e8" opacity="0.95" />
          {/* highlight stripe on side of shade */}
          <path d="M -18 8 Q -22 18 -22 32" stroke="#5a3424" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M 18 8 Q 22 18 22 32" stroke="#5a3424" strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      </g>
    </g>
  );
}

function Steam() {
  // mug at translate(40 838) with width 50, so steam centered around x ~70
  return (
    <g pointerEvents="none">
      <path d="M 60 836 Q 56 816 62 798 Q 68 780 60 762" stroke="#fff8e8" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6"
        style={{ animation: 'steamRise 4s ease-out infinite' }} />
      <path d="M 72 836 Q 76 816 70 798 Q 64 780 72 762" stroke="#fff8e8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"
        style={{ animation: 'steamRise2 4.5s ease-out 0.8s infinite' }} />
      <path d="M 82 832 Q 86 816 80 798 Q 74 780 82 762" stroke="#fff8e8" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.4"
        style={{ animation: 'steamRise 5s ease-out 1.5s infinite' }} />
    </g>
  );
}

function MusicNotes() {
  return (
    <g pointerEvents="none">
      {[0, 1, 2].map(i => (
        <g key={i} style={{ animation: `noteFloat 6s ease-out infinite`, animationDelay: `${i * 2.2}s` }}>
          <text x={250 + i * 18} y={690} fontSize="16" fill="#fff4d8" opacity="0.6" fontFamily="serif">♪</text>
        </g>
      ))}
    </g>
  );
}

function DustMotes() {
  const motes = [
    { x: 200, y: 1020, d: 0, dur: 9 }, { x: 280, y: 1060, d: 1.6, dur: 11 }, { x: 360, y: 1040, d: 3, dur: 9.5 },
    { x: 440, y: 1080, d: 0.8, dur: 11 }, { x: 520, y: 1020, d: 4.2, dur: 8.5 }, { x: 600, y: 1060, d: 2.5, dur: 10 },
    { x: 150, y: 1100, d: 5.3, dur: 9 }, { x: 320, y: 1100, d: 1.2, dur: 12 },
    { x: 500, y: 1100, d: 3.7, dur: 10 }, { x: 580, y: 1020, d: 0.4, dur: 9.5 },
    { x: 240, y: 980, d: 2.4, dur: 11 }, { x: 480, y: 980, d: 4.4, dur: 9 },
  ];
  return <g pointerEvents="none">{motes.map((m, i) => (
    <circle key={i} cx={m.x} cy={m.y} r={i % 2 === 0 ? 0.9 : 1.4} fill="#ffe9c2"
      style={{ animation: `dustFloat ${m.dur}s linear infinite`, animationDelay: `${m.d}s` }} />
  ))}</g>;
}
