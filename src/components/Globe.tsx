'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let animationId: number;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2.5,
      baseColor: [0.05, 0.08, 0.15],
      markerColor: [0, 0.94, 1],
      glowColor: [0, 0.3, 0.4],
      markers: [
        // Major airport hubs
        { location: [49.0097, -123.0679], size: 0.05 },  // YVR
        { location: [25.2532, 55.3657], size: 0.05 },    // DXB
        { location: [51.4700, -0.4543], size: 0.05 },    // LHR
        { location: [40.6413, -73.7781], size: 0.05 },    // JFK
        { location: [35.5494, 139.7798], size: 0.05 },    // HND
        { location: [-33.9461, 151.1772], size: 0.05 },   // SYD
        { location: [1.3644, 103.9915], size: 0.05 },     // SIN
        { location: [10.8185, 106.6519], size: 0.04 },    // SGN
        { location: [21.0212, 105.8040], size: 0.04 },    // HAN
        { location: [25.0796, 121.2342], size: 0.04 },    // TPE
        { location: [48.8566, 2.3522], size: 0.04 },      // CDG
        { location: [59.9139, 10.7522], size: 0.04 },     // OSL
      ],
    });

    globeRef.current = globe;

    // Auto-rotation animation loop
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
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[400px]">
      {/* Outer glow ring */}
      <div
        className="absolute inset-[-10%] rounded-full opacity-30 animate-glow-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          contain: 'layout paint size',
          opacity: 0.9,
        }}
      />
    </div>
  );
}
