import { useMemo } from 'react';
import './Scene.css';

interface SceneProps { now: Date; daysRemaining?: number; daysSince?: number; totalDays?: number; onTapMurphy?: () => void }

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

export function Scene({ now, daysRemaining = 0, daysSince = 0, totalDays = 49, onTapMurphy }: SceneProps) {
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

        {/* MURPHY — warmer chocolate coat (not pitch-black) so his face reads */}
        <linearGradient id="murphyCoat" x1="0" y1="0" x2="0.7" y2="0.7">
          <stop offset="0%" stopColor="#5a3a2a" />
          <stop offset="50%" stopColor="#3a2418" />
          <stop offset="100%" stopColor="#1a0e08" />
        </linearGradient>
        <linearGradient id="murphyBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2418" />
          <stop offset="100%" stopColor="#6a4a32" />
        </linearGradient>
        <linearGradient id="murphyRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd896" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffa060" stopOpacity="0" />
        </linearGradient>
        {/* Eyes — warm amber iris with dark pupil drawn over */}
        <radialGradient id="murphyEye" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%"  stopColor="#e6a060" />
          <stop offset="60%" stopColor="#a86a2a" />
          <stop offset="100%" stopColor="#3a1a08" />
        </radialGradient>
        {/* Tan markings — eyebrow spots, muzzle underside, paws — for a rottweiler-ish warmth */}
        <linearGradient id="murphyTan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9843a" />
          <stop offset="100%" stopColor="#7a4a1c" />
        </linearGradient>
        <linearGradient id="murphyCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4d8" />
          <stop offset="100%" stopColor="#e6d4a8" />
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
        {isNight && <Aurora />}
        {isNight && <ShootingStar seed={seed} />}

        {/* drifting clouds — multiple layers with variety */}
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
        {/* CIRRUS wispy clouds — high up */}
        <g opacity="0.55" style={{ animation: 'cloudDriftA 200s linear infinite' }}>
          <CirrusCloud cx={300} cy={110} />
          <CirrusCloud cx={500} cy={130} />
        </g>
        {/* god rays from sun through clouds */}
        <g opacity="0.16" pointerEvents="none">
          <path d="M 360 240 L 200 580 L 220 580 L 360 240 Z" fill="#fff0c0" />
          <path d="M 360 240 L 280 580 L 296 580 L 360 240 Z" fill="#fff0c0" />
          <path d="M 360 240 L 360 580 L 378 580 L 360 240 Z" fill="#fff0c0" />
          <path d="M 360 240 L 440 580 L 460 580 L 360 240 Z" fill="#fff0c0" />
          <path d="M 360 240 L 520 580 L 540 580 L 360 240 Z" fill="#fff0c0" />
        </g>

        {/* MALVERN HILLS */}
        <MalvernHills seed={seed} />

        {/* Birds drifting */}
        <Birds />

        {/* Solo bird arcing past the window with flapping wings */}
        <WindowBird />

        {/* Hot air balloon — rare, drifts across once in a while */}
        <HotAirBalloon />

        {/* Aircraft contrail across upper sky */}
        <Contrail />

        {/* Butterfly fluttering across window */}
        <Butterfly />

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
      <MurphyOnSill alert={isEvening} onTap={onTapMurphy} />

      {/* ============= CURTAINS ============= */}
      <Curtains />

      {/* ============= CLIMBER / TRAILING PLANTS (around window + corners) ============= */}
      <TrailingIvy side="left" />
      <TrailingIvy side="right" />
      <CornerClimber side="left" />
      <CornerClimber side="right" />

      {/* ============= FAIRY LIGHTS ============= */}
      <FairyLights isNight={isNight} />

      {/* ============= BUNTING above window ============= */}
      <Bunting />

      {/* ============= POLAROIDS ON WALL (around window edges) ============= */}
      <PolaroidWall />

      {/* ============= LEFT WALL: shelf with books + plants ============= */}
      <LeftWallShelf />

      {/* ============= RIGHT WALL: dried flower wreath + posters ============= */}
      <RightWallDecor />

      {/* ============= POSTER ABOVE DESK on left ============= */}
      <WallPoster />

      {/* ============= WALL CALENDAR / COUNTDOWN CHALKBOARD ============= */}
      <WallChalkboard daysRemaining={daysRemaining} />

      {/* ============= PAPER WALL CALENDAR with Xs for days passed ============= */}
      <WallCalendar daysSince={daysSince} totalDays={totalDays} />

      {/* ============= WALL CLOCK ============= */}
      <WallClock now={now} />

      {/* ============= HANGING PLANT (top corners) ============= */}
      <HangingPlant />

      {/* ============= MACRAME HANGING PLANT TOP-RIGHT ============= */}
      <MacramePlant />

      {/* ============= SUN CATCHER hanging inside window ============= */}
      <SunCatcher />

      {/* ============= WIND CHIME hanging in window ============= */}
      <WindChime />

      {/* ============= WARM AMBIENT GLOW ============= */}
      <rect width="720" height="1280" fill="url(#warmGlow)" pointerEvents="none" />

      {/* ============= LIGHT POOL ON FLOOR ============= */}
      <ellipse cx="360" cy="1180" rx="380" ry="80" fill="url(#floorPool)" pointerEvents="none" />

      {/* warm reflection on floor under lamp */}
      <ellipse cx="180" cy="1140" rx="160" ry="40" fill="#ffe6a8" opacity="0.18" pointerEvents="none"
        style={{ animation: 'flicker 4s ease-in-out infinite' }} />

      {/* ============= FLOOR ============= */}
      <Floor />

      {/* ============= LAMP (in front of window) ============= */}
      <Lamp />

      {/* ============= rim light on Hettie from window ============= */}
      <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
        <ellipse cx="360" cy="700" rx="180" ry="100" fill={isNight ? '#a8b8d8' : '#ffd896'} opacity={isNight ? '0.08' : '0.06'} />
      </g>
      {/* Warm wash on Hettie's left side (from lamp on her right cheek viewer's left) */}
      <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
        <ellipse cx="316" cy="720" rx="60" ry="80" fill="#ffd896" opacity="0.15"
          style={{ animation: 'flicker 4s ease-in-out infinite' }} />
      </g>
      {isNight && (
        <g pointerEvents="none">
          {/* moonlight catching Hettie's hair */}
          <path d="M 290 660 Q 280 720 290 780" stroke="#cdd5e8" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M 434 660 Q 444 720 434 780" stroke="#cdd5e8" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
        </g>
      )}

      {/* ============= DESK ============= */}
      <Desk />

      {/* ============= HETTIE ============= */}
      <Hettie />

      {/* ============= LOVE LETTER on desk ============= */}
      <LoveLetter />

      {/* ============= STEAM FROM MUG ============= */}
      <Steam />

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

function CirrusCloud({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path d="M -40 0 q 20 -6 40 0 q 20 -4 40 0" stroke="#fff8e0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M -30 6 q 14 -3 28 0" stroke="#fff8e0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
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

/* Aurora ribbons drifting across the night sky */
function Aurora() {
  return (
    <g pointerEvents="none" opacity="0.55" style={{ animation: 'auroraDrift 18s ease-in-out infinite' }}>
      <defs>
        <linearGradient id="auroraGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7afca8" stopOpacity="0" />
          <stop offset="40%" stopColor="#7afca8" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#a888fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a888fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 60 200 Q 200 160 360 200 Q 520 240 660 200" stroke="url(#auroraGrad)" strokeWidth="32" fill="none" opacity="0.5" />
      <path d="M 60 240 Q 220 220 360 250 Q 500 280 660 240" stroke="url(#auroraGrad)" strokeWidth="22" fill="none" opacity="0.4" />
    </g>
  );
}

/* Shooting star — appears once every minute or so */
function ShootingStar({ seed }: { seed: number }) {
  const seeded = (seed * 13) % 7;
  return (
    <g pointerEvents="none" style={{ animation: `shootStar 28s linear ${seeded}s infinite` }}>
      <line x1="0" y1="0" x2="60" y2="20" stroke="#fff8e0" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
      <line x1="0" y1="0" x2="40" y2="14" stroke="#fff8e0" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <circle cx="0" cy="0" r="1.6" fill="#fff8e0" />
    </g>
  );
}

function MalvernHills({ seed }: { seed: number }) {
  const sheep = (seed % 3) + 3;
  return (
    <g transform="translate(0 30)">
      {/* DEEP DISTANT ridge — barely visible, hazy */}
      <path
        d="M 60 410 L 60 320 L 100 312 L 140 304 L 180 296 L 230 286 L 280 274 L 330 262 L 380 254 L 430 250 L 480 254 L 530 262 L 580 274 L 620 286 L 660 296 L 660 410 Z"
        fill="url(#hillFar)" opacity="0.45"
      />

      {/* Far ridge — Worcestershire Beacon profile */}
      <path
        d="M 60 460 L 60 360 L 110 340 L 160 326 L 200 320 L 240 308 L 280 286 L 320 264 L 360 242 L 390 226 L 420 230 L 450 246 L 480 262 L 520 278 L 560 294 L 600 310 L 640 330 L 660 344 L 660 460 Z"
        fill="url(#hillFar)" opacity="0.78"
      />

      {/* DISTANT VILLAGE — Great Malvern silhouette with church spire */}
      <g opacity="0.65">
        {/* houses cluster */}
        <g transform="translate(160 410)">
          <rect x="0" y="0" width="14" height="18" fill="#3a4e3a" />
          <path d="M -2 0 L 7 -8 L 16 0 Z" fill="#2a3a2a" />
          <rect x="14" y="4" width="10" height="14" fill="#3a4858" />
          <path d="M 13 4 L 19 -2 L 25 4 Z" fill="#2a3a48" />
          <rect x="24" y="-2" width="12" height="20" fill="#5a4040" />
          <path d="M 23 -2 L 30 -10 L 37 -2 Z" fill="#3a2828" />
          {/* CHURCH with spire */}
          <rect x="40" y="-4" width="12" height="22" fill="#5a5040" />
          <path d="M 39 -4 L 46 -16 L 53 -4 Z" fill="#3a3328" />
          <path d="M 44 -4 L 46 -28 L 48 -4 Z" fill="#3a3328" />
          <path d="M 46 -28 L 47 -32 L 45 -32 Z" fill="#3a3328" />
          {/* row continues */}
          <rect x="56" y="2" width="10" height="16" fill="#4a3438" />
          <path d="M 55 2 L 61 -4 L 67 2 Z" fill="#2a1d24" />
          <rect x="66" y="-1" width="14" height="19" fill="#3a4858" />
          <path d="M 65 -1 L 73 -8 L 81 -1 Z" fill="#2a3340" />
        </g>
        {/* tiny lit windows */}
        <g fill="#ffe8a8" opacity="0.65">
          <rect x="164" y="416" width="1.6" height="2" />
          <rect x="170" y="416" width="1.6" height="2" />
          <rect x="178" y="416" width="1.4" height="2" />
          <rect x="186" y="412" width="1.6" height="2" />
          <rect x="200" y="408" width="1.4" height="2" />
          <rect x="218" y="416" width="1.4" height="2" />
          <rect x="232" y="412" width="1.6" height="2" />
        </g>
        {/* chimney smoke */}
        <path className="steam-wisp" d="M 188 392 q -2 -8 0 -16 q 3 -8 -1 -14" stroke="#9a8a78" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.55"
          style={{ animation: 'steamRise 7s ease-out infinite' }} />
      </g>

      {/* Mid ridge */}
      <path
        d="M 60 490 L 60 388 L 100 376 L 140 362 L 180 348 L 230 336 L 270 328 L 310 318 L 350 306 L 390 296 L 430 304 L 470 318 L 510 338 L 550 358 L 590 376 L 630 392 L 660 404 L 660 490 Z"
        fill="url(#hillMid)"
      />

      {/* Mist rolling across mid hills */}
      <g opacity="0.32">
        <ellipse cx="200" cy="430" rx="120" ry="16" fill="#fff8e0" />
        <ellipse cx="450" cy="450" rx="140" ry="14" fill="#fff8e0" />
        <ellipse cx="320" cy="468" rx="180" ry="10" fill="#fff8e0" />
      </g>

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

      {/* COTTAGE in mid-distance with smoke chimney */}
      <g transform="translate(440 500)" opacity="0.85">
        <rect x="0" y="0" width="22" height="14" fill="#7a4a3a" />
        <path d="M -2 0 L 11 -10 L 24 0 Z" fill="#3a2418" />
        <rect x="4" y="6" width="4" height="6" fill="#fce4a8" opacity="0.7" />
        <rect x="14" y="6" width="4" height="6" fill="#fce4a8" opacity="0.7" />
        <rect x="2" y="0" width="3" height="-8" fill="#3a2418" transform="translate(0 8)" />
        <rect x="3" y="-12" width="3" height="6" fill="#3a2418" />
        <path className="steam-wisp" d="M 4.5 -12 q -2 -8 0 -14 q 2 -6 0 -10" stroke="#9a8a78" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.55"
          style={{ animation: 'steamRise 6s ease-out 1s infinite' }} />
      </g>

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
        {/* small bushes */}
        <ellipse cx="280" cy="572" rx="14" ry="6" fill="#1a2818" opacity="0.85" />
        <ellipse cx="380" cy="572" rx="11" ry="5" fill="#22321e" opacity="0.85" />
        <ellipse cx="490" cy="572" rx="13" ry="5" fill="#1a2818" opacity="0.85" />
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
        <g key={i} transform={`translate(${200 + i * 70} ${478 - (i % 2) * 8})`}>
          <ellipse cx="0" cy="0" rx="3.5" ry="2.4" fill="#f4ead8" opacity="0.9" />
          <circle cx="-2.6" cy="-0.6" r="1.2" fill="#3a2418" opacity="0.7" />
          <line x1="-2" y1="2" x2="-2" y2="3.5" stroke="#3a2418" strokeWidth="0.5" />
          <line x1="2" y1="2" x2="2" y2="3.5" stroke="#3a2418" strokeWidth="0.5" />
        </g>
      ))}

      {/* Path winding */}
      <path d="M 320 580 Q 360 530 380 480 Q 400 430 380 400" stroke="#c89c70" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M 320 580 Q 360 530 380 480 Q 400 430 380 400" stroke="#fde0b8" strokeWidth="1.4" fill="none" opacity="0.3" />
      {/* tiny walker on the path */}
      <g transform="translate(370 470)">
        <ellipse cx="0" cy="2" rx="1.6" ry="0.6" fill="#1a0a06" opacity="0.55" />
        <rect x="-1" y="-3" width="2" height="4" fill="#5a3424" opacity="0.85" />
        <circle cx="0" cy="-5" r="1.2" fill="#c08a72" opacity="0.85" />
      </g>

      {/* Dry stone wall */}
      <path d="M 60 532 Q 130 538 200 535 Q 280 530 360 540" stroke="#8a8678" strokeWidth="2" fill="none" opacity="0.4" />

      {/* Reservoir glint (small lake) */}
      <ellipse cx="540" cy="500" rx="36" ry="4" fill="#a8c0d8" opacity="0.55" />
      <path d="M 510 500 q 6 -2 12 0 q 6 -2 12 0" stroke="#fff8e0" strokeWidth="0.4" fill="none" opacity="0.6" />
    </g>
  );
}

