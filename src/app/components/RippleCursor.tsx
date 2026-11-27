"use client";

import { useEffect, useRef } from "react";

interface SnowflakeTrailProps {
  element?: HTMLElement | null;
  emojis?: string[];
}

const DEFAULT_EMOJIS = ["❄️"];

class SnowflakeParticle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  lifeSpan: number;
  initialLifeSpan: number;
  sprite: HTMLCanvasElement;

  constructor(x: number, y: number, sprite: HTMLCanvasElement) {
    this.position = { x, y };
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.5),
      y: 1 + Math.random(),
    };
    this.lifeSpan = Math.floor(Math.random() * 60 + 80);
    this.initialLifeSpan = this.lifeSpan;
    this.sprite = sprite;
  }

  update(context: CanvasRenderingContext2D) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeSpan -= 1;

    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
    this.velocity.y -= Math.random() / 300;

    const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);

    context.save();
    context.translate(this.position.x, this.position.y);
    context.scale(scale, scale);
    context.drawImage(
      this.sprite,
      -this.sprite.width / 2,
      -this.sprite.height / 2
    );
    context.restore();
  }
}

export default function SnowflakeTrail({
  element,
  emojis = DEFAULT_EMOJIS,
}: SnowflakeTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SnowflakeParticle[]>([]);
  const spritesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targetElement = element || document.body;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.style.position = element ? "absolute" : "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "55";
    canvas.style.pointerEvents = "none";

    targetElement.appendChild(canvas);
    canvasRef.current = canvas;

    const setCanvasSize = () => {
      canvas.width = element ? targetElement.clientWidth : window.innerWidth;
      canvas.height = element ? targetElement.clientHeight : window.innerHeight;
    };

    const buildSprites = () => {
      spritesRef.current = [];
      context.font = "14px serif";
      context.textBaseline = "middle";
      context.textAlign = "center";

      for (const glyph of emojis) {
        const metrics = context.measureText(glyph);
        const width = Math.max(16, Math.ceil(metrics.width + 4));
        const ascent = metrics.actualBoundingBoxAscent || 11;
        const descent = metrics.actualBoundingBoxDescent || 3;
        const height = Math.max(16, Math.ceil(ascent + descent + 4));

        const offscreen = document.createElement("canvas");
        offscreen.width = width;
        offscreen.height = height;

        const offCtx = offscreen.getContext("2d");
        if (!offCtx) continue;

        offCtx.font = "14px serif";
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillText(glyph, width / 2, height / 2);

        spritesRef.current.push(offscreen);
      }
    };

    const spawnSnowflake = (x: number, y: number) => {
      const bank = spritesRef.current;
      if (bank.length === 0) return;
      const sprite = bank[Math.floor(Math.random() * bank.length)];
      particlesRef.current.push(new SnowflakeParticle(x, y, sprite));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (motionQuery.matches) return;

      if (element) {
        const rect = targetElement.getBoundingClientRect();
        spawnSnowflake(e.clientX - rect.left, e.clientY - rect.top);
      } else {
        spawnSnowflake(e.clientX, e.clientY);
      }
    };

    const renderFrame = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const alive: SnowflakeParticle[] = [];
      for (const particle of particlesRef.current) {
        particle.update(context);
        if (particle.lifeSpan >= 0) {
          alive.push(particle);
        }
      }
      particlesRef.current = alive;

      rafRef.current = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      particlesRef.current = [];

      if (motionQuery.matches) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      setCanvasSize();
      buildSprites();
      rafRef.current = requestAnimationFrame(renderFrame);
    };

    start();
    targetElement.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });
    window.addEventListener("resize", setCanvasSize);

    const handleMotionChange = () => start();
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      targetElement.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", setCanvasSize);
      motionQuery.removeEventListener("change", handleMotionChange);
      canvas.remove();
      canvasRef.current = null;
    };
  }, [element, emojis]);

  return null;
}