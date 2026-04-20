"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export function MeshGradient({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame = 0;
    let t = 0;

    const blobs = [
      { x: 0.2, y: 0.3, r: 0.45, color: "rgba(45,212,191,0.07)" },
      { x: 0.8, y: 0.6, r: 0.5, color: "rgba(129,140,248,0.06)" },
      { x: 0.5, y: 0.8, r: 0.4, color: "rgba(45,212,191,0.04)" },
      { x: 0.1, y: 0.7, r: 0.35, color: "rgba(52,211,153,0.05)" }
    ];

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((blob, i) => {
        const speed = 0.0003 + i * 0.0001;
        const px = (blob.x + Math.sin(t * speed + i * 1.5) * 0.15) * w;
        const py = (blob.y + Math.cos(t * speed * 0.8 + i * 2.1) * 0.12) * h;
        const radius = blob.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame();
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      drawFrame();
      t++;
      animFrame = requestAnimationFrame(loop);
    };

    if (!reduceMotion) animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
      style={{ mixBlendMode: "screen" }}
      aria-hidden
    />
  );
}
