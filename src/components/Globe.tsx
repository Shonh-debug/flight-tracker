'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import createGlobe from 'cobe';

// ──── Flight route data ─────────────────────────────────────
const FLIGHT_ROUTES = [
  // Transatlantic
  { from: [40.6413, -73.7781] as [number, number], to: [51.4700, -0.4543] as [number, number] },    // JFK → LHR
  { from: [48.8566, 2.3522] as [number, number], to: [40.6413, -73.7781] as [number, number] },     // CDG → JFK
  // Europe → Middle East
  { from: [51.4700, -0.4543] as [number, number], to: [25.2532, 55.3657] as [number, number] },     // LHR → DXB
  // Asia routes
  { from: [25.2532, 55.3657] as [number, number], to: [1.3644, 103.9915] as [number, number] },     // DXB → SIN
  { from: [1.3644, 103.9915] as [number, number], to: [35.5494, 139.7798] as [number, number] },    // SIN → HND
  // Pacific
  { from: [35.5494, 139.7798] as [number, number], to: [-33.9461, 151.1772] as [number, number] },  // HND → SYD
  // Southeast Asia
  { from: [10.8185, 106.6519] as [number, number], to: [25.0796, 121.2342] as [number, number] },   // SGN → TPE
  // North America → Asia
  { from: [49.0097, -123.0679] as [number, number], to: [21.0212, 105.8040] as [number, number] },  // YVR → HAN
];

// All unique airport locations used in routes
const AIRPORT_MARKERS = [
  { location: [40.6413, -73.7781] as [number, number], size: 0.04 },    // JFK
  { location: [51.4700, -0.4543] as [number, number], size: 0.04 },     // LHR
  { location: [48.8566, 2.3522] as [number, number], size: 0.04 },      // CDG
  { location: [25.2532, 55.3657] as [number, number], size: 0.04 },     // DXB
  { location: [1.3644, 103.9915] as [number, number], size: 0.04 },     // SIN
  { location: [35.5494, 139.7798] as [number, number], size: 0.04 },    // HND
  { location: [-33.9461, 151.1772] as [number, number], size: 0.04 },   // SYD
  { location: [10.8185, 106.6519] as [number, number], size: 0.03 },    // SGN
  { location: [25.0796, 121.2342] as [number, number], size: 0.03 },    // TPE
  { location: [49.0097, -123.0679] as [number, number], size: 0.03 },   // YVR
  { location: [21.0212, 105.8040] as [number, number], size: 0.03 },    // HAN
  { location: [59.9139, 10.7522] as [number, number], size: 0.03 },     // OSL
];

// ──── 3D projection math ────────────────────────────────────
type Vec3 = [number, number, number];
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const GLOBE_THETA = 0.15;       // Must match createGlobe theta
const ARC_HEIGHT = 0.3;         // Must match createGlobe arcHeight
const GLOBE_RADIUS_FACTOR = 0.465; // Empirical: maps normalized 3D to container pixels

/** Convert lat/lon (degrees) to a unit 3D vector */
function latLonTo3D(lat: number, lon: number): Vec3 {
  const φ = lat * DEG2RAD;
  const λ = lon * DEG2RAD;
  return [Math.cos(φ) * Math.sin(λ), Math.sin(φ), Math.cos(φ) * Math.cos(λ)];
}

/** Spherical linear interpolation between two unit vectors */
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const ω = Math.acos(dot);
  if (ω < 1e-6) return [...a] as Vec3;
  const sω = Math.sin(ω);
  const wa = Math.sin((1 - t) * ω) / sω;
  const wb = Math.sin(t * ω) / sω;
  return [wa * a[0] + wb * b[0], wa * a[1] + wb * b[1], wa * a[2] + wb * b[2]];
}

/** Normalize a 3D vector to unit length */
function normalize(v: Vec3): Vec3 {
  const l = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  return l < 1e-10 ? v : [v[0] / l, v[1] / l, v[2] / l];
}

/** Apply globe rotation (phi + theta) and project orthographically to screen space */
function projectPoint(x: number, y: number, z: number, phi: number) {
  // Y-axis rotation (horizontal globe spin)
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const x1 = x * cp - z * sp;
  const z1 = x * sp + z * cp;
  // X-axis rotation (vertical tilt)
  const ct = Math.cos(GLOBE_THETA), st = Math.sin(GLOBE_THETA);
  const y1 = y * ct - z1 * st;
  const z2 = y * st + z1 * ct;
  // sx/sy are normalized screen coords; visible when z2 > 0 (facing camera)
  return { sx: x1, sy: -y1, visible: z2 > 0.05 };
}

// ──── Precomputed arc geometry ──────────────────────────────
interface ArcGeom {
  mid: Vec3;  // Elevated midpoint of arc (where airplane sits)
  t1: Vec3;   // Tangent sample point before midpoint (for direction)
  t2: Vec3;   // Tangent sample point after midpoint (for direction)
}