/* Hot air balloon drifting through the upper sky */
function HotAirBalloon() {
  return (
    <g pointerEvents="none" style={{ animation: 'balloonDrift 180s linear infinite' }}>
      {/* envelope */}
      <ellipse cx="0" cy="-12" rx="10" ry="11" fill="#c75a4a" />
      <path d="M -10 -12 q 5 -16 20 0" stroke="#9a3030" strokeWidth="0.5" fill="none" opacity="0.6" />
      <path d="M -2 -22 q 4 0 4 4 q 0 -4 -4 -4" stroke="#9a3030" strokeWidth="0.4" fill="none" />
      {/* gas burner / opening */}
      <ellipse cx="0" cy="0" rx="4" ry="1" fill="#3a2418" />
      {/* basket */}
      <rect x="-3.5" y="2" width="7" height="4" fill="#7a4828" rx="0.5" />
      {/* ropes */}
      <line x1="-9" y1="-2" x2="-3" y2="2" stroke="#3a2418" strokeWidth="0.4" />
      <line x1="9" y1="-2" x2="3" y2="2" stroke="#3a2418" strokeWidth="0.4" />
    </g>
  );
}

/* Aircraft contrail high in the sky — appears occasionally */
function Contrail() {
  return (
    <g pointerEvents="none" style={{ animation: 'contrailFly 90s linear infinite' }}>
      <line x1="0" y1="0" x2="40" y2="-2" stroke="#fff8e0" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
      <line x1="-30" y1="2" x2="0" y2="0" stroke="#fff8e0" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      {/* tiny plane */}
      <circle cx="42" cy="-2" r="1" fill="#3a2418" />
    </g>
  );
}

/* Butterfly drifting near the window — adds a sweet moment of life.
   Cycles every ~28s so there's always a good chance of catching one. */
