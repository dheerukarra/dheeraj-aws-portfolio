"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Samples /dheeraj.jpg into a grid of particles. They start scattered, spring home
 * (assembly timeline driven by GSAP), and are repelled by pointer/touch, then re-form.
 * The <img> underneath is the static fallback and the poster while loading.
 * 2D canvas, colour-bucketed batch fills: one path + fill per bucket, not per particle.
 */
export default function ParticlePortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const poster = imgRef.current;
    if (!wrap || !canvas || !poster) return;

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.innerWidth < 640;
    const lowPower =
      (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
    if (reduce || narrow || lowPower) return; // static image stays

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    const cleanups: (() => void)[] = [];
    let visible = true;
    let disposed = false;
    let S = 0; // css size
    let dpr = 1;
    const grid = window.innerWidth >= 1024 ? 84 : 60; // 7056 / 3600 particles max
    const N = grid * grid;
    const hx = new Float32Array(N);
    const hy = new Float32Array(N);
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);
    const sz = new Float32Array(N);
    const bucketOf = new Uint16Array(N);
    let bucketStart: number[] = [];
    let bucketColor: string[] = [];
    const ptr = { x: -9999, y: -9999, active: false };
    const state = { assemble: 0 };
    let tween: gsap.core.Tween | null = null;
    let slowFrames = 0;
    let last = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      S = Math.max(1, Math.round(r.width));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(S * dpr);
      canvas.style.width = `${S}px`;
      canvas.style.height = `${S}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const img = new Image();
    img.src = "/dheeraj.jpg";
    img.onload = () => {
      if (disposed) return;
      const off = document.createElement("canvas");
      off.width = grid;
      off.height = grid;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, grid, grid);
      const data = octx.getImageData(0, 0, grid, grid).data;

      // bucket by quantised colour, sorted so each bucket is a contiguous range
      const entries: { cell: number; key: number; r: number; g: number; b: number; lum: number }[] = [];
      for (let c = 0; c < N; c++) {
        const r = data[c * 4];
        const g = data[c * 4 + 1];
        const b = data[c * 4 + 2];
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const key = ((r >> 6) << 4) | ((g >> 6) << 2) | (b >> 6);
        entries.push({ cell: c, key, r, g, b, lum });
      }
      entries.sort((a, b) => a.key - b.key);
      const cellOf = new Uint16Array(N);
      let prev = -1;
      bucketStart = [];
      bucketColor = [];
      entries.forEach((e, i) => {
        cellOf[i] = e.cell;
        if (e.key !== prev) {
          bucketStart.push(i);
          // bucket colour is first member's colour, brightened slightly for glow on dark ground
          bucketColor.push(`rgb(${Math.min(255, e.r * 1.1 + 8) | 0},${Math.min(255, e.g * 1.1 + 8) | 0},${Math.min(255, e.b * 1.1 + 8) | 0})`);
          prev = e.key;
        }
        bucketOf[i] = bucketStart.length - 1;
        sz[i] = 0.55 + 0.6 * e.lum;
      });
      bucketStart.push(N);

      const layout = () => {
        resize();
        const cell = S / grid;
        for (let i = 0; i < N; i++) {
          hx[i] = (cellOf[i] % grid) * cell + cell / 2;
          hy[i] = ((cellOf[i] / grid) | 0) * cell + cell / 2;
        }
      };
      layout();
      for (let i = 0; i < N; i++) {
        // scatter on a wide ring so assembly reads as particles flying in
        const a = Math.random() * Math.PI * 2;
        const rad = S * (0.6 + Math.random() * 0.9);
        x[i] = S / 2 + Math.cos(a) * rad;
        y[i] = S / 2 + Math.sin(a) * rad;
      }
      const ro = new ResizeObserver(() => {
        if (disposed) return;
        const prevS = S;
        layout();
        const k = S / prevS;
        for (let i = 0; i < N; i++) {
          x[i] *= k;
          y[i] *= k;
        }
      });
      ro.observe(wrap);
      cleanups.push(() => ro.disconnect());

      canvas.style.opacity = "1";
      gsap.to(poster, { opacity: 0, duration: 0.8, ease: "power1.out" });
      tween = gsap.to(state, { assemble: 1, duration: 2.6, ease: "power3.inOut", delay: 0.2 });
      raf = requestAnimationFrame(frame);
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = last ? t - last : 16;
      last = t;
      // sustained < ~35fps: give up on particles, fall back to the static image
      slowFrames = dt > 30 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
      if (slowFrames > 90) {
        cancelAnimationFrame(raf);
        canvas.style.opacity = "0";
        gsap.to(poster, { opacity: 1, duration: 0.4 });
        return;
      }

      const a = state.assemble;
      const k = 0.006 + 0.075 * a * a;
      const damp = 0.84 + 0.04 * (1 - a);
      const R = S * 0.13;
      const R2 = R * R;
      ctx.clearRect(0, 0, S, S);
      const cell = S / grid;

      for (let i = 0; i < N; i++) {
        let fx = (hx[i] - x[i]) * k;
        let fy = (hy[i] - y[i]) * k;
        if (ptr.active) {
          const dx = x[i] - ptr.x;
          const dy = y[i] - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 5.5 * a;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        vx[i] = (vx[i] + fx) * damp;
        vy[i] = (vy[i] + fy) * damp;
        x[i] += vx[i];
        y[i] += vy[i];
      }

      for (let b = 0; b < bucketColor.length; b++) {
        ctx.fillStyle = bucketColor[b];
        ctx.beginPath();
        for (let i = bucketStart[b]; i < bucketStart[b + 1]; i++) {
          const s = sz[i] * cell * 0.85;
          ctx.rect(x[i] - s / 2, y[i] - s / 2, s, s);
        }
        ctx.fill();
      }
    };

    const setPtr = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.active = true;
    };
    const clearPtr = () => {
      ptr.active = false;
    };
    // listen on the window so the field reacts when the cursor passes over overlapping hero text
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left - 40 && e.clientX <= r.right + 40 && e.clientY >= r.top - 40 && e.clientY <= r.bottom + 40;
      if (inside) setPtr(e);
      else clearPtr();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && clearPtr(), { passive: true });
    document.addEventListener("pointerleave", clearPtr);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) last = 0;
    });
    io.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      tween?.kill();
      io.disconnect();
      cleanups.forEach((c) => c());
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", clearPtr);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square w-full"
      style={{ maskImage: "radial-gradient(closest-side at 50% 50%, #000 78%, transparent 100%)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/dheeraj.jpg"
        alt="Portrait of Dheeraj Reddy Karra in a navy blazer and black turtleneck against an indigo to teal gradient"
        width={800}
        height={800}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-700"
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
}
