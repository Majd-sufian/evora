import * as THREE from "three";

let cached: THREE.Texture | null = null;

/** A soft radial-gradient dot, generated once and reused as a sprite map for glowing markers. */
export function getGlowTexture(): THREE.Texture {
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  cached = new THREE.CanvasTexture(canvas);
  return cached;
}

let cachedRingIcon: THREE.Texture | null = null;

/**
 * A ring-with-center-dot "energy node" icon, generated once and reused as a
 * sprite map for markers/clusters instead of a plain soft blob.
 */
export function getRingIconTexture(): THREE.Texture {
  if (cachedRingIcon) return cachedRingIcon;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const cx = size / 2;
  const cy = size / 2;

  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = size * 0.12;
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,1)";
  ctx.shadowBlur = size * 0.1;
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  cachedRingIcon = new THREE.CanvasTexture(canvas);
  return cachedRingIcon;
}
