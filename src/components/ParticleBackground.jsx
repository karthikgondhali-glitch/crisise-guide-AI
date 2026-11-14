import React, { useEffect, useRef } from 'react';

const POINTER_LERP = 0.16;
const RADIUS_FACTOR = 0.34;
const PUSH_STRENGTH = 3.4;
const SPRING_K = 0.024;
const DAMPING = 0.86;
const BASE_ALPHA = 0.72;
const FADE_DISTANCE = 70;

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    let pointerActive = false;
    let targetX = 0;
    let targetY = 0;
    let easedX = 0;
    let easedY = 0;

    function buildGrid() {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
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

    function setPointer(clientX, clientY) {
      hasPointerEntered = true;
      pointerActive = true;
      targetX = clientX;
      targetY = clientY;
    }

    function onPointerMove(e) {
      setPointer(e.clientX, e.clientY);
    }

    function onPointerDown(e) {
      setPointer(e.clientX, e.clientY);
    }

    function onPointerUp(e) {
      if (e.pointerType === 'touch') {
        pointerActive = false;
      }
    }

    function onMouseLeave() {
      pointerActive = false;
    }

    function onTouchStart(e) {
      if (e.touches && e.touches[0]) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function onTouchMove(e) {
      if (e.touches && e.touches[0]) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function onTouchEnd() {
      pointerActive = false;
    }

    window.addEventListener('resize', buildGrid);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    buildGrid();

    function tick(now) {
      const minDim = Math.min(width, height);
      const R = RADIUS_FACTOR * minDim;

      const useLissajous = !hasPointerEntered;
      if (useLissajous) {
        const t = reducedMotion ? 0 : now;
        targetX = width * 0.5 + Math.sin(t * 0.00055) * (width * 0.32);
        targetY =
          height * 0.5 + Math.sin(t * 0.00083 + Math.PI * 0.25) * (height * 0.28);
      }

      easedX += (targetX - easedX) * POINTER_LERP;
      easedY += (targetY - easedY) * POINTER_LERP;

      const forceActive = useLissajous || pointerActive;

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
      window.removeEventListener('resize', buildGrid);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
}
