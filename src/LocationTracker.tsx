import { useEffect, useMemo } from 'react';
import './LocationTracker.css';
import { ITINERARY, getCurrentStop, getNextStop, getDaysLeft, getStopIndex, type Stop } from './itinerary';

interface LocationTrackerProps {
  now: Date;
  onClose: () => void;
}

// ── Map coordinate system ────────────────────────────────────────────────────
// viewBox: 510 × 390 · lng 92→143°E (51°) · lat 4→43°N (39°)
const lx = (lng: number) => (lng - 92) * 10;
const ly = (lat: number) => (43 - lat) * 10;

// City map positions — some nudged a touch for label legibility
const MAP_STOPS: { stop: Stop; mx: number; my: number; labelSide: 'left' | 'right'; labelDY?: number }[] = [
  { stop: ITINERARY[0],  mx: lx(135.77), my: ly(35.01), labelSide: 'left'  }, // Kyoto
  { stop: ITINERARY[1],  mx: lx(139.65), my: ly(35.68), labelSide: 'right' }, // Tokyo
  { stop: ITINERARY[2],  mx: lx(105.85), my: ly(21.03), labelSide: 'left'  }, // Hanoi
  { stop: ITINERARY[3],  mx: lx(105.97), my: ly(20.25), labelSide: 'left', labelDY: 10 }, // Ninh Binh
  { stop: ITINERARY[4],  mx: lx(106.28), my: ly(17.60), labelSide: 'left'  }, // Phong Nha
  { stop: ITINERARY[5],  mx: lx(108.34), my: ly(15.88), labelSide: 'right' }, // Hoi An
  { stop: ITINERARY[6],  mx: lx(108.20), my: ly(16.05), labelSide: 'right', labelDY: -10 }, // Da Nang
  { stop: ITINERARY[7],  mx: lx(106.70), my: ly(10.78), labelSide: 'right' }, // HCMC
  { stop: ITINERARY[8],  mx: lx(102.13), my: ly(19.88), labelSide: 'left'  }, // Luang Prabang
  { stop: ITINERARY[9],  mx: lx(102.61), my: ly(20.57), labelSide: 'left', labelDY: -10 }, // Nong Khiaw
  { stop: ITINERARY[10], mx: lx(98.99),  my: ly(18.79), labelSide: 'left'  }, // Chiang Mai #1
  { stop: ITINERARY[11], mx: lx(98.44),  my: ly(19.36), labelSide: 'left', labelDY: -10 }, // Pai
  { stop: ITINERARY[12], mx: lx(98.99),  my: ly(18.79), labelSide: 'left'  }, // Chiang Mai #2 (hidden dot, used for route)
  { stop: ITINERARY[13], mx: lx(100.50), my: ly(13.76), labelSide: 'right' }, // Bangkok
  { stop: ITINERARY[14], mx: lx(98.91),  my: ly(8.09),  labelSide: 'left'  }, // Krabi
  { stop: ITINERARY[15], mx: lx(99.04),  my: ly(7.57),  labelSide: 'left', labelDY: 10 }, // Koh Lanta
  { stop: ITINERARY[16], mx: lx(103.84), my: ly(13.37), labelSide: 'right' }, // Siem Reap
];

// Route pieces
// - Japan: straight dash Kyoto → Tokyo
// - Flight: Tokyo → Hanoi (bezier arc over the sea)
// - SE Asia: polyline through every stop in order (including the return Chiang Mai leg,
//   so the track honestly shows the back-and-forth through Pai)
const SEASIA_POINTS = MAP_STOPS.slice(2).map((s) => `${s.mx},${s.my}`).join(' ');

// ── Current location pulse ──────────────────────────────────────────────────
function CurrentPulse({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="loc-pulse">
      <circle cx={cx} cy={cy} r="6" className="loc-pulse-ring" />
      <circle cx={cx} cy={cy} r="6" className="loc-pulse-ring loc-pulse-ring-b" />
      <circle cx={cx} cy={cy} r="10" fill="rgba(255,210,140,0.14)" />
      <circle cx={cx} cy={cy} r="6" fill="rgba(255,210,140,0.22)" />
    </g>
  );
}

