'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

// Flight routes connecting major airport hubs
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

// Theme-specific globe configurations
const DARK_THEME = {
  dark: 1,
  diffuse: 1.2,
  mapBrightness: 2.5,
  baseColor: [0.05, 0.08, 0.15] as [number, number, number],
  markerColor: [0, 0.94, 1] as [number, number, number],
  glowColor: [0, 0.3, 0.4] as [number, number, number],
  arcColor: [0, 0.94, 1] as [number, number, number],
};

const LIGHT_THEME = {
  dark: 0,
  diffuse: 1.2,
  mapBrightness: 6,
  baseColor: [1, 1, 1] as [number, number, number],
  markerColor: [0.22, 0.52, 0.89] as [number, number, number],
  glowColor: [1, 1, 1] as [number, number, number],
  arcColor: [0.35, 0.6, 0.95] as [number, number, number],
};

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      setIsDark(!isLight);
    };
    checkTheme();

    // Watch for data-theme attribute changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let animationId: number;
    const theme = isDark ? DARK_THEME : LIGHT_THEME;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: phiRef.current,
      theta: 0.15,
      mapSamples: 16000,
      scale: 1.05,
      offset: [0, 0],
      ...theme,
      markers: AIRPORT_MARKERS,
      markerElevation: 0.02,
      arcs: FLIGHT_ROUTES,
      arcWidth: 0.4,
      arcHeight: 0.3,
    });

    globeRef.current = globe;

    // Smooth auto-rotation
    const animate = () => {
      phiRef.current += 0.003;
      globe.update({ phi: phiRef.current });
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      globe.destroy();
    };
  }, [isDark]);

  return (
    <div className="relative w-full aspect-square max-w-[400px]">
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
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          contain: 'layout paint size',
          opacity: 0.95,
        }}
      />
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
