import React, { useEffect, useRef } from 'react';

const POINTER_LERP = 0.16;
const RADIUS_FACTOR = 0.34;
const PUSH_STRENGTH = 3.4;
const SPRING_K = 0.024;
const DAMPING = 0.86;
const BASE_ALPHA = 0.72;
const FADE_DISTANCE = 70;

export default function ParticleCloakPlate({
  headline,
  caption,
  safe = true,
  className = '',
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let rafId = 0;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasPointerEntered = false;
    let pointerInside = false;

    let targetX = 0;
    let targetY = 0;
    let easedX = 0;
    let easedY = 0;

    function buildGrid() {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const step = Math.max(9, Math.min(width, height) / 22);
      const cols = Math.max(1, Math.floor((width - step) / step) + 1);
      const rows = Math.max(1, Math.floor((height - step) / step) + 1);
      const offsetX = (width - (cols - 1) * step) * 0.5;
      const offsetY = (height - (rows - 1) * step) * 0.5;

      const nextParticles = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const hx = offsetX + col * step;
          const hy = offsetY + row * step;
          const isIceCyan = (row + col) % 4 === 0;
          nextParticles.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            r: 1 + Math.random() * 1.6,
            rgb: isIceCyan ? '165, 243, 252' : '34, 211, 238',
          });
        }
      }
      particles = nextParticles;

      if (!hasPointerEntered) {
        targetX = width * 0.5;
        targetY = height * 0.5;
        easedX = targetX;
        easedY = targetY;
      }
    }

    function updatePointer(clientX, clientY) {
      const rect = host.getBoundingClientRect();
      targetX = clientX - rect.left;
      targetY = clientY - rect.top;
    }

    function onPointerEnter(e) {
      hasPointerEntered = true;
      pointerInside = true;
      updatePointer(e.clientX, e.clientY);
    }

    function onPointerMove(e) {
      hasPointerEntered = true;
      pointerInside = true;
      updatePointer(e.clientX, e.clientY);
    }

    function onPointerLeave() {
      pointerInside = false;
    }

    function onTouchStart(e) {
      if (e.touches && e.touches[0]) {
        hasPointerEntered = true;
        pointerInside = true;
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function onTouchMove(e) {
      if (e.touches && e.touches[0]) {
        hasPointerEntered = true;
        pointerInside = true;
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function onTouchEnd() {
      pointerInside = false;
    }

    host.addEventListener('pointerenter', onPointerEnter);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('touchstart', onTouchStart, { passive: true });
    host.addEventListener('touchmove', onTouchMove, { passive: true });
    host.addEventListener('touchend', onTouchEnd, { passive: true });

    const ro = new ResizeObserver(() => {
      buildGrid();
    });
    ro.observe(host);
    buildGrid();

    function tick(now) {
      const minDim = Math.min(width, height);
      const R = RADIUS_FACTOR * minDim;

      const useLissajous = !hasPointerEntered;
      if (useLissajous) {
        const t = reducedMotion ? 0 : now;
        targetX = width * 0.5 + Math.sin(t * 0.00055) * (width * 0.28);
        targetY =
          height * 0.5 + Math.sin(t * 0.00083 + Math.PI * 0.25) * (height * 0.22);
      }

      easedX += (targetX - easedX) * POINTER_LERP;
      easedY += (targetY - easedY) * POINTER_LERP;

      const forceActive = useLissajous || pointerInside;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (forceActive) {
          const dx = p.x - easedX;
          const dy = p.y - easedY;
          const d = Math.hypot(dx, dy);

          if (d < R) {
            const ratio = 1 - d / R;
            const f = ratio * ratio * PUSH_STRENGTH;
            if (d > 0.0001) {
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            } else {
              const angle = (i * 2.39996) % (Math.PI * 2);
              p.vx += Math.cos(angle) * f;
              p.vy += Math.sin(angle) * f;
            }
          }
        }

        p.vx += (p.hx - p.x) * SPRING_K;
        p.vy += (p.hy - p.y) * SPRING_K;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const distFromHome = Math.hypot(p.x - p.hx, p.y - p.hy);
        const alpha = Math.max(0, BASE_ALPHA - distFromHome / FADE_DISTANCE);
        if (alpha <= 0.005) continue;

        ctx.fillStyle = `rgba(${p.rgb}, ${alpha.toFixed(4)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      host.removeEventListener('pointerenter', onPointerEnter);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('touchstart', onTouchStart);
      host.removeEventListener('touchmove', onTouchMove);
      host.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const gradientClass = safe
    ? 'from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_28px_rgba(34,211,238,0.45)]'
    : 'from-white via-rose-200 to-red-400 drop-shadow-[0_0_28px_rgba(248,113,113,0.45)]';

  return (
    <section
      ref={hostRef}
      aria-label="Interactive particle cloak display"
      className={`relative w-full min-h-[220px] md:min-h-[260px] rounded-xl border border-cyan-500/30 bg-black/80 backdrop-blur-[2px] overflow-hidden grid place-items-center select-none touch-pan-y ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 ${
          safe
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.14)_0%,transparent_65%)]'
            : 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.14)_0%,transparent_65%)]'
        }`}
      />
      <div className="relative z-[1] flex flex-col items-center justify-center text-center px-6 py-8 max-w-3xl">
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-balance bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent`}
        >
          {headline}
        </h1>
        <p className="mt-3 text-xs sm:text-sm font-mono tabular-nums tracking-wide text-cyan-100/80">
          {caption}
        </p>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-[2] w-full h-full block pointer-events-none"
      />
    </section>
  );
}