function RouteMap({ currentIdx }: { currentIdx: number }) {
  return (
    <svg
      viewBox="0 0 510 390"
      className="loc-map-svg"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Map of Hettie's route through south-east Asia"
    >
      <defs>
        <radialGradient id="ocean" cx="40%" cy="60%" r="75%">
          <stop offset="0%" stopColor="#1a1020" />
          <stop offset="60%" stopColor="#120a16" />
          <stop offset="100%" stopColor="#08060d" />
        </radialGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a18" />
          <stop offset="100%" stopColor="#1f160e" />
        </linearGradient>
        <linearGradient id="landRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 210, 150, 0.28)" />
          <stop offset="100%" stopColor="rgba(255, 170, 100, 0.04)" />
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="paperGrain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r="0.3" fill="rgba(255,210,150,0.035)" />
        </pattern>
        <pattern id="parallels" x="0" y="0" width="520" height="40" patternUnits="userSpaceOnUse">
          <line x1="0" y1="20" x2="520" y2="20" stroke="rgba(255,220,160,0.035)" strokeWidth="0.4" />
        </pattern>
        <pattern id="meridians" x="0" y="0" width="50" height="400" patternUnits="userSpaceOnUse">
          <line x1="25" y1="0" x2="25" y2="400" stroke="rgba(255,220,160,0.025)" strokeWidth="0.4" />
        </pattern>
      </defs>

      {/* Ocean */}
      <rect width="510" height="390" fill="url(#ocean)" />
      <rect width="510" height="390" fill="url(#paperGrain)" />
      <rect width="510" height="390" fill="url(#parallels)" />
      <rect width="510" height="390" fill="url(#meridians)" />

      {/* ── Land masses (stylised hand-drawn SE Asia) ──────────────────────── */}
      <g className="loc-land" opacity="0.78">
        {/* Mainland SE Asia + hint of southern China.
            Clockwise from NW corner, no self-intersections.
            Key features: Malay peninsula tail (SW), Gulf of Thailand scoop,
            Mekong delta bump, Vietnam S-curve, Gulf of Tonkin, south China coast. */}
        <path
          d="
            M 48,140
            Q 38,170 40,200
            Q 42,240 50,275
            Q 58,300 68,320
            Q 72,350 76,378
            Q 82,392 88,386
            Q 94,368 90,354
            Q 88,336 88,320
            Q 98,318 110,318
            Q 122,322 132,326
            Q 140,330 146,330
            Q 152,328 156,324
            Q 164,316 168,308
            Q 172,296 172,284
            Q 172,270 168,258
            Q 164,244 160,232
            Q 156,220 155,208
            Q 158,198 164,194
            Q 184,192 204,194
            Q 226,196 246,192
            Q 268,186 284,174
            Q 296,162 300,148
            Q 302,130 296,116
            Q 286,104 268,100
            Q 240,94 210,96
            Q 178,98 148,102
            Q 118,106 90,112
            Q 68,118 55,126
            Q 48,132 48,140
            Z
          "
          fill="url(#land)"
          stroke="url(#landRim)"
          strokeWidth="0.8"
        />

        {/* Hainan island */}
        <ellipse cx="184" cy="240" rx="7" ry="5"
          fill="url(#land)" stroke="url(#landRim)" strokeWidth="0.5" opacity="0.85" />

        {/* Taiwan */}
        <ellipse cx="298" cy="193" rx="4" ry="9"
          fill="url(#land)" stroke="url(#landRim)" strokeWidth="0.5" opacity="0.7"
          transform="rotate(-10 298 193)" />

        {/* Japan – Honshu (smooth arc) */}
        <path
          d="
            M 378,108
            C 392,98 410,88 430,78
            C 448,68 462,56 476,42
            C 486,32 492,22 496,14
            C 490,6 480,12 470,22
            C 456,36 442,52 426,66
            C 410,80 394,92 378,104
            Z
          "
          fill="url(#land)" stroke="url(#landRim)" strokeWidth="0.8"
        />
        {/* Japan – Shikoku */}
        <ellipse cx="406" cy="113" rx="10" ry="3.5" fill="url(#land)" stroke="url(#landRim)" strokeWidth="0.5" opacity="0.9" transform="rotate(-10 406 113)" />
        {/* Japan – Kyushu */}
        <path d="M 376,110 C 381,107 389,112 389,122 C 387,131 379,132 373,125 C 371,119 371,114 376,110 Z"
          fill="url(#land)" stroke="url(#landRim)" strokeWidth="0.5" opacity="0.9" />
      </g>

      {/* Vignette over everything (before routes) */}
      <rect width="510" height="390" fill="url(#vignette)" pointerEvents="none" />

      {/* ── Routes ─────────────────────────────────────────────────────────── */}
      {/* Kyoto → Tokyo */}
      <line
        x1={lx(135.77)} y1={ly(35.01)}
        x2={lx(139.65)} y2={ly(35.68)}
        stroke="rgba(255,210,140,0.55)"
        strokeWidth="1.2"
        strokeDasharray="3,4"
        className="loc-route loc-route-japan"
      />
      {/* Flight arc: Tokyo → Hanoi */}
      <path
        d={`M ${lx(139.65)},${ly(35.68)} Q 280,10 ${lx(105.85)},${ly(21.03)}`}
        fill="none"
        stroke="rgba(255,210,140,0.5)"
        strokeWidth="1"
        strokeDasharray="4,5"
        className="loc-route loc-route-flight"
      />
      {/* SE Asia polyline (Hanoi onwards, keeping the return-to-Chiang-Mai leg honest) */}
      <polyline
        points={SEASIA_POINTS}
        fill="none"
        stroke="rgba(255,210,140,0.55)"
        strokeWidth="1.4"
        strokeDasharray="3,4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="loc-route loc-route-seasia"
      />

      {/* ── Stop dots ──────────────────────────────────────────────────────── */}
      {MAP_STOPS.map((ms, i) => {
        // Hide the duplicate Chiang Mai dot; the route line still passes through it.
        // Hide Da Nang's dot — same coastline as Hoi An, they visually overlap.
        if (i === 12 || i === 6) return null;

        const stopIdx = getStopIndex(ms.stop);
        const isCurrent = stopIdx === currentIdx;
        const isPast = stopIdx < currentIdx;

        const dotColor = isCurrent ? '#ffe19a' : isPast ? '#ffcfa0' : '#c8b288';
        const ringColor = isCurrent ? '#fff8e0' : 'rgba(255,240,200,0.4)';
        const dotR = isCurrent ? 4.2 : isPast ? 2.8 : 2.4;
        const dotOpacity = isPast ? 0.85 : 1;

        const lOffset = ms.labelSide === 'right' ? 7 : -7;
        const lAnchor = ms.labelSide === 'right' ? 'start' : 'end';

        return (
          <g key={i} opacity={dotOpacity}>
            {isCurrent && <CurrentPulse cx={ms.mx} cy={ms.my} />}
            <circle
              cx={ms.mx} cy={ms.my}
              r={dotR}
              fill={dotColor}
              stroke={ringColor}
              strokeWidth={isCurrent ? 1.4 : 0.7}
              filter={isCurrent ? 'url(#glow)' : undefined}
            />
            <text
              x={ms.mx + lOffset}
              y={ms.my + 1 + (ms.labelDY ?? 0)}
              textAnchor={lAnchor}
              dominantBaseline="middle"
              fontSize={isCurrent ? 9 : 7}
              fontFamily="'Caveat', cursive"
              fill={isCurrent ? '#fff4d0' : isPast ? 'rgba(255,230,180,0.75)' : 'rgba(255,220,170,0.5)'}
              fontWeight={isCurrent ? 600 : 400}
              style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.55)', strokeWidth: 2.4 }}
            >
              {ms.stop.city}
            </text>
          </g>
        );
      })}

      {/* ── Country watermarks ─────────────────────────────────────────────── */}
      {[
        { label: 'JAPAN',    x: 455, y: 58  },
        { label: 'CHINA',    x: 230, y: 130 },
        { label: 'LAOS',     x: 128, y: 205 },
        { label: 'VIETNAM',  x: 192, y: 256 },
        { label: 'THAILAND', x: 60,  y: 272 },
        // CAMBODIA omitted — redundant with Siem Reap's flag, keeps the board uncluttered
      ].map((c) => (
        <text
          key={c.label}
          x={c.x} y={c.y}
          textAnchor="middle"
          fontSize={6.5}
          fontFamily="'Inter', sans-serif"
          fill="rgba(255,220,160,0.28)"
          letterSpacing="1.6"
          fontWeight={500}
        >
          {c.label}
        </text>
      ))}

      {/* Compass */}
      <g transform="translate(30, 355)" opacity="0.55">
        <circle r="11" fill="none" stroke="rgba(255,220,160,0.25)" strokeWidth="0.5" />
        <path d="M 0,-9 L 2,0 L 0,2 L -2,0 Z" fill="rgba(255,230,180,0.6)" />
        <path d="M 0,9  L 2,0 L 0,-2 L -2,0 Z" fill="rgba(255,220,160,0.25)" />
        <text x="0" y="-13.5" textAnchor="middle" fontSize="6" fontFamily="'Inter', sans-serif" fill="rgba(255,230,180,0.55)" letterSpacing="1">N</text>
      </g>
    </svg>
  );
}

