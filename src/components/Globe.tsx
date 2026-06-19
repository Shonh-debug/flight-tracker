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

// ──── Cobe-exact projection math ────────────────────────────
// Derived directly from cobe's source: the `U` and `O` functions
type Vec3 = [number, number, number];
const { PI, sin, cos, atan2, sqrt } = Math;
const DEG2RAD = PI / 180;
const RAD2DEG = 180 / PI;

// Globe config constants — must match createGlobe options
const GLOBE_THETA = 0.15;
const ARC_HEIGHT = 0.3;
const MARKER_ELEVATION = 0.02;
const GLOBE_SCALE = 1.05;
const GLOBE_SURFACE = 0.8; // cobe's internal surface constant (ee=0.8)

/**
 * Convert [lat, lon] in degrees to cobe's internal 3D vector.
 * Matches cobe's `U` function exactly.
 */
function latLonTo3D(lat: number, lon: number): Vec3 {
  const φ = lat * DEG2RAD;
  const λ = lon * DEG2RAD - PI;
  const c = cos(φ);
  return [-c * cos(λ), sin(φ), c * sin(λ)];
}

/**
 * Project a 3D point to normalized screen coordinates [0..1, 0..1].
 * Matches cobe's `O` function exactly.
 * Returns { nx, ny, visible } where nx/ny are 0..1 fractions of the canvas.
 */
function cobeProject(
  pt: Vec3,
  phi: number,
  theta: number,
  canvasW: number,
  canvasH: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  dpr: number,
): { nx: number; ny: number; visible: boolean } {
  const ct = cos(theta), st = sin(theta);
  const cp = cos(phi), sp = sin(phi);

  // cobe's rotation matrix applied inline
  const cx = cp * pt[0] + sp * pt[2];
  const sy = sp * st * pt[0] + ct * pt[1] - cp * st * pt[2];

  const aspect = canvasW / canvasH;
  const nx = (cx / aspect * scale + offsetX * scale * dpr / canvasW + 1) / 2;
  const ny = (-sy * scale + offsetY * scale * dpr / canvasH + 1) / 2;

  // Visibility: z-component of the rotated point >= 0 OR point is on the globe's rim
  const vz = -sp * ct * pt[0] + st * pt[1] + cp * ct * pt[2];
  const visible = vz >= 0 || cx * cx + sy * sy >= 0.64;

  return { nx, ny, visible };
}

/**
 * Compute the arc midpoint in 3D, elevated above the surface.
 * Matches cobe's `X` function exactly.
 */
function arcMidpoint3D(from: Vec3, to: Vec3): Vec3 | null {
  const ax = from[0] + to[0];
  const ay = from[1] + to[1];
  const az = from[2] + to[2];
  const len = sqrt(ax * ax + ay * ay + az * az);
  if (len < 0.001) return null;

  // cobe's exact elevation formula: 0.25*(ee+p) + 0.5*(ee+R+p)/len
  const elev = 0.25 * (GLOBE_SURFACE + MARKER_ELEVATION) +
               0.5 * (GLOBE_SURFACE + ARC_HEIGHT + MARKER_ELEVATION) / len;

  return [ax * elev, ay * elev, az * elev];
}

// ──── Precomputed arc geometry ──────────────────────────────
interface ArcGeom {
  mid: Vec3;       // Elevated midpoint (where airplane sits)
  from3d: Vec3;    // 3D position of departure (for direction)
  to3d: Vec3;      // 3D position of arrival (for direction)
}

function buildArcGeometry(): ArcGeom[] {
  return FLIGHT_ROUTES.map((route) => {
    const from3d = latLonTo3D(route.from[0], route.from[1]);
    const to3d = latLonTo3D(route.to[0], route.to[1]);
    const mid = arcMidpoint3D(from3d, to3d);
    return { mid: mid || from3d, from3d, to3d };
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
const CANVAS_W = 600 * 2;
const CANVAS_H = 600 * 2;
const DPR = 2;

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
      devicePixelRatio: DPR,
      width: CANVAS_W / DPR,
      height: CANVAS_H / DPR,
      phi: phiRef.current,
      theta: GLOBE_THETA,
      mapSamples: 16000,
      scale: GLOBE_SCALE,
      offset: [0, 0],
      ...theme,
      markers: AIRPORT_MARKERS,
      markerElevation: MARKER_ELEVATION,
      arcs: FLIGHT_ROUTES,
      arcWidth: 0.4,
      arcHeight: ARC_HEIGHT,
    });

    const animate = () => {
      phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });

      // ── Project airplane positions using cobe's exact math ──
      const containerSize = sizeRef.current;
      if (containerSize > 0) {
        for (let i = 0; i < arcGeom.length; i++) {
          const el = planeRefs.current[i];
          if (!el) continue;

          const { mid, from3d, to3d } = arcGeom[i];

          // Project arc midpoint to screen (cobe-exact)
          const pm = cobeProject(
            mid, phiRef.current, GLOBE_THETA,
            CANVAS_W, CANVAS_H, GLOBE_SCALE, 0, 0, DPR
          );

          // Convert normalized [0..1] coords to container pixels
          const px = pm.nx * containerSize;
          const py = pm.ny * containerSize;

          // Compute flight direction from projected from/to endpoints
          // Use the same surface-level elevation for direction calc
          const surfaceElev = GLOBE_SURFACE + MARKER_ELEVATION;
          const fromSurf: Vec3 = [from3d[0] * surfaceElev, from3d[1] * surfaceElev, from3d[2] * surfaceElev];
          const toSurf: Vec3 = [to3d[0] * surfaceElev, to3d[1] * surfaceElev, to3d[2] * surfaceElev];

          const pFrom = cobeProject(
            fromSurf, phiRef.current, GLOBE_THETA,
            CANVAS_W, CANVAS_H, GLOBE_SCALE, 0, 0, DPR
          );
          const pTo = cobeProject(
            toSurf, phiRef.current, GLOBE_THETA,
            CANVAS_W, CANVAS_H, GLOBE_SCALE, 0, 0, DPR
          );

          const dx = pTo.nx - pFrom.nx;
          const dy = pTo.ny - pFrom.ny;
          // +90° because SVG airplane points UP, atan2 measures from RIGHT
          const angle = atan2(dy, dx) * RAD2DEG + 90;

          // Only show if the midpoint z-depth is truly facing the camera
          // (stricter check: exclude rim-visible points)
          const ct = cos(GLOBE_THETA), st = sin(GLOBE_THETA);
          const cp = cos(phiRef.current), sp = sin(phiRef.current);
          const vz = -sp * ct * mid[0] + st * mid[1] + cp * ct * mid[2];
          const trulyVisible = vz > 0;

          el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) rotate(${angle}deg)`;
          el.style.opacity = trulyVisible ? '1' : '0';
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