function buildArcGeometry(): ArcGeom[] {
  return FLIGHT_ROUTES.map((route) => {
    const a = latLonTo3D(route.from[0], route.from[1]);
    const b = latLonTo3D(route.to[0], route.to[1]);

    // Angular distance between endpoints (radians)
    const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const angDist = Math.acos(dot);

    // Great-circle midpoint, normalized
    const midRaw = slerp(a, b, 0.5);
    const midN = normalize(midRaw);

    // Elevation scales with arc angular distance (longer routes = higher arcs)
    const elevation = 1 + ARC_HEIGHT * angDist * 0.5;

    return {
      mid: [midN[0] * elevation, midN[1] * elevation, midN[2] * elevation] as Vec3,
      t1: slerp(a, b, 0.45),  // slightly before midpoint
      t2: slerp(a, b, 0.55),  // slightly after midpoint
    };
  });
}

// ──── Theme configurations ──────────────────────────────────
const DARK_THEME = {
  dark: 1,
  diffuse: 1.2,
  mapBrightness: 2.5,
  baseColor: [0.05, 0.08, 0.15] as Vec3,
  markerColor: [0, 0.94, 1] as Vec3,
  glowColor: [0, 0.3, 0.4] as Vec3,
  arcColor: [0, 0.94, 1] as Vec3,
};

const LIGHT_THEME = {
  dark: 0,
  diffuse: 1.2,
  mapBrightness: 6,
  baseColor: [1, 1, 1] as Vec3,
  markerColor: [0.22, 0.52, 0.89] as Vec3,
  glowColor: [1, 1, 1] as Vec3,
  arcColor: [0.35, 0.6, 0.95] as Vec3,
};

// ──── Component ─────────────────────────────────────────────
export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const phiRef = useRef(0);
  const sizeRef = useRef(0);
  const [isDark, setIsDark] = useState(true);
  const arcGeom = useMemo(() => buildArcGeometry(), []);

  // ── Detect dark / light theme changes ──
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // ── Globe + airplane animation loop ──
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    let animationId: number;
    const theme = isDark ? DARK_THEME : LIGHT_THEME;

    // Cache container size, update on resize
    sizeRef.current = container.offsetWidth;
    const resizeObs = new ResizeObserver(() => {
      sizeRef.current = container.offsetWidth;
    });
    resizeObs.observe(container);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: phiRef.current,
      theta: GLOBE_THETA,
      mapSamples: 16000,
      scale: 1.05,
      offset: [0, 0],
      ...theme,
      markers: AIRPORT_MARKERS,
      markerElevation: 0.02,
      arcs: FLIGHT_ROUTES,
      arcWidth: 0.4,
      arcHeight: ARC_HEIGHT,
    });

    const animate = () => {
      phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });

      // ── Project airplane positions onto screen ──
      const size = sizeRef.current;
      if (size > 0) {
        const radius = size * GLOBE_RADIUS_FACTOR;
        const cx = size / 2;
        const cy = size / 2;

        for (let i = 0; i < arcGeom.length; i++) {
          const el = planeRefs.current[i];
          if (!el) continue;

          const { mid, t1, t2 } = arcGeom[i];
          const pm = projectPoint(mid[0], mid[1], mid[2], phiRef.current);

          // Flight direction from two tangent samples
          const p1 = projectPoint(t1[0], t1[1], t1[2], phiRef.current);
          const p2 = projectPoint(t2[0], t2[1], t2[2], phiRef.current);
          const dx = p2.sx - p1.sx;
          const dy = p2.sy - p1.sy;
          // +90° because the SVG airplane points UP, but atan2 measures from the RIGHT
          const angle = Math.atan2(dy, dx) * RAD2DEG + 90;

          const px = cx + pm.sx * radius;
          const py = cy + pm.sy * radius;

          el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) rotate(${angle}deg)`;
          el.style.opacity = pm.visible ? '1' : '0';
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObs.disconnect();
      globe.destroy();
    };
  }, [isDark, arcGeom]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[400px]"
      style={{ overflow: 'visible' }}
    >
      {/* Ambient glow ring — adapts to theme */}
      <div
        className="absolute inset-[-10%] rounded-full pointer-events-none animate-glow-pulse"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56,133,228,0.08) 0%, transparent 70%)',
          opacity: isDark ? 0.3 : 0.2,
        }}
      />

      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ contain: 'layout paint size', opacity: 0.95 }}
      />

      {/* ── Airplane icons floating above arc midpoints ── */}
      {FLIGHT_ROUTES.map((_, i) => (
        <div
          key={i}
          ref={(el) => { planeRefs.current[i] = el; }}
          className="absolute top-0 left-0 pointer-events-none z-10"
          style={{ opacity: 0, transition: 'opacity 0.25s ease', willChange: 'transform, opacity' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: isDark
                ? '1px solid rgba(0,240,255,0.2)'
                : '1px solid rgba(148,163,184,0.3)',
              boxShadow: isDark
                ? '0 0 10px rgba(0,240,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {/* Material "flight" icon — points upward by default */}
            <svg
              className={isDark ? 'w-4 h-4 text-cyan-400' : 'w-4 h-4 text-blue-500'}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </div>
      ))}

      {/* "FLIGHTS" label under the globe */}
      <p
        className="text-center mt-2 text-xs font-mono tracking-[0.3em] uppercase"
        style={{ color: 'var(--text-secondary)' }}
      >
        Flights
      </p>
    </div>
  );
}