export function LocationTracker({ now, onClose }: LocationTrackerProps) {
  const current = useMemo(() => getCurrentStop(now), [now]);
  const currentIdx = useMemo(() => current ? getStopIndex(current) : -1, [current]);
  const next = useMemo(() => current ? getNextStop(current) : null, [current]);
  const daysLeft = useMemo(() => current ? getDaysLeft(current, now) : 0, [current, now]);
  const upcoming = useMemo(() => ITINERARY.slice(currentIdx + 1, currentIdx + 5), [currentIdx]);

  // ESC to close + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="loc-overlay" onClick={onClose} role="dialog" aria-label="Hettie's location">
      <div className="loc-panel" onClick={(e) => e.stopPropagation()}>
        <div className="loc-handle" aria-hidden />
        <div className="loc-map-wrap">
          <div className="loc-map-title">
            <span>the journey</span>
            <span className="loc-map-title-sub">south-east asia · 50 days</span>
          </div>
          <RouteMap currentIdx={currentIdx} />
        </div>

        <div className="loc-card">
          {current ? (
            <>
              <div className="loc-card-main">
                <span className="loc-flag">{current.flag}</span>
                <div className="loc-card-text">
                  <div className="loc-city">{current.city}</div>
                  <div className="loc-country">{current.country}</div>
                </div>
                <div className="loc-days-left">
                  <span className="loc-days-num">{daysLeft}</span>
                  <span className="loc-days-unit">day{daysLeft !== 1 ? 's' : ''}<br />here</span>
                </div>
              </div>
              <div className="loc-highlight">✦ {current.highlight}</div>
              {next && (
                <div className="loc-next">
                  next → {next.flag} {next.city} · {formatDate(next.from)}
                </div>
              )}
            </>
          ) : now < ITINERARY[0].from ? (
            <div className="loc-card-main">
              <span className="loc-flag">✈️</span>
              <div className="loc-card-text">
                <div className="loc-city">in the air</div>
                <div className="loc-country">heading to kyoto</div>
              </div>
            </div>
          ) : (
            <div className="loc-card-main">
              <span className="loc-flag">🏠</span>
              <div className="loc-card-text">
                <div className="loc-city">home</div>
                <div className="loc-country">back in the uk</div>
              </div>
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="loc-upcoming">
            <div className="loc-upcoming-title">coming up</div>
            <div className="loc-upcoming-list">
              {upcoming.map((s, i) => (
                <div key={i} className="loc-upcoming-stop">
                  <span className="loc-upcoming-flag">{s.flag}</span>
                  <span className="loc-upcoming-city">{s.city}</span>
                  <span className="loc-upcoming-date">{formatDate(s.from)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="loc-close" onClick={onClose} aria-label="close map">✕</button>
      </div>
    </div>
  );
}