function Butterfly() {
  return (
    <g pointerEvents="none" style={{ animation: 'mothFlight 28s ease-in-out infinite' }}>
      <g style={{ transformOrigin: '0 0', animation: 'wingFlap 0.34s ease-in-out infinite' }}>
        {/* upper wings */}
        <ellipse cx="-5" cy="-2.5" rx="6" ry="4.4" fill="#f09ab8" opacity="0.9" />
        <ellipse cx="5"  cy="-2.5" rx="6" ry="4.4" fill="#f09ab8" opacity="0.9" />
        {/* lower wings */}
        <ellipse cx="-4.5" cy="2.4" rx="4.5" ry="3.4" fill="#c75a4a" opacity="0.85" />
        <ellipse cx="4.5"  cy="2.4" rx="4.5" ry="3.4" fill="#c75a4a" opacity="0.85" />
        {/* inner wing spots — a little detail to sell it close up */}
        <circle cx="-5" cy="-2.5" r="1" fill="#fff4d8" opacity="0.6" />
        <circle cx="5"  cy="-2.5" r="1" fill="#fff4d8" opacity="0.6" />
        {/* body */}
        <ellipse cx="0" cy="0" rx="0.9" ry="3.6" fill="#2a1810" />
        {/* antennae */}
        <path d="M 0 -2.6 L -2.4 -6 M 0 -2.6 L 2.4 -6" stroke="#2a1810" strokeWidth="0.45" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* Birds drifting through sky — distant flock of three Vs */
function Birds() {
  return (
    <g pointerEvents="none">
      <g style={{ animation: 'birdFlyA 50s linear infinite' }}>
        <path d="M 0 0 q 4 -4 8 0 q 4 -4 8 0" stroke="#3a2418" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M 16 4 q 3 -3 6 0 q 3 -3 6 0" stroke="#3a2418" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M 8 -8 q 3 -3 6 0 q 3 -3 6 0" stroke="#3a2418" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
    </g>
  );
}

/* Solo bird arcing past the window with visible flapping wings.
   Big enough to notice without being cartoonish. */
function WindowBird() {
  return (
    <g pointerEvents="none" style={{ animation: 'birdPastWindow 22s ease-in-out infinite' }}>
      {/* body */}
      <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#2a1810" />
      <circle cx="5" cy="-0.5" r="2.2" fill="#2a1810" />
      {/* beak */}
      <path d="M 7 -0.5 L 9.5 -1 L 7 0.2 Z" fill="#c9873a" />
      {/* tiny eye */}
      <circle cx="5.5" cy="-1" r="0.45" fill="#fff4d8" />
      {/* wings — flapping */}
      <g style={{ transformOrigin: '0 0', animation: 'birdWing 0.38s ease-in-out infinite' }}>
        <path d="M -2 -1 Q -8 -7 -14 -3 Q -10 -1 -3 0 Z" fill="#3a2418" />
        <path d="M 2 -1 Q 8 -7 14 -3 Q 10 -1 3 0 Z" fill="#3a2418" />
      </g>
      {/* tail */}
      <path d="M -4 0 L -8 1 L -8 -1 Z" fill="#2a1810" />
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

      {/* small leafy plant on left of sill */}
      <g style={{ transformOrigin: '78px 600px', animation: 'leafSwayA 9s ease-in-out infinite' }}>
        <path d="M 60 596 L 96 596 L 92 622 L 64 622 Z" fill="#7a3e22" />
        <ellipse cx="78" cy="596" rx="18" ry="3.5" fill="#5a2a14" />
        <path d="M 64 594 Q 56 568 64 542" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="58" cy="554" rx="5" ry="12" fill="url(#leafGrad)" transform="rotate(-30 58 554)" />
        <ellipse cx="66" cy="548" rx="4" ry="11" fill="#7a9c5e" transform="rotate(-15 66 548)" />
        <path d="M 90 594 Q 96 568 92 542" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="92" cy="556" rx="5" ry="13" fill="url(#leafGrad)" transform="rotate(25 92 556)" />
        <path d="M 78 594 Q 80 572 78 552" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <ellipse cx="76" cy="558" rx="5" ry="13" fill="#8aae6a" />
      </g>

      {/* SUCCULENT in tiny pot on left-mid sill */}
      <g style={{ transformOrigin: '128px 600px', animation: 'leafSwayB 11s ease-in-out infinite' }}>
        <path d="M 116 600 L 142 600 L 140 620 L 118 620 Z" fill="#a04a3a" />
        <ellipse cx="129" cy="600" rx="13" ry="3" fill="#7a2a18" />
        <ellipse cx="129" cy="594" rx="9" ry="5" fill="#6a8a4e" />
        <ellipse cx="124" cy="589" rx="4" ry="6" fill="#7a9c5e" />
        <ellipse cx="134" cy="588" rx="4" ry="6" fill="#8aae6a" />
        <ellipse cx="129" cy="585" rx="3" ry="5" fill="#9abe7a" />
      </g>

      {/* TRAILING POTHOS on right sill */}
      <g style={{ transformOrigin: '160px 600px', animation: 'leafSwayA 13s ease-in-out infinite' }}>
        <path d="M 154 600 L 174 600 L 172 620 L 156 620 Z" fill="#5a3424" />
        <ellipse cx="164" cy="600" rx="10" ry="2.4" fill="#3a2018" />
        {/* trailing vine going down off the sill */}
        <path d="M 158 612 Q 152 640 156 670 Q 162 700 156 730" stroke="#5a7e4a" strokeWidth="1.4" fill="none" />
        <ellipse cx="154" cy="630" rx="3.5" ry="6" fill="#9abe7a" transform="rotate(-30 154 630)" />
        <ellipse cx="158" cy="650" rx="3" ry="5" fill="#8aae6a" transform="rotate(-15 158 650)" />
        <ellipse cx="153" cy="670" rx="3.2" ry="5" fill="#7a9c5e" transform="rotate(20 153 670)" />
        <ellipse cx="158" cy="694" rx="3" ry="4.5" fill="#8aae6a" transform="rotate(-10 158 694)" />
        <ellipse cx="155" cy="715" rx="3" ry="4.4" fill="#7a9c5e" transform="rotate(15 155 715)" />
        <path d="M 168 612 Q 174 632 170 654" stroke="#5a7e4a" strokeWidth="1.2" fill="none" />
        <ellipse cx="172" cy="628" rx="3" ry="5" fill="#9abe7a" transform="rotate(20 172 628)" />
        <ellipse cx="170" cy="646" rx="3" ry="4.5" fill="#8aae6a" transform="rotate(30 170 646)" />
        {/* leaves still up */}
        <ellipse cx="156" cy="588" rx="6" ry="9" fill="#9abe7a" transform="rotate(-30 156 588)" />
        <ellipse cx="172" cy="586" rx="6" ry="9" fill="#8aae6a" transform="rotate(20 172 586)" />
      </g>

      {/* Crystal cluster — small geode/quartz */}
      <g transform="translate(192 600)">
        <ellipse cx="8" cy="20" rx="14" ry="3" fill="#1a0a06" opacity="0.4" />
        <path d="M -2 18 L 4 4 L 8 16 L 12 6 L 18 18 Z" fill="#a8b0d0" opacity="0.85" />
        <path d="M 4 4 L 8 16 L 12 6 Z" fill="#cdd5e8" opacity="0.7" />
        <path d="M 2 10 L 5 6 M 14 8 L 16 14" stroke="#fff" strokeWidth="0.4" opacity="0.7" />
      </g>

      {/* Book on right of sill */}
      <g transform="translate(220 580)">
        <rect width="58" height="14" fill="#8a3838" rx="1" />
        <rect width="58" height="3" fill="#6a2828" />
        <line x1="2" y1="2" x2="56" y2="2" stroke="#5a1a1a" strokeWidth="0.4" />
        <text x="29" y="10" textAnchor="middle" fontSize="6" fill="#fff8e0" fontFamily="serif">poetry</text>
      </g>

      {/* tiny bird figurine */}
      <g transform="translate(298 588)">
        <ellipse cx="6" cy="14" rx="10" ry="2.4" fill="#1a0a06" opacity="0.4" />
        <ellipse cx="6" cy="10" rx="7" ry="5" fill="#9abe7a" />
        <ellipse cx="2" cy="7" rx="3.4" ry="3" fill="#9abe7a" />
        <ellipse cx="0" cy="7" rx="0.6" ry="0.6" fill="#0a0605" />
        <path d="M -2 8 L -5 8" stroke="#c97844" strokeWidth="0.8" />
        <path d="M 8 12 q 2 -1 4 0" stroke="#5a7e4a" strokeWidth="0.5" fill="none" />
      </g>

      {/* small candle in jar */}
      <g transform="translate(580 580)">
        <rect x="0" y="6" width="22" height="22" rx="2" fill="#fbf1e0" opacity="0.85" />
        <rect x="0" y="6" width="22" height="22" rx="2" fill="none" stroke="#a08470" strokeWidth="0.5" opacity="0.6" />
        <rect x="2" y="22" width="18" height="4" fill="#f4ead8" opacity="0.85" />
        <line x1="11" y1="6" x2="11" y2="2" stroke="#1a1410" strokeWidth="0.6" />
        <ellipse cx="11" cy="0" rx="2" ry="3.5" fill="#ffce8a"
          style={{ animation: 'flicker 3.5s ease-in-out infinite' }} />
        <ellipse cx="11" cy="1" rx="0.7" ry="2" fill="#fff8e0" />
      </g>

      {/* MUG SUCCULENT (a plant in a mug) on right sill */}
      <g style={{ transformOrigin: '628px 600px', animation: 'leafSwayB 12s ease-in-out infinite' }}>
        <path d="M 614 596 L 642 596 L 640 622 L 616 622 Z" fill="#fbf1e0" />
        <ellipse cx="628" cy="596" rx="14" ry="3" fill="#3a2418" />
        <ellipse cx="628" cy="596" rx="11" ry="2" fill="#7a4828" />
        <ellipse cx="628" cy="588" rx="8" ry="6" fill="#6a8a4e" />
        <ellipse cx="624" cy="582" rx="4" ry="6" fill="#7a9c5e" transform="rotate(-15 624 582)" />
        <ellipse cx="632" cy="580" rx="4" ry="6" fill="#8aae6a" transform="rotate(15 632 580)" />
        <ellipse cx="628" cy="576" rx="3" ry="4" fill="#9abe7a" />
        {/* mug handle */}
        <path d="M 642 600 Q 650 600 650 612 Q 650 620 644 620" stroke="#a08470" strokeWidth="2" fill="none" />
      </g>
    </g>
  );
}

function MurphyOnSill({ alert: _alert, onTap }: { alert: boolean; onTap?: () => void }) {
  // Murphy sits upright on the LEFT half of the sill, in 3/4 view facing slightly right (toward viewer / Hettie below).
  // Sill top is at y=582. Murphy's bum on sill at y=580, body extends up to y=440, head at y=440-510.
  return (
    <g
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default', transformOrigin: '200px 540px', animation: 'breathe 5s ease-in-out infinite' }}
      tabIndex={onTap ? 0 : undefined}
      role={onTap ? 'button' : undefined}
      aria-label={onTap ? 'pet Murphy' : undefined}
      onKeyDown={(e) => { if (onTap && (e.key === 'Enter' || e.key === ' ')) onTap(); }}
    >
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
        {/* skull — a touch smaller so body reads */}
        <ellipse cx="212" cy="472" rx="40" ry="36" fill="url(#murphyCoat)" />
        {/* lighter crown highlight */}
        <ellipse cx="216" cy="452" rx="20" ry="9" fill="#6a4430" opacity="0.65" />

        {/* TAN EYEBROW SPOTS — rottweiler-style warmth, reads against dark coat */}
        <ellipse cx="196" cy="460" rx="4.5" ry="2.8" fill="url(#murphyTan)" opacity="0.85" transform="rotate(-12 196 460)" />
        <ellipse cx="234" cy="458" rx="5" ry="3" fill="url(#murphyTan)" opacity="0.9" transform="rotate(8 234 458)" />

        {/* MUZZLE — pointing forward-right, with tan underside for contrast */}
        <path d="M 222 488 Q 256 488 270 502 Q 270 518 256 522 Q 232 522 218 514 Q 212 502 222 488 Z" fill="#2a1810" />
        {/* warm tan underside — lifts the face out of the shadow */}
        <path d="M 224 506 Q 248 512 264 510 Q 262 520 250 522 Q 230 522 220 516 Q 218 510 224 506 Z" fill="url(#murphyTan)" opacity="0.6" />
        {/* muzzle crease */}
        <path d="M 232 514 Q 252 520 268 514" stroke="#0a0605" strokeWidth="0.8" fill="none" opacity="0.55" />
        {/* nose — glossy */}
        <ellipse cx="266" cy="500" rx="7" ry="5.5" fill="#1a0e08" />
        <ellipse cx="264" cy="498" rx="2.4" ry="1.4" fill="#8a6a4a" opacity="0.75" />
        {/* mouth */}
        <path d="M 248 514 Q 256 522 264 516" stroke="#0a0605" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
        {/* tongue */}
        <ellipse cx="256" cy="520" rx="3" ry="1.6" fill="#d46a5a" opacity="0.75" />

        {/* EYES — bright amber iris, visible against dark coat */}
        <g style={{ transformOrigin: '218px 470px', animation: 'eyeBreathDog 11s ease-in-out infinite' }}>
          {/* left eye (further from viewer, smaller) */}
          <g>
            <ellipse cx="200" cy="470" rx="6" ry="4.5" fill="#fff4d8" opacity="0.55" />
            <ellipse cx="200" cy="471" rx="4.6" ry="3.7" fill="url(#murphyEye)" />
            <circle cx="200" cy="471" r="1.8" fill="#0a0605" />
            <circle cx="201" cy="469.5" r="1" fill="#fff8e0" />
            <circle cx="199.5" cy="472" r="0.5" fill="#fff" opacity="0.75" />
          </g>
          {/* right eye (closer to viewer, larger) */}
          <g>
            <ellipse cx="234" cy="468" rx="7" ry="5" fill="#fff4d8" opacity="0.55" />
            <ellipse cx="234" cy="469" rx="5.5" ry="4.1" fill="url(#murphyEye)" />
            <circle cx="234" cy="469" r="2.2" fill="#0a0605" />
            <circle cx="235.5" cy="467" r="1.3" fill="#fff8e0" />
            <circle cx="233" cy="470.5" r="0.6" fill="#fff" opacity="0.8" />
          </g>
        </g>

        {/* eyebrows — subtle arches above tan spots */}
        <path d="M 190 458 Q 200 454 210 458" stroke="#1a0e08" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 224 456 Q 234 452 244 456" stroke="#1a0e08" strokeWidth="1.1" fill="none" opacity="0.55" />

        {/* whiskers */}
        <path d="M 220 504 L 200 500 M 220 508 L 198 510 M 222 512 L 200 516" stroke="#8a6a4a" strokeWidth="0.4" opacity="0.7" />

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

      {/* WHITE/CREAM CHEST — visible bib */}
      <path d="M 200 526 Q 220 520 240 526 Q 248 546 232 560 Q 214 564 198 556 Q 190 540 200 526 Z" fill="url(#murphyCream)" opacity="0.95" />
      <path d="M 208 540 Q 222 540 232 542" stroke="#c8b090" strokeWidth="0.5" fill="none" opacity="0.6" />

      {/* FRONT PAWS — resting on sill, with visible toes and cream pads */}
      <g>
        {/* left paw */}
        <ellipse cx="206" cy="580" rx="14" ry="7.5" fill="url(#murphyCoat)" />
        <ellipse cx="208" cy="584" rx="9" ry="3.2" fill="url(#murphyCream)" opacity="0.95" />
        <path d="M 200 576 Q 199 584 202 588 M 206 574 Q 205 584 208 588 M 212 576 Q 212 584 214 588" stroke="#2a1810" strokeWidth="0.7" fill="none" opacity="0.7" />
        {/* tan accent on the toes */}
        <ellipse cx="206" cy="584" rx="5" ry="1.2" fill="url(#murphyTan)" opacity="0.35" />

        {/* right paw */}
        <ellipse cx="244" cy="580" rx="14" ry="7.5" fill="url(#murphyCoat)" />
        <ellipse cx="248" cy="584" rx="9" ry="3.2" fill="url(#murphyCream)" opacity="0.95" />
        <path d="M 238 576 Q 237 584 240 588 M 244 574 Q 244 584 246 588 M 250 576 Q 250 584 252 588" stroke="#2a1810" strokeWidth="0.7" fill="none" opacity="0.7" />
        <ellipse cx="246" cy="584" rx="5" ry="1.2" fill="url(#murphyTan)" opacity="0.35" />
      </g>

      {/* COLLAR with round brass name tag */}
      <path d="M 188 522 Q 220 532 250 522" stroke="#c75a4a" strokeWidth="3.4" fill="none" />
      <path d="M 188 522 Q 220 532 250 522" stroke="#a84030" strokeWidth="1.2" fill="none" opacity="0.5" />
      {/* small brass disc */}
      <g transform="translate(220 540)">
        <line x1="0" y1="-8" x2="0" y2="-4" stroke="#a87030" strokeWidth="0.6" />
        <circle r="5" fill="#fcd092" stroke="#a87030" strokeWidth="0.5" />
        <circle r="5" fill="url(#murphyRim)" opacity="0.4" />
        <text x="0" y="1.6" textAnchor="middle" fontSize="4.5" fill="#5a3424" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="500">M</text>
      </g>

      {/* RIM LIGHT from sky behind */}
      <path d="M 252 446 Q 286 480 290 540" stroke="url(#murphyRim)" strokeWidth="6" fill="none" opacity="0.85" />
      <path d="M 270 560 Q 280 570 290 580" stroke="url(#murphyRim)" strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M 232 444 Q 250 440 264 444" stroke="#fff4d8" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />

      {/* tiny pulsing "tap me" heart hint above Murphy */}
      <g style={{ animation: 'pulseHeart 6s ease-in-out infinite' }} pointerEvents="none">
        <text x="320" y="428" fontSize="14" fill="#c75a4a" fontFamily="serif" opacity="0.6">♥</text>
      </g>
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

function FairyLights({ isNight }: { isNight?: boolean }) {
  const beads = [
    { x: 60, y: 86 }, { x: 120, y: 92 }, { x: 180, y: 96 }, { x: 240, y: 94 },
    { x: 300, y: 90 }, { x: 360, y: 88 }, { x: 420, y: 90 }, { x: 480, y: 92 },
    { x: 540, y: 96 }, { x: 600, y: 92 }, { x: 660, y: 86 },
  ];
  const glowR = isNight ? 16 : 11;
  return (
    <g>
      <path d="M 50 76 Q 200 102 360 92 Q 520 82 670 88" stroke="#3a2418" strokeWidth="0.6" fill="none" opacity="0.65" />
      {beads.map((b, i) => (
        <g key={i}>
          {isNight && (
            <circle cx={b.x} cy={b.y} r="22" fill="url(#fairyGlow)" opacity="0.5"
              style={{ animation: `fairyPulse ${3 + (i % 4) * 0.4}s ease-in-out infinite`, animationDelay: `${(i * 0.3) % 2}s` }} />
          )}
          <circle cx={b.x} cy={b.y} r={glowR} fill="url(#fairyGlow)"
            style={{ animation: `fairyPulse ${2.5 + (i % 4) * 0.4}s ease-in-out infinite`, animationDelay: `${(i * 0.3) % 2}s` }} />
          <circle cx={b.x} cy={b.y} r="2.8" fill="#fff4d6" />
          <circle cx={b.x} cy={b.y} r="1.4" fill="#fff8e8" />
        </g>
      ))}
    </g>
  );
}

function PolaroidWall() {
  // CLEANER LAYOUT: a tight stack of 3 polaroids high on each wall, well-spaced from clock/calendar/chalkboard
  return (
    <g opacity="0.97">
      {/* LEFT WALL cluster — TIGHT vertical stack ABOVE the lamp shade
          Wall area: x=140-260, y=620-720 (clear of lamp at x=120-220 below y=720) */}
      {/* polaroid 1 — Garda */}
      <g transform="translate(160 628) rotate(-6)">
        <rect width="42" height="50" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="36" height="36" fill="#7a8aa0" />
        <path d="M 3 26 L 39 26 L 39 39 L 3 39 Z" fill="#5a7088" />
        <path d="M 3 16 Q 14 12 22 16 Q 30 20 39 16 L 39 26 L 3 26 Z" fill="#3a4a5a" opacity="0.85" />
        <text x="21" y="46" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">garda 🤍</text>
        <rect x="14" y="-4" width="14" height="6" fill="#fce4a8" opacity="0.75" />
      </g>
      {/* polaroid 2 — heart "us" — slightly right and below */}
      <g transform="translate(214 656) rotate(5)">
        <rect width="38" height="46" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="32" height="32" fill="#c97844" />
        <path d="M 19 13 q -5 -5 -8 -1 q -3 5 8 12 q 11 -7 8 -12 q -3 -4 -8 1 Z" fill="#fff4d8" opacity="0.92" />
        <text x="19" y="42" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">us</text>
        <rect x="12" y="-4" width="14" height="5" fill="#fce4a8" opacity="0.75" />
      </g>

      {/* RIGHT WALL cluster — TIGHT stack between sill and chalkboard
          Wall area: x=440-560, y=620-700 (above chalkboard which starts at y=700) */}
      {/* polaroid 3 — Murphy */}
      <g transform="translate(456 628) rotate(-5)">
        <rect width="42" height="50" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="36" height="36" fill="#1a1410" />
        <ellipse cx="22" cy="28" rx="11" ry="7" fill="#2a1e16" />
        <ellipse cx="16" cy="22" rx="7" ry="7" fill="#2a1e16" />
        <ellipse cx="13" cy="24" rx="3" ry="5" fill="#1a1410" />
        <ellipse cx="19" cy="24" rx="3" ry="5" fill="#1a1410" />
        <circle cx="14.5" cy="22" r="0.7" fill="#fff" opacity="0.7" />
        <circle cx="17.5" cy="22" r="0.7" fill="#fff" opacity="0.7" />
        <ellipse cx="11" cy="25" rx="1.4" ry="0.8" fill="#0a0605" />
        <text x="22" y="46" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">murphy 🐶</text>
        <rect x="14" y="-4" width="14" height="6" fill="#fce4a8" opacity="0.75" />
      </g>
      {/* polaroid 4 — couple beach photo */}
      <g transform="translate(508 656) rotate(6)">
        <rect width="38" height="46" fill="#fbf1e0" rx="1.5" />
        <rect x="3" y="3" width="32" height="32" fill="#a8c0d8" />
        <rect x="3" y="20" width="32" height="14" fill="#fce4a8" />
        <ellipse cx="13" cy="18" rx="3" ry="5" fill="#c97844" />
        <ellipse cx="20" cy="18" rx="3" ry="5" fill="#5a3424" />
        <ellipse cx="13" cy="24" rx="2.4" ry="3" fill="#c97844" />
        <ellipse cx="20" cy="24" rx="2.4" ry="3" fill="#3a2418" />
        <text x="19" y="42" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">us 💕</text>
      </g>

      {/* Heart sticker note — beside chalkboard (right wall) */}
      <g transform="translate(596 800) rotate(4)">
        <rect width="40" height="40" fill="#fce4a8" rx="1" />
        <text x="20" y="18" textAnchor="middle" fontSize="9" fill="#9a3030" fontFamily="Caveat, cursive">love u</text>
        <text x="20" y="30" textAnchor="middle" fontSize="9" fill="#9a3030" fontFamily="Caveat, cursive">x x</text>
      </g>
    </g>
  );
}

/* Floating wood shelf on LEFT WALL — small and tucked above lamp arm without competing */
function LeftWallShelf() {
  return null;
}

/* Right wall: dried flower wreath + small home sign */
function RightWallDecor() {
  return (
    <g>
      {/* dried flower wreath, hanging from top */}
      <g transform="translate(580 660)" style={{ transformOrigin: '0 0', animation: 'leafSwayB 14s ease-in-out infinite' }}>
        {/* hanging string */}
        <line x1="0" y1="-12" x2="0" y2="0" stroke="#3a2418" strokeWidth="0.6" opacity="0.6" />
        {/* wreath base — circle of stems */}
        <circle cx="0" cy="20" r="22" fill="none" stroke="#7a4828" strokeWidth="3" opacity="0.85" />
        <circle cx="0" cy="20" r="22" fill="none" stroke="#5a3018" strokeWidth="1.4" opacity="0.5" />
        {/* dried sprigs around */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = Math.cos(a) * 22;
          const y = 20 + Math.sin(a) * 22;
          const colors = ['#c97844', '#9abe7a', '#a85970', '#fbe2ba', '#ec88a8', '#7a9c5e'];
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(a * 180 / Math.PI) + 90})`}>
              <ellipse cx="0" cy="-3" rx="2.4" ry="4" fill={colors[i % colors.length]} opacity="0.85" />
              <ellipse cx="0" cy="-1" rx="1.4" ry="2.4" fill={colors[(i + 2) % colors.length]} opacity="0.7" />
            </g>
          );
        })}
        {/* small heart ribbon at top */}
        <path d="M 0 -2 q -3 -3 -5 0 q -2 3 5 8 q 7 -5 5 -8 q -2 -3 -5 0 Z" fill="#c75a4a" opacity="0.85" />
      </g>
    </g>
  );
}

/* Wall poster — typography "home" or pressed flowers */
function WallPoster() {
  return (
    <g transform="translate(212 800) rotate(-2)">
      {/* frame */}
      <rect width="58" height="76" fill="#3a2418" />
      <rect x="2" y="2" width="54" height="72" fill="#fef8e0" />
      {/* pressed flowers inside */}
      <g transform="translate(29 32)">
        <ellipse cx="0" cy="0" rx="4" ry="6" fill="#c97844" opacity="0.85" transform="rotate(-15 0 0)" />
        <ellipse cx="-6" cy="-10" rx="3" ry="5" fill="#a85970" opacity="0.85" transform="rotate(-30)" />
        <ellipse cx="8" cy="-6" rx="3" ry="5" fill="#9abe7a" opacity="0.85" transform="rotate(20)" />
        <ellipse cx="0" cy="14" rx="3" ry="6" fill="#7a9c5e" opacity="0.85" />
        <line x1="0" y1="0" x2="0" y2="14" stroke="#5a7e4a" strokeWidth="0.6" />
        <line x1="-6" y1="-10" x2="0" y2="0" stroke="#5a7e4a" strokeWidth="0.5" />
        <line x1="8" y1="-6" x2="0" y2="0" stroke="#5a7e4a" strokeWidth="0.5" />
      </g>
      <text x="29" y="64" textAnchor="middle" fontSize="9" fill="#5a3424" fontFamily="Caveat, cursive">malvern</text>
    </g>
  );
}

/* Wall calendar — paper grid with X marks for days passed */
function WallCalendar({ daysSince, totalDays }: { daysSince: number; totalDays: number }) {
  const cols = 7;
  const rows = Math.ceil(totalDays / cols);
  const cell = 12;
  const w = cols * cell + 8;
  const h = rows * cell + 32;
  return (
    <g transform="translate(72 800) rotate(-3)">
      {/* push-pin */}
      <circle cx={w / 2} cy="-4" r="2.4" fill="#c75a4a" />
      <circle cx={w / 2} cy="-4" r="0.8" fill="#fff8e0" opacity="0.7" />

      {/* paper */}
      <rect width={w} height={h} fill="#fef8e0" rx="2" />
      <rect width={w} height="14" fill="#9ec3df" />
      <text x={w / 2} y="11" textAnchor="middle" fontSize="8" fill="#3a2418" fontFamily="Caveat, cursive" fontWeight="500">apr · may · jun</text>

      {/* days grid */}
      <g transform="translate(4 18)">
        {Array.from({ length: totalDays }).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x = c * cell;
          const y = r * cell;
          const passed = i < daysSince;
          const home = i === totalDays - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={cell - 1} height={cell - 1} fill={home ? '#c97844' : 'none'} stroke="#9a7a5a" strokeWidth="0.4" opacity="0.6" />
              {passed && (
                <g>
                  <line x1={x + 1} y1={y + 1} x2={x + cell - 2} y2={y + cell - 2} stroke="#9a3030" strokeWidth="1" strokeLinecap="round" />
                  <line x1={x + cell - 2} y1={y + 1} x2={x + 1} y2={y + cell - 2} stroke="#9a3030" strokeWidth="1" strokeLinecap="round" />
                </g>
              )}
              {home && (
                <path d={`M ${x + 5} ${y + 4} q -2 -2 -3.5 0 q -1.5 2 3.5 6 q 5 -4 3.5 -6 q -1.5 -2 -3.5 0 Z`} fill="#fff4d8" />
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
}

/* Love letter / envelope on the desk */
function LoveLetter() {
  return (
    <g transform="translate(530 922) rotate(-6)">
      {/* envelope */}
      <rect width="80" height="50" fill="#fef8e0" rx="2" />
      <path d="M 0 0 L 40 28 L 80 0" stroke="#9a7a5a" strokeWidth="0.6" fill="none" />
      <path d="M 0 50 L 30 26 M 80 50 L 50 26" stroke="#9a7a5a" strokeWidth="0.5" fill="none" opacity="0.5" />
      {/* heart wax seal */}
      <g transform="translate(40 26)">
        <circle r="6" fill="#c75a4a" />
        <path d="M 0 -3 q -3 -3 -5 0 q -2 3 5 6 q 7 -3 5 -6 q -2 -3 -5 0 Z" fill="#9a3030" />
      </g>
      {/* tiny address line */}
      <text x="40" y="44" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">to my hettie</text>
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

/* Wall clock on left side — high on wall, above the lamp */
function WallClock({ now }: { now: Date }) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const hourAngle = (h + m / 60) * 30; // 360/12
  const minAngle = m * 6; // 360/60
  return (
    <g transform="translate(76 632)">
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
      {/* second hand — animated continuously */}
      <g style={{ transformOrigin: '44px 46px', animation: 'spin 60s steps(60, end) infinite' }}>
        <line x1="44" y1="46" x2="44" y2="20" stroke="#c75a4a" strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="44" cy="20" r="1.2" fill="#c75a4a" />
      </g>
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

/* Macrame hanging plant in upper-right of room */
function MacramePlant() {
  return (
    <g transform="translate(630 0)" style={{ transformOrigin: '0 100px', animation: 'leafSwayB 12s ease-in-out infinite' }}>
      {/* macrame ropes */}
      <line x1="0" y1="0" x2="-12" y2="120" stroke="#dccab0" strokeWidth="1" opacity="0.85" />
      <line x1="0" y1="0" x2="12" y2="120" stroke="#dccab0" strokeWidth="1" opacity="0.85" />
      <line x1="0" y1="0" x2="0" y2="118" stroke="#dccab0" strokeWidth="1" opacity="0.85" />
      {/* knots in macrame */}
      <g fill="#dccab0">
        <circle cx="-8" cy="40" r="2" />
        <circle cx="8" cy="40" r="2" />
        <circle cx="0" cy="40" r="2" />
        <circle cx="-10" cy="80" r="2" />
        <circle cx="10" cy="80" r="2" />
        <circle cx="0" cy="80" r="2" />
        <circle cx="-12" cy="116" r="2.4" />
        <circle cx="12" cy="116" r="2.4" />
        <circle cx="0" cy="116" r="2.4" />
      </g>
      {/* twined diamonds */}
      <path d="M -8 50 L 0 60 L 8 50 M -8 70 L 0 60 L 8 70" stroke="#dccab0" strokeWidth="0.8" fill="none" opacity="0.7" />
      <path d="M -10 90 L 0 100 L 10 90 M -10 110 L 0 100 L 10 110" stroke="#dccab0" strokeWidth="0.8" fill="none" opacity="0.7" />

      {/* pot */}
      <ellipse cx="0" cy="120" rx="20" ry="4" fill="#3a2418" opacity="0.55" />
      <path d="M -22 120 L 22 120 L 18 144 L -18 144 Z" fill="#7a4828" />
      <ellipse cx="0" cy="120" rx="22" ry="5" fill="#5a3018" />

      {/* string of pearls plant — trailing */}
      <g>
        <path d="M -14 124 Q -22 160 -28 196 Q -32 220 -28 232" stroke="#5a7e4a" strokeWidth="1.2" fill="none" opacity="0.85" />
        {[130, 140, 152, 164, 176, 188, 200, 212, 222, 232].map((y, i) => (
          <circle key={i} cx={-16 - i * 1.2} cy={y} r={2.8 - i * 0.1} fill="#9abe7a" />
        ))}
        <path d="M 14 124 Q 22 158 28 192 Q 30 214 26 226" stroke="#5a7e4a" strokeWidth="1.2" fill="none" opacity="0.85" />
        {[130, 140, 152, 164, 176, 188, 200, 212, 222].map((y, i) => (
          <circle key={i} cx={16 + i * 1.4} cy={y} r={2.8 - i * 0.1} fill="#8aae6a" />
        ))}
        <path d="M 0 124 Q 4 156 -2 188" stroke="#5a7e4a" strokeWidth="1.2" fill="none" opacity="0.85" />
        {[130, 142, 154, 166, 178].map((y, i) => (
          <circle key={i} cx={2 - i * 0.6} cy={y} r={2.6 - i * 0.1} fill="#9abe7a" />
        ))}
      </g>
    </g>
  );
}

/* Sun catcher hanging inside the window — crystal that catches light */
function SunCatcher() {
  return (
    <g transform="translate(560 80)" style={{ transformOrigin: '0 0', animation: 'leafSwayB 16s ease-in-out infinite' }}>
      {/* string */}
      <line x1="0" y1="0" x2="0" y2="120" stroke="#3a2418" strokeWidth="0.5" opacity="0.55" />
      {/* small beads on string */}
      <circle cx="0" cy="40" r="2.4" fill="#a08470" opacity="0.7" />
      <circle cx="0" cy="60" r="3" fill="#9abe7a" opacity="0.7" />
      <circle cx="0" cy="80" r="2.4" fill="#c75a4a" opacity="0.7" />
      {/* crystal prism */}
      <g style={{ transformOrigin: '0 105px', animation: 'spin 22s linear infinite' }}>
        <path d="M -10 110 L 0 90 L 10 110 L 0 130 Z" fill="#d8e8f0" opacity="0.7" />
        <path d="M -10 110 L 0 90 L 0 130 Z" fill="#a8b8c8" opacity="0.7" />
        <path d="M 0 90 L 10 110 L 0 130 Z" fill="#f4fcff" opacity="0.85" />
        {/* facet shines */}
        <path d="M -6 108 L -2 96 M 4 96 L 8 108 M -2 124 L -6 116" stroke="#fff8e0" strokeWidth="0.4" opacity="0.85" />
      </g>
      {/* tiny rainbow casts on sill */}
      <g opacity="0.65" style={{ animation: 'fairyPulse 5s ease-in-out infinite' }}>
        <ellipse cx="-50" cy="500" rx="3" ry="1.4" fill="#c75a4a" opacity="0.5" />
        <ellipse cx="-44" cy="500" rx="3" ry="1.4" fill="#fcd092" opacity="0.5" />
        <ellipse cx="-38" cy="500" rx="3" ry="1.4" fill="#9abe7a" opacity="0.5" />
        <ellipse cx="-32" cy="500" rx="3" ry="1.4" fill="#a8c0d8" opacity="0.5" />
      </g>
    </g>
  );
}

/* Wind chime hanging in the window — sways gently */
function WindChime() {
  return (
    <g transform="translate(150 80)" style={{ transformOrigin: '0 0', animation: 'leafSwayA 14s ease-in-out infinite' }}>
      <line x1="0" y1="0" x2="0" y2="60" stroke="#5a3424" strokeWidth="0.5" opacity="0.65" />
      {/* hanger ring */}
      <circle cx="0" cy="60" r="3" fill="none" stroke="#9a7a5a" strokeWidth="0.8" />
      {/* chimes */}
      <line x1="-6" y1="64" x2="-6" y2="100" stroke="#dccab0" strokeWidth="1.2" />
      <line x1="-2" y1="64" x2="-2" y2="108" stroke="#dccab0" strokeWidth="1.2" />
      <line x1="2" y1="64" x2="2" y2="104" stroke="#dccab0" strokeWidth="1.2" />
      <line x1="6" y1="64" x2="6" y2="96" stroke="#dccab0" strokeWidth="1.2" />
      {/* center catcher */}
      <line x1="0" y1="64" x2="0" y2="108" stroke="#9a7a5a" strokeWidth="0.4" />
      <ellipse cx="0" cy="108" rx="3" ry="2" fill="#9a7a5a" />
    </g>
  );
}

/* Trailing ivy draping from the top of the window frame down both sides —
   adds a soft, cottagey "grown-in" feeling. */
function TrailingIvy({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  // Anchor above the curtain rod, just inside the window frame
  const anchorX = isLeft ? 76 : 644;
  const sway = isLeft ? 'ivySwayL' : 'ivySwayR';

  // Each trailing stem is an array of {x, y} offsets from anchor where leaves grow
  const leaves = [
    { yy: 56, xx: isLeft ? -2 : 2,  size: 9, tilt: isLeft ? -28 : 28,  shade: '#7a9c5e' },
    { yy: 92, xx: isLeft ? 6  : -6, size: 11, tilt: isLeft ? 22 : -22, shade: '#8aae6a' },
    { yy: 130, xx: isLeft ? -4 : 4, size: 10, tilt: isLeft ? -18 : 18, shade: '#9abe7a' },
    { yy: 166, xx: isLeft ? 8 : -8, size: 12, tilt: isLeft ? 28 : -28, shade: '#7aa860' },
    { yy: 202, xx: isLeft ? -6 : 6, size: 10, tilt: isLeft ? -22 : 22, shade: '#8aae6a' },
    { yy: 236, xx: isLeft ? 4  : -4, size: 9, tilt: isLeft ? 20 : -20, shade: '#6a8e4e' },
    { yy: 272, xx: isLeft ? -8 : 8, size: 11, tilt: isLeft ? -18 : 18, shade: '#7aa860' },
    { yy: 308, xx: isLeft ? 2  : -2, size: 9,  tilt: isLeft ? 24 : -24, shade: '#9abe7a' },
  ];

  return (
    <g
      style={{ transformOrigin: `${anchorX}px 82px`, animation: `${sway} 9s ease-in-out infinite` }}
      pointerEvents="none"
    >
      {/* main vine — a gentle S-curve hanging down, staying close to the inner frame edge */}
      <path
        d={isLeft
          ? `M ${anchorX},82 C ${anchorX - 2},140 ${anchorX + 6},200 ${anchorX - 2},268 C ${anchorX - 4},300 ${anchorX + 2},330 ${anchorX - 2},360`
          : `M ${anchorX},82 C ${anchorX + 2},140 ${anchorX - 6},200 ${anchorX + 2},268 C ${anchorX + 4},300 ${anchorX - 2},330 ${anchorX + 2},360`}
        stroke="#4a6a38" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.9"
      />
      {/* leaves along the vine */}
      {leaves.map((lf, i) => (
        <g key={i} transform={`translate(${anchorX + lf.xx}, ${82 + lf.yy}) rotate(${lf.tilt})`}>
          <ellipse cx="0" cy="0" rx={lf.size * 0.42} ry={lf.size} fill={lf.shade} />
          <path d={`M 0 ${-lf.size * 0.9} L 0 ${lf.size * 0.9}`} stroke="#3a5028" strokeWidth="0.4" opacity="0.5" />
          {/* highlight */}
          <ellipse cx={-lf.size * 0.12} cy={-lf.size * 0.3} rx={lf.size * 0.22} ry={lf.size * 0.45}
            fill="#b8d898" opacity="0.35" />
        </g>
      ))}
      {/* tendrils — short curly bits */}
      <path
        d={isLeft
          ? `M ${anchorX - 2},360 q -4,8 2,14 q 6,-2 4,-10`
          : `M ${anchorX + 2},360 q 4,8 -2,14 q -6,-2 -4,-10`}
        stroke="#4a6a38" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.7"
      />
    </g>
  );
}

/* Climbing vine creeping up the room corner — sparser, reaches up toward the ceiling. */
function CornerClimber({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const xBase = isLeft ? 10 : 710;
  const sway = isLeft ? 'ivySwayL' : 'ivySwayR';

  const leaves = [
    { y: 1070, size: 8, tilt: isLeft ? 20 : -20, shade: '#7aa860' },
    { y: 1020, size: 10, tilt: isLeft ? -15 : 15, shade: '#8aae6a' },
    { y: 970,  size: 9,  tilt: isLeft ? 18 : -18, shade: '#9abe7a' },
    { y: 920,  size: 11, tilt: isLeft ? -12 : 12, shade: '#7aa860' },
    { y: 870,  size: 8,  tilt: isLeft ? 22 : -22, shade: '#8aae6a' },
  ];

  return (
    <g
      style={{ transformOrigin: `${xBase}px 1080px`, animation: `${sway} 13s ease-in-out infinite` }}
      pointerEvents="none"
      opacity="0.85"
    >
      {/* climbing stem */}
      <path
        d={isLeft
          ? `M ${xBase},1080 Q ${xBase + 8},1000 ${xBase + 4},920 Q ${xBase + 10},870 ${xBase + 6},840`
          : `M ${xBase},1080 Q ${xBase - 8},1000 ${xBase - 4},920 Q ${xBase - 10},870 ${xBase - 6},840`}
        stroke="#4a6a38" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.85"
      />
      {leaves.map((lf, i) => {
        const offX = isLeft ? 4 + (i % 2) * 4 : -4 - (i % 2) * 4;
        return (
          <g key={i} transform={`translate(${xBase + offX}, ${lf.y}) rotate(${lf.tilt})`}>
            <ellipse cx="0" cy="0" rx={lf.size * 0.45} ry={lf.size} fill={lf.shade} />
            <ellipse cx={-lf.size * 0.12} cy={-lf.size * 0.3} rx={lf.size * 0.22} ry={lf.size * 0.45}
              fill="#b8d898" opacity="0.35" />
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

      {/* FOREGROUND BIG POTTED PLANT — far right corner */}
      <g transform="translate(620 1060)" style={{ transformOrigin: '70px 200px', animation: 'leafSwayB 13s ease-in-out infinite' }}>
        {/* drop shadow */}
        <ellipse cx="70" cy="200" rx="70" ry="10" fill="#1a0a06" opacity="0.5" />
        {/* terracotta pot */}
        <path d="M 14 100 L 126 100 L 116 196 L 24 196 Z" fill="#a04a3a" />
        <path d="M 14 100 L 126 100 L 122 110 L 18 110 Z" fill="#7a2818" opacity="0.65" />
        <ellipse cx="70" cy="100" rx="56" ry="8" fill="#5a1d18" />
        <ellipse cx="70" cy="100" rx="50" ry="6" fill="#3a0e08" opacity="0.8" />
        {/* pot rim */}
        <rect x="14" y="100" width="112" height="3" fill="#7a2818" />
        {/* big leaves coming up — like a fiddle leaf or large monstera */}
        {/* main stem */}
        <path d="M 56 100 Q 50 80 56 60 Q 64 40 60 0" stroke="#5a7e4a" strokeWidth="2.4" fill="none" />
        <path d="M 70 100 Q 76 80 70 60 Q 64 40 70 10" stroke="#5a7e4a" strokeWidth="2" fill="none" />
        <path d="M 86 100 Q 88 70 84 40" stroke="#5a7e4a" strokeWidth="1.8" fill="none" />
        {/* big leaves */}
        <path d="M 56 -4 Q 36 -10 28 6 Q 24 24 38 24 Q 56 22 60 6 Q 60 0 56 -4 Z" fill="#5a8a4a" />
        <path d="M 56 -4 Q 60 6 60 6 Q 56 12 50 16" stroke="#3a5a30" strokeWidth="0.8" fill="none" />
        <path d="M 70 6 Q 92 0 96 18 Q 96 36 80 38 Q 66 32 68 14 Q 68 8 70 6 Z" fill="#6a9c5a" />
        <path d="M 70 6 Q 78 24 80 38" stroke="#3a5a30" strokeWidth="0.8" fill="none" />
        <path d="M 60 30 Q 38 26 32 44 Q 32 60 50 58 Q 64 54 64 36 Q 64 32 60 30 Z" fill="#7aae5e" />
        <path d="M 60 30 Q 56 44 50 58" stroke="#3a5a30" strokeWidth="0.8" fill="none" />
        <path d="M 84 36 Q 104 30 110 48 Q 110 62 92 62 Q 80 56 80 42 Q 80 36 84 36 Z" fill="#5a8a4a" />
        <path d="M 84 36 Q 90 50 92 62" stroke="#3a5a30" strokeWidth="0.8" fill="none" />
        <path d="M 56 60 Q 36 56 32 76 Q 36 90 52 88 Q 64 80 60 64 Q 58 60 56 60 Z" fill="#6a9c5a" />
      </g>

      {/* Knit basket of yarn */}
      <g transform="translate(20 1212)">
        <ellipse cx="22" cy="46" rx="26" ry="6" fill="#1a0a06" opacity="0.5" />
        <path d="M 0 24 Q 0 8 22 8 Q 44 8 44 24 L 42 46 Q 42 50 22 50 Q 2 50 2 46 Z" fill="#9a7a5a" />
        <path d="M 0 24 Q 0 14 22 14 Q 44 14 44 24" stroke="#5a3424" strokeWidth="0.6" fill="none" opacity="0.7" />
        <ellipse cx="22" cy="24" rx="22" ry="6" fill="#7a5828" />
        {/* yarn ball inside */}
        <circle cx="22" cy="22" r="11" fill="#c75a4a" />
        <path d="M 14 22 q 4 -2 8 0 q 4 2 8 0 M 12 26 q 4 -2 10 0 q 4 2 8 -2 M 14 18 q 4 2 8 0 q 4 -2 8 2" stroke="#9a3a30" strokeWidth="0.5" fill="none" opacity="0.75" />
        {/* knitting needles */}
        <line x1="32" y1="8" x2="44" y2="-6" stroke="#fbf1e0" strokeWidth="1" />
        <circle cx="44" cy="-6" r="1.4" fill="#fbf1e0" />
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

      {/* coffee/tea mug with tea tag */}
      <g transform="translate(40 838)">
        <path d="M 0 0 L 50 0 L 46 64 L 4 64 Z" fill="url(#mugBody)" />
        <ellipse cx="25" cy="0" rx="25" ry="5" fill="#3a1d10" />
        <ellipse cx="25" cy="0" rx="22" ry="3.5" fill="#6a3818" />
        <path d="M 50 8 Q 64 8 64 30 Q 64 44 54 44" stroke="#9a7a5a" strokeWidth="4" fill="none" />
        {/* heart on mug */}
        <path d="M 18 16 q -4 -4 -8 0 q -4 4 8 12 q 12 -8 8 -12 q -4 -4 -8 0 Z" fill="#c75a4a" opacity="0.85" />
        {/* tea tag string + tag dangling */}
        <line x1="32" y1="0" x2="44" y2="22" stroke="#fbf1e0" strokeWidth="0.5" opacity="0.85" />
        <rect x="40" y="22" width="10" height="8" fill="#fef8e0" />
        <text x="45" y="28" textAnchor="middle" fontSize="4" fill="#5a3424" fontFamily="serif">TEA</text>
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

      {/* CD player (vinyl box) on left — with spinning record */}
      <g transform="translate(126 856)">
        <ellipse cx="40" cy="42" rx="44" ry="6" fill="#1a1410" opacity="0.4" />
        <rect width="80" height="36" y="6" fill="#1a1410" rx="3" />
        {/* spinning vinyl */}
        <g style={{ transformOrigin: '56px 24px', animation: 'spin 8s linear infinite' }}>
          <circle cx="56" cy="24" r="14" fill="#0a0605" stroke="#3a2418" strokeWidth="0.6" />
          <circle cx="56" cy="24" r="11" fill="none" stroke="#1a1410" strokeWidth="0.4" opacity="0.6" />
          <circle cx="56" cy="24" r="8" fill="none" stroke="#1a1410" strokeWidth="0.4" opacity="0.5" />
          {/* label */}
          <circle cx="56" cy="24" r="4" fill="#c75a4a" />
          <circle cx="56" cy="24" r="0.8" fill="#fbf1e0" />
          {/* highlight reflection */}
          <path d="M 50 20 q 4 -2 8 0" stroke="#fff8e0" strokeWidth="0.4" fill="none" opacity="0.4" />
        </g>
        {/* tonearm */}
        <line x1="74" y1="14" x2="60" y2="22" stroke="#7a6048" strokeWidth="0.8" />
        <circle cx="74" cy="14" r="1.4" fill="#7a6048" />
        <circle cx="60" cy="22" r="0.9" fill="#3a2418" />
        {/* speaker grill on left */}
        <rect x="6" y="14" width="26" height="3" fill="#5a3424" rx="0.5" />
        <rect x="6" y="20" width="18" height="2" fill="#3a2418" />
        <rect x="6" y="24" width="18" height="2" fill="#3a2418" />
        {/* power LED */}
        <circle cx="74" cy="38" r="0.9" fill="#7afca8" style={{ animation: 'fairyPulse 3s ease-in-out infinite' }} />
      </g>

      {/* PHONE face down (right side of desk) — with subtle notification glow */}
      <g transform="translate(626 854) rotate(8)">
        <rect width="40" height="74" rx="6" fill="#1a1410" />
        <rect x="2" y="2" width="36" height="70" rx="5" fill="#2a1f1a" />
        {/* camera bump */}
        <rect x="6" y="6" width="14" height="14" rx="3" fill="#0a0605" />
        <circle cx="10" cy="10" r="1.6" fill="#3a2418" />
        <circle cx="16" cy="10" r="1.6" fill="#3a2418" />
        <circle cx="10" cy="16" r="1.4" fill="#3a2418" />
        {/* notification glow (heart from Xan) — pulses subtly */}
        <g style={{ animation: 'notifPulse 18s ease-in-out infinite' }}>
          <ellipse cx="20" cy="40" rx="22" ry="18" fill="#ec88a8" opacity="0.3" filter="blur(4px)" />
          <text x="20" y="44" textAnchor="middle" fontSize="9" fill="#fff8e0" opacity="0.85" fontFamily="serif">♥</text>
        </g>
      </g>

      {/* sticky notes pad */}
      <g transform="translate(40 894) rotate(-4)">
        <rect width="30" height="30" fill="#fbe2ba" />
        <rect width="30" height="30" fill="#fbe2ba" transform="translate(2 2)" opacity="0.85" />
        <text x="15" y="14" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">tea ☕</text>
        <text x="15" y="22" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">walk</text>
        <text x="15" y="29" textAnchor="middle" fontSize="6" fill="#5a3424" fontFamily="Caveat, cursive">x ♡</text>
      </g>

      {/* JAR OF PENS */}
      <g transform="translate(220 838)">
        <ellipse cx="14" cy="34" rx="16" ry="3" fill="#1a0a06" opacity="0.4" />
        <path d="M 0 4 Q 0 0 4 0 L 24 0 Q 28 0 28 4 L 28 32 Q 28 36 24 36 L 4 36 Q 0 36 0 32 Z" fill="#fbf1e0" opacity="0.85" />
        <ellipse cx="14" cy="4" rx="13" ry="2.6" fill="#3a2418" opacity="0.4" />
        {/* pens sticking up */}
        <rect x="6" y="-12" width="3" height="22" fill="#c75a4a" rx="1" />
        <rect x="6" y="-12" width="3" height="3" fill="#3a2418" />
        <rect x="11" y="-16" width="3" height="26" fill="#3a4858" rx="1" />
        <rect x="11" y="-16" width="3" height="3" fill="#fcd092" />
        <rect x="16" y="-10" width="3" height="20" fill="#5a7e4a" rx="1" />
        <rect x="20" y="-14" width="3" height="24" fill="#9a4030" rx="1" />
        {/* paintbrush */}
        <rect x="3" y="-18" width="2.4" height="28" fill="#7a4828" />
        <path d="M 4 -18 L 5.5 -22 L 7 -18 Z" fill="#3a2418" />
      </g>

      {/* WASHI TAPE roll */}
      <g transform="translate(440 884)">
        <ellipse cx="14" cy="18" rx="14" ry="2.4" fill="#1a0a06" opacity="0.4" />
        <ellipse cx="14" cy="14" rx="14" ry="3" fill="#ec88a8" />
        <ellipse cx="14" cy="14" rx="6" ry="1.4" fill="#1a0a06" />
        <path d="M 0 14 q 4 -1 8 0 q 4 -1 8 0 q 4 -1 8 0" stroke="#fff8e0" strokeWidth="0.6" fill="none" opacity="0.7" />
      </g>

      {/* POLAROID CAMERA on right of desk */}
      <g transform="translate(560 858) rotate(-4)">
        <rect width="48" height="36" rx="3" fill="#fef8e0" />
        <rect x="2" y="2" width="44" height="32" rx="2" fill="#fdf0d0" />
        <circle cx="24" cy="18" r="9" fill="#1a1410" />
        <circle cx="24" cy="18" r="6" fill="#3a2418" />
        <circle cx="24" cy="18" r="3" fill="#0a0605" />
        <circle cx="24" cy="18" r="1.5" fill="#5a3424" />
        <rect x="38" y="6" width="6" height="3" fill="#3a2418" rx="0.5" />
        <rect x="38" y="11" width="6" height="2" fill="#5a3424" />
        <rect x="6" y="6" width="6" height="3" fill="#c75a4a" rx="0.5" />
      </g>

      {/* GLASSES (reading glasses) */}
      <g transform="translate(360 894)">
        <circle cx="6" cy="6" r="6" fill="none" stroke="#1a1410" strokeWidth="1.4" />
        <circle cx="22" cy="6" r="6" fill="none" stroke="#1a1410" strokeWidth="1.4" />
        <line x1="12" y1="6" x2="16" y2="6" stroke="#1a1410" strokeWidth="1.4" />
      </g>

      {/* COASTER under mug */}
      <g transform="translate(36 894)">
        <ellipse cx="30" cy="6" rx="32" ry="6" fill="#9a7a5a" opacity="0.6" />
        <ellipse cx="30" cy="6" rx="28" ry="4" fill="#fbf1e0" opacity="0.85" />
      </g>

      {/* SMALL FRAMED PHOTO on desk — Hettie + Xan */}
      <g transform="translate(216 808) rotate(-3)">
        {/* easel back shadow */}
        <ellipse cx="22" cy="92" rx="26" ry="4" fill="#1a0a06" opacity="0.4" />
        {/* frame */}
        <rect x="0" y="0" width="44" height="56" fill="#3a2418" rx="2" />
        <rect x="3" y="3" width="38" height="50" fill="#fbf1e0" />
        {/* photo content — couple at sunset */}
        <rect x="3" y="3" width="38" height="50" fill="#f4a06a" />
        <path d="M 3 32 L 41 32 L 41 53 L 3 53 Z" fill="#3d5240" />
        <path d="M 3 26 Q 16 22 22 26 Q 28 30 41 24 L 41 32 L 3 32 Z" fill="#658260" opacity="0.75" />
        <circle cx="34" cy="14" r="5" fill="#fff0c0" />
        {/* tiny figures */}
        <ellipse cx="18" cy="34" rx="3" ry="6" fill="#c97844" />
        <ellipse cx="24" cy="34" rx="3" ry="6" fill="#3a2418" />
        <ellipse cx="18" cy="42" rx="2.6" ry="3" fill="#c97844" />
        <ellipse cx="24" cy="42" rx="2.6" ry="3" fill="#3a2418" />
        {/* easel leg */}
        <path d="M 22 53 L 22 86" stroke="#3a2418" strokeWidth="1.4" />
      </g>
    </g>
  );
}

function Hettie() {
  return (
    <g style={{ transformOrigin: '360px 800px', animation: 'breathe 5s ease-in-out infinite' }}>
      {/* Hettie sits at desk; her head + shoulders + hands visible above the desk surface (y=900) */}

      {/* CHAIR back behind Hettie */}
      <g>
        <rect x="218" y="800" width="284" height="110" fill="#3a2418" rx="10" />
        <rect x="226" y="808" width="268" height="98" fill="#8a4838" rx="7" />
        <path d="M 228 826 Q 360 832 492 826" stroke="#5a2818" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M 228 856 Q 360 862 492 856" stroke="#5a2818" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M 228 886 Q 360 892 492 886" stroke="#5a2818" strokeWidth="1" fill="none" opacity="0.6" />
      </g>

      {/* TORSO — hoodie (visible above desk) */}
      <g>
        {/* back of hoodie */}
        <path d="M 254 810 Q 230 850 232 905 L 488 905 Q 492 850 466 810 Q 440 776 396 770 Q 320 770 290 780 Q 270 794 254 810 Z" fill="url(#hoodieGrad)" />
        {/* hoodie knit texture (subtle vertical lines) */}
        {[260, 275, 290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455, 470, 485].map(x => (
          <path key={x} d={`M ${x} 820 Q ${x + 0.5} 855 ${x} 900`} stroke="#a08470" strokeWidth="0.4" fill="none" opacity="0.35" />
        ))}
        {/* CABLE KNIT detail — central twist pattern down the front */}
        {[820, 836, 852, 868, 884].map(y => (
          <g key={y}>
            <path d={`M 350 ${y} q 4 4 8 0 q 4 -4 8 0`} stroke="#a08470" strokeWidth="0.7" fill="none" opacity="0.6" />
            <path d={`M 350 ${y + 4} q 4 4 8 0 q 4 -4 8 0`} stroke="#a08470" strokeWidth="0.7" fill="none" opacity="0.5" />
          </g>
        ))}
        {/* side cable */}
        {[820, 836, 852, 868, 884].map(y => (
          <g key={`l${y}`}>
            <path d={`M 280 ${y} q 3 3 6 0`} stroke="#a08470" strokeWidth="0.6" fill="none" opacity="0.5" />
            <path d={`M 444 ${y} q 3 3 6 0`} stroke="#a08470" strokeWidth="0.6" fill="none" opacity="0.5" />
          </g>
        ))}
        {/* horizontal knit ridge */}
        <path d="M 246 858 Q 360 866 478 858" stroke="#a08470" strokeWidth="0.5" fill="none" opacity="0.4" />
        <path d="M 248 882 Q 360 890 476 882" stroke="#a08470" strokeWidth="0.4" fill="none" opacity="0.4" />
        {/* hoodie ribbed cuffs/hem */}
        <path d="M 240 898 Q 360 908 488 898 L 488 905 L 232 905 Z" fill="#9a7a5a" opacity="0.4" />

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
        <path d="M 304 882 Q 360 888 416 882" stroke="#9a7a5a" strokeWidth="0.5" fill="none" opacity="0.5" />
      </g>

      {/* RIGHT ARM upper part — going down from shoulder to elbow on desk */}
      <g>
        <path d="M 268 800 Q 252 836 250 894 L 282 902 Q 290 866 294 836 Q 294 818 286 808 Z" fill="url(#hoodieGrad)" />
        <path d="M 270 820 Q 268 850 268 890" stroke="#a08470" strokeWidth="1" fill="none" opacity="0.5" />
        <ellipse cx="266" cy="894" rx="22" ry="6" fill="#dccab0" opacity="0.85" />
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
        {/* subtle nose shadow on right side of nose */}
        <path d="M 366 728 Q 369 738 365 742" stroke="#c08a72" strokeWidth="0.8" fill="none" opacity="0.4" />
        {/* contour shadow along jaw on viewer-right (away from light) */}
        <path d="M 416 720 Q 414 740 406 754" stroke="#c08a72" strokeWidth="1.4" fill="none" opacity="0.3" />
        {/* subtle warm light catch on viewer-left cheek (toward lamp) */}
        <ellipse cx="324" cy="724" rx="14" ry="20" fill="#ffe6c8" opacity="0.25" />

        {/* ears */}
        <path d="M 302 706 Q 296 714 298 728 Q 304 736 312 728" fill="url(#skinGrad)" />
        <path d="M 418 706 Q 424 714 422 728 Q 416 736 408 728" fill="url(#skinGrad)" />
        <path d="M 420 712 Q 422 720 418 728" stroke="#c08a72" strokeWidth="0.4" fill="none" opacity="0.6" />

        {/* HAIR — organic crown + WISPY CURTAIN BANGS, connected to side hair */}
        <g style={{ transformOrigin: '362px 670px', animation: 'hairSway 9s ease-in-out infinite' }}>
          {/* CROWN — irregular natural shape that flows into the side mass below.
              Goes wider at top of head and tapers naturally down past the ears. */}
          <path
            d="M 290 660
               Q 280 640 286 614
               Q 298 590 326 596
               Q 344 588 362 590
               Q 380 588 398 596
               Q 426 590 438 614
               Q 444 640 434 660
               Q 442 678 442 700
               Q 432 670 416 660
               Q 384 654 362 654
               Q 340 654 308 660
               Q 292 670 282 700
               Q 282 678 290 660 Z"
            fill="url(#hairBase)"
          />

          {/* small clumps over the crown for irregular volume */}
          <path d="M 318 596 Q 326 586 340 590 Q 332 600 322 604 Z" fill="#c95a28" opacity="0.6" />
          <path d="M 370 590 Q 384 586 396 596 Q 388 604 376 600 Z" fill="#c95a28" opacity="0.55" />
          <path d="M 308 614 Q 318 606 330 614" stroke="#7a2818" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M 392 614 Q 402 606 416 614" stroke="#7a2818" strokeWidth="1.2" fill="none" opacity="0.55" />

          {/* CURTAIN BANGS — left side, FEATHERED with many strands */}
          <g>
            {/* main mass */}
            <path d="M 358 654 Q 348 660 338 670 Q 324 682 316 696 Q 312 706 318 712 Q 326 700 334 690 Q 346 676 358 666 Q 360 660 358 654 Z" fill="url(#hairBase)" opacity="0.95" />
            {/* individual feathered strands */}
            <path d="M 354 656 Q 348 666 340 678 Q 332 692 322 706" stroke="#9c3818" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M 350 658 Q 342 668 332 682 Q 322 696 314 708" stroke="#7a2818" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.75" />
            <path d="M 346 660 Q 338 672 328 688" stroke="#c95a28" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 342 662 Q 334 678 326 696" stroke="#9c3818" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M 358 654 Q 358 670 354 686" stroke="#c95a28" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.55" />
          </g>

          {/* CURTAIN BANGS — right side mirrored */}
          <g>
            <path d="M 366 654 Q 376 660 386 670 Q 400 682 408 696 Q 412 706 406 712 Q 398 700 390 690 Q 378 676 366 666 Q 364 660 366 654 Z" fill="url(#hairBase)" opacity="0.95" />
            <path d="M 370 656 Q 376 666 384 678 Q 392 692 402 706" stroke="#9c3818" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M 374 658 Q 382 668 392 682 Q 402 696 410 708" stroke="#7a2818" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.75" />
            <path d="M 378 660 Q 386 672 396 688" stroke="#c95a28" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 382 662 Q 390 678 398 696" stroke="#9c3818" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.55" />
            <path d="M 366 654 Q 366 670 370 686" stroke="#c95a28" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.55" />
          </g>

          {/* tiny baby hairs along the part for softness */}
          <path d="M 360 654 Q 360 660 358 666" stroke="#e87838" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M 364 654 Q 364 660 366 666" stroke="#e87838" strokeWidth="0.5" fill="none" opacity="0.7" />

          {/* soft shadow under the bangs (so forehead reads less bright) */}
          <path d="M 322 692 Q 362 688 402 692 Q 404 700 396 704 Q 362 700 328 704 Q 320 700 322 692 Z" fill="#5a1a08" opacity="0.28" />

          {/* tendrils falling in front of ears */}
          <path d="M 296 692 Q 290 712 294 730 Q 300 740 306 728 Q 304 712 300 696" stroke="url(#hairCurl)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 428 692 Q 434 712 430 730 Q 424 740 418 728 Q 420 712 424 696" stroke="url(#hairCurl)" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          {/* crown shines (softer, multiple) */}
          <path d="M 300 612 Q 332 600 360 604" stroke="#ffd078" strokeWidth="1.6" fill="none" opacity="0.8" strokeLinecap="round" />
          <path d="M 366 604 Q 396 602 426 614" stroke="#ffb060" strokeWidth="1.4" fill="none" opacity="0.75" strokeLinecap="round" />
          <path d="M 318 626 Q 348 622 358 624" stroke="#ffd078" strokeWidth="1" fill="none" opacity="0.55" strokeLinecap="round" />
          <path d="M 372 624 Q 396 622 412 626" stroke="#ffb060" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round" />
        </g>

        {/* EYES — soft closed/peaceful, with subtle blink/breath */}
        <g style={{ transformOrigin: '362px 712px', animation: 'eyeBreath 14s ease-in-out infinite' }}>
          {/* left eye */}
          <path d="M 320 712 Q 332 720 346 712" stroke="#2a1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 320 712 Q 322 710 326 711 M 346 712 Q 344 710 340 711" stroke="#2a1408" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.55" />
          {/* eyelashes */}
          <path d="M 322 712 L 320 708 M 327 715 L 326 711 M 332 716 L 332 712 M 338 715 L 339 711 M 343 712 L 345 708" stroke="#2a1408" strokeWidth="0.6" strokeLinecap="round" />

          {/* right eye */}
          <path d="M 378 712 Q 390 720 404 712" stroke="#2a1408" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 378 712 Q 380 710 384 711 M 404 712 Q 402 710 398 711" stroke="#2a1408" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M 380 712 L 378 708 M 385 715 L 384 711 M 390 716 L 390 712 M 396 715 L 397 711 M 401 712 L 403 708" stroke="#2a1408" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* eyebrows (don't blink) */}
        <path d="M 322 706 Q 332 702 344 706" stroke="#9a3818" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M 380 706 Q 390 702 402 706" stroke="#9a3818" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.85" />

        {/* nose */}
        <path d="M 362 720 Q 358 734 360 740 Q 364 744 368 742 Q 370 738 366 728" fill="none" stroke="#c08a72" strokeWidth="0.8" opacity="0.7" />
        <ellipse cx="363" cy="742" rx="2.2" ry="1" fill="#c08a72" opacity="0.55" />

        {/* lips — soft little smile */}
        <path d="M 346 752 Q 354 760 362 758 Q 370 760 378 752" stroke="#a8483a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 346 752 Q 354 762 362 760 Q 370 762 378 752 Q 362 754 346 752 Z" fill="#d87060" opacity="0.55" />
        <path d="M 360 754 Q 363 753 366 754" stroke="#fde2cc" strokeWidth="0.6" fill="none" opacity="0.7" />
        {/* lip highlight */}
        <path d="M 354 754 Q 362 752 370 754" stroke="#fde2cc" strokeWidth="0.4" fill="none" opacity="0.6" />

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

      {/* FOREARM going UP from elbow at desk to chin/cheek — drawn IN FRONT of hair so visible */}
      <g>
        <path d="M 254 894 Q 240 868 246 836 Q 256 802 280 778 Q 296 768 308 776 Q 314 790 308 808 Q 296 836 280 856 Q 268 884 264 900 Z" fill="url(#hoodieGrad)" />
        <path d="M 254 880 Q 268 850 286 822" stroke="#a08470" strokeWidth="0.8" fill="none" opacity="0.55" />
        {/* subtle shadow inside arm */}
        <path d="M 250 894 Q 244 870 250 838 Q 260 808 280 786" stroke="#1a0a06" strokeWidth="0.6" fill="none" opacity="0.3" />
        {/* sleeve cuff at wrist */}
        <ellipse cx="304" cy="780" rx="14" ry="5" fill="#dccab0" opacity="0.9" transform="rotate(-30 304 780)" />

        {/* HAND under the chin — soft, organic curled fingers propping up the cheek */}
        <g transform="translate(298 752)">
          {/* SINGLE FLOWING SHAPE — palm + curled fingers as one continuous form
              Hand is in 3/4 view, fingers curled towards the cheek (upper edge), palm facing right */}
          <path
            d="M 4 16
               Q -2 8 -2 -2
               Q 0 -10 6 -14
               Q 10 -22 16 -22
               Q 22 -22 22 -16
               Q 26 -22 30 -20
               Q 34 -16 32 -10
               Q 36 -14 38 -8
               Q 38 0 34 6
               Q 36 12 30 16
               Q 22 20 14 20
               Q 8 20 4 16 Z"
            fill="url(#skinGrad)"
          />

          {/* knuckle / finger separation lines — very subtle to suggest fingers without blocking */}
          <path d="M 14 -18 Q 12 -10 12 -2" stroke="#c08a72" strokeWidth="0.6" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M 22 -16 Q 20 -8 20 0" stroke="#c08a72" strokeWidth="0.6" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M 30 -10 Q 28 -2 28 6" stroke="#c08a72" strokeWidth="0.6" fill="none" opacity="0.4" strokeLinecap="round" />

          {/* knuckle highlights (where fingers fold over) */}
          <ellipse cx="14" cy="-18" rx="2" ry="1.4" fill="#fde2cc" opacity="0.55" />
          <ellipse cx="22" cy="-16" rx="2" ry="1.4" fill="#fde2cc" opacity="0.55" />
          <ellipse cx="30" cy="-12" rx="1.8" ry="1.2" fill="#fde2cc" opacity="0.5" />

          {/* palm shading — soft wash under fingers */}
          <path d="M 4 0 Q 14 8 26 6" stroke="#c08a72" strokeWidth="1.4" fill="none" opacity="0.32" strokeLinecap="round" />
          <path d="M 6 8 Q 16 14 26 12" stroke="#c08a72" strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round" />

          {/* outer edge highlight (catching warm lamp light) */}
          <path d="M 4 16 Q -1 8 -1 0" stroke="#fde2cc" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" />

          {/* shadow under chin from hand (fades onto cheek) */}
          <path d="M 6 -8 Q 18 -12 30 -10" stroke="#a85040" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />

          {/* delicate gold ring on index/middle finger */}
          <ellipse cx="22" cy="-12" rx="2.6" ry="1" fill="#fcd092" />
          <ellipse cx="22" cy="-12.2" rx="2" ry="0.4" fill="#fff8e0" opacity="0.7" />
        </g>
      </g>
    </g>
  );
}

function Lamp() {
  // angled desk lamp (Pixar-style) with dramatic warm cone
  return (
    <g>
      {/* DRAMATIC LIGHT CONE — wider, brighter, with soft scatter */}
      <path d="M 152 720 L 56 902 L 332 902 L 232 720 Z" fill="url(#lampCone)" opacity="0.7" pointerEvents="none"
        style={{ animation: 'flicker 5s ease-in-out infinite' }} />
      {/* secondary glow circle on desk surface */}
      <ellipse cx="200" cy="894" rx="200" ry="30" fill="url(#lampGlow)" opacity="0.9" pointerEvents="none" />
      <ellipse cx="200" cy="892" rx="160" ry="22" fill="#ffe6a8" opacity="0.55" pointerEvents="none" />
      <ellipse cx="200" cy="890" rx="120" ry="14" fill="#fff8e0" opacity="0.45" pointerEvents="none" />
      {/* glow on lamp shade itself */}
      <circle cx="158" cy="660" r="22" fill="#ffe6a8" opacity="0.45" pointerEvents="none"
        style={{ animation: 'flicker 4s ease-in-out infinite' }} />

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
      <path className="steam-wisp" d="M 60 836 Q 56 816 62 798 Q 68 780 60 762" stroke="#fff8e8" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6"
        style={{ animation: 'steamRise 4s ease-out infinite' }} />
      <path className="steam-wisp" d="M 72 836 Q 76 816 70 798 Q 64 780 72 762" stroke="#fff8e8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"
        style={{ animation: 'steamRise2 4.5s ease-out 0.8s infinite' }} />
      <path className="steam-wisp" d="M 82 832 Q 86 816 80 798 Q 74 780 82 762" stroke="#fff8e8" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.4"
        style={{ animation: 'steamRise 5s ease-out 1.5s infinite' }} />
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
  // dense dust in the LAMP CONE area (centered around lamp at x=180, y=720-900)
  const lampDust = [
    { x: 130, y: 880, d: 0, dur: 6 }, { x: 160, y: 870, d: 1.2, dur: 7 }, { x: 200, y: 850, d: 2.4, dur: 6.5 },
    { x: 230, y: 880, d: 0.8, dur: 8 }, { x: 180, y: 800, d: 3.5, dur: 7.5 }, { x: 250, y: 820, d: 1.8, dur: 7 },
    { x: 110, y: 850, d: 4.2, dur: 6.5 }, { x: 290, y: 860, d: 2.7, dur: 8 },
    { x: 150, y: 820, d: 1.4, dur: 6 }, { x: 220, y: 780, d: 3, dur: 7 },
  ];
  return (
    <g pointerEvents="none">
      {motes.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={i % 2 === 0 ? 0.9 : 1.4} fill="#ffe9c2"
          style={{ animation: `dustFloat ${m.dur}s linear infinite`, animationDelay: `${m.d}s` }} />
      ))}
      {lampDust.map((m, i) => (
        <circle key={`l${i}`} cx={m.x} cy={m.y} r={i % 2 === 0 ? 1.1 : 0.8} fill="#fff8e0"
          style={{ animation: `dustFloat ${m.dur}s linear infinite`, animationDelay: `${m.d}s`, opacity: 0.7 }} />
      ))}
    </g>
  );
}
