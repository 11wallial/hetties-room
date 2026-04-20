// Weather system for Hettie's Room
//
// Each visit picks one mode at random (or from `?weather=` URL override).
// A mode drives the sky palette, sun/moon visibility, hills tint, haze,
// and any particle overlays (rain, snow, fog, rainbow). Time-of-day still
// influences everything within a given weather (so night rain is moody,
// afternoon rain is just grey), but weather is the primary mood.

export type Weather =
  | 'sunshine'
  | 'sunrise'
  | 'rainy'
  | 'snowy'
  | 'rainbow'
  | 'foggy';

export const WEATHERS: readonly Weather[] = [
  'sunshine',
  'sunrise',
  'rainy',
  'snowy',
  'rainbow',
  'foggy',
] as const;

export interface WeatherPalette {
  // Sky gradient stops (top → middle → bottom)
  sky: [string, string, string];
  // Sun/moon
  sun: string;
  sunY: number;           // Y position in the 720x1280 scene viewBox
  sunOpacity: number;     // the sun disc
  sunGlowOpacity: number; // the radial halo
  // Atmospheric
  haze: string;           // colour for the vertical haze near horizon
  hazeOpacity: number;    // 0-1 intensity of the haze
  tint: string;           // ambient room-light tint (scene-wide)
  // Scene accents
  godRays: number;        // 0-1: diagonal god-rays through clouds
  hillFade: number;       // 0-1: extra mist over the hills
  cottageGlow: number;    // 0-1: how lit the cottage windows look
  // Convenience
  isNight: boolean;
}

export function pickWeather(override?: string | null): Weather {
  if (override) {
    const lc = override.toLowerCase().trim();
    if ((WEATHERS as readonly string[]).includes(lc)) return lc as Weather;
  }
  const idx = Math.floor(Math.random() * WEATHERS.length);
  return WEATHERS[idx];
}

// ─────────────────────────────────────────────────────────────────────────
// Palette construction
// ─────────────────────────────────────────────────────────────────────────

type ColorTriple = [string, string, string];
type Anchor = { h: number; sky: ColorTriple; sun: string; sunY: number; haze: string; tint: string };

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpColor(c1: string, c2: string, t: number): string {
  const p1 = parseInt(c1.slice(1), 16);
  const p2 = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp((p1 >> 16) & 0xff, (p2 >> 16) & 0xff, t));
  const g = Math.round(lerp((p1 >> 8) & 0xff, (p2 >> 8) & 0xff, t));
  const b = Math.round(lerp(p1 & 0xff, p2 & 0xff, t));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function interpolate(anchors: Anchor[], hour: number): Omit<Anchor, 'h'> {
  let i = 0;
  while (i < anchors.length - 1 && hour >= anchors[i + 1].h) i++;
  const a = anchors[i];
  const b = anchors[Math.min(i + 1, anchors.length - 1)];
  const t = (hour - a.h) / ((b.h - a.h) || 1);
  return {
    sky: a.sky.map((c, j) => lerpColor(c, b.sky[j], t)) as ColorTriple,
    sun: lerpColor(a.sun, b.sun, t),
    sunY: lerp(a.sunY, b.sunY, t),
    haze: lerpColor(a.haze, b.haze, t),
    tint: lerpColor(a.tint, b.tint, t),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Anchor palettes per weather mode (time-of-day interpolated within each)
// ─────────────────────────────────────────────────────────────────────────

const SUNSHINE: Anchor[] = [
  { h: 0,  sky: ['#0d1530', '#1b1640', '#2a1d44'], sun: '#5a4a7a', sunY: 380, haze: '#3a2848', tint: '#09060f' },
  { h: 5,  sky: ['#3d2548', '#7a4a5e', '#e0a07a'], sun: '#ffd9a8', sunY: 320, haze: '#a86a6a', tint: '#1a0e1f' },
  { h: 8,  sky: ['#9ec3df', '#fbe2ba', '#fcd296'], sun: '#fff4d8', sunY: 240, haze: '#e6c098', tint: '#2a1620' },
  { h: 12, sky: ['#a9d4ee', '#dde8f0', '#f4e4c4'], sun: '#fff8e8', sunY: 160, haze: '#d8c8b0', tint: '#3a2030' },
  { h: 16, sky: ['#cbd9e8', '#fce5b8', '#fcb37a'], sun: '#fff0c0', sunY: 240, haze: '#e89a78', tint: '#3a1d28' },
  { h: 19, sky: ['#3e2654', '#a85970', '#f4a06a'], sun: '#fff0c0', sunY: 320, haze: '#bd6a6a', tint: '#1a0e1f' },
  { h: 21, sky: ['#1a1438', '#3d2050', '#7a3858'], sun: '#fcd092', sunY: 380, haze: '#5a3050', tint: '#0e0612' },
  { h: 24, sky: ['#0d1530', '#1b1640', '#2a1d44'], sun: '#5a4a7a', sunY: 380, haze: '#3a2848', tint: '#09060f' },
];

// Sunrise — warm peach/coral sky, sun low on horizon (peeking just above hills)
const SUNRISE_ANCHORS: Anchor[] = [
  { h: 0,  sky: ['#2a1a3c', '#7e3e58', '#e89a6a'], sun: '#ffd09c', sunY: 280, haze: '#c47868', tint: '#1a0e1f' },
  { h: 12, sky: ['#4a2a52', '#c86878', '#ffc890'], sun: '#fff0c0', sunY: 240, haze: '#d88878', tint: '#2a1620' },
  { h: 24, sky: ['#2a1a3c', '#7e3e58', '#e89a6a'], sun: '#ffd09c', sunY: 280, haze: '#c47868', tint: '#1a0e1f' },
];

const RAINY: Anchor[] = [
  { h: 0,  sky: ['#161820', '#1e232a', '#2a2f38'], sun: '#3a3f48', sunY: 420, haze: '#2a2f38', tint: '#07080b' },
  { h: 12, sky: ['#434a56', '#5c6470', '#737d8c'], sun: '#7e8690', sunY: 360, haze: '#6a727e', tint: '#1a1c22' },
  { h: 24, sky: ['#161820', '#1e232a', '#2a2f38'], sun: '#3a3f48', sunY: 420, haze: '#2a2f38', tint: '#07080b' },
];

const SNOWY: Anchor[] = [
  { h: 0,  sky: ['#1a1e2a', '#2a2f40', '#3a4056'], sun: '#6a7288', sunY: 400, haze: '#3a4056', tint: '#09060f' },
  { h: 12, sky: ['#cdd8e6', '#dce5ee', '#eaeff4'], sun: '#f4f7fa', sunY: 280, haze: '#bac6d4', tint: '#1a1820' },
  { h: 24, sky: ['#1a1e2a', '#2a2f40', '#3a4056'], sun: '#6a7288', sunY: 400, haze: '#3a4056', tint: '#09060f' },
];

// Rainbow = post-rain: still slightly cool and misty but brighter, with an arc overlay
const RAINBOW: Anchor[] = [
  { h: 0,  sky: ['#2a2e3a', '#3a4252', '#586474'], sun: '#9aa2b0', sunY: 360, haze: '#6a727e', tint: '#12121a' },
  { h: 12, sky: ['#9ab8cc', '#c8d4de', '#e8d8b8'], sun: '#fff2d4', sunY: 220, haze: '#c4b896', tint: '#2a2026' },
  { h: 24, sky: ['#2a2e3a', '#3a4252', '#586474'], sun: '#9aa2b0', sunY: 360, haze: '#6a727e', tint: '#12121a' },
];

const FOGGY: Anchor[] = [
  { h: 0,  sky: ['#2a2a34', '#3a3a44', '#4e4e58'], sun: '#5e5e68', sunY: 400, haze: '#4e4e58', tint: '#0e0e12' },
  { h: 12, sky: ['#b8bcc4', '#c6c9d0', '#d2d4d8'], sun: '#dfe0e4', sunY: 320, haze: '#a8abb2', tint: '#1e1e22' },
  { h: 24, sky: ['#2a2a34', '#3a3a44', '#4e4e58'], sun: '#5e5e68', sunY: 400, haze: '#4e4e58', tint: '#0e0e12' },
];

export function getPalette(weather: Weather, hour: number): WeatherPalette {
  const isNight = hour < 6 || hour > 20;

  // For weathers that are mostly time-independent (rain/snow/fog), we still
  // interpolate so night looks different from midday — but the anchor palette
  // stays muted throughout.
  const base = (() => {
    switch (weather) {
      case 'sunshine': return interpolate(SUNSHINE, hour);
      case 'sunrise':  return interpolate(SUNRISE_ANCHORS, hour);
      case 'rainy':    return interpolate(RAINY, hour);
      case 'snowy':    return interpolate(SNOWY, hour);
      case 'rainbow':  return interpolate(RAINBOW, hour);
      case 'foggy':    return interpolate(FOGGY, hour);
    }
  })();

  // Weather-specific visibility & atmosphere tuning
  const tuning: Record<Weather, Pick<WeatherPalette, 'sunOpacity' | 'sunGlowOpacity' | 'hazeOpacity' | 'godRays' | 'hillFade' | 'cottageGlow'>> = {
    sunshine: { sunOpacity: 0.95, sunGlowOpacity: 1.0, hazeOpacity: 0.85, godRays: 0.16, hillFade: 0.0,  cottageGlow: 0.35 },
    sunrise:  { sunOpacity: 1.0,  sunGlowOpacity: 1.0, hazeOpacity: 0.78, godRays: 0.22, hillFade: 0.18, cottageGlow: 0.5  },
    rainy:    { sunOpacity: 0.0,  sunGlowOpacity: 0.12, hazeOpacity: 0.55, godRays: 0.0, hillFade: 0.45, cottageGlow: 0.95 },
    snowy:    { sunOpacity: 0.3,  sunGlowOpacity: 0.35, hazeOpacity: 0.42, godRays: 0.0, hillFade: 0.5,  cottageGlow: 0.85 },
    rainbow:  { sunOpacity: 0.85, sunGlowOpacity: 0.9, hazeOpacity: 0.52, godRays: 0.1,  hillFade: 0.28, cottageGlow: 0.55 },
    foggy:    { sunOpacity: 0.1,  sunGlowOpacity: 0.25, hazeOpacity: 0.75, godRays: 0.0, hillFade: 0.85, cottageGlow: 0.7  },
  };

  return {
    sky: base.sky,
    sun: base.sun,
    sunY: base.sunY,
    sunOpacity: tuning[weather].sunOpacity,
    sunGlowOpacity: tuning[weather].sunGlowOpacity,
    haze: base.haze,
    hazeOpacity: tuning[weather].hazeOpacity,
    tint: base.tint,
    godRays: tuning[weather].godRays,
    hillFade: tuning[weather].hillFade,
    cottageGlow: tuning[weather].cottageGlow,
    isNight,
  };
}
