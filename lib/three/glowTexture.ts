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

// A lightning-bolt silhouette, normalized to a 0-1 box.
const BOLT_POINTS: [number, number][] = [
  [0.58, 0.12],
  [0.36, 0.54],
  [0.49, 0.54],
  [0.41, 0.88],
  [0.67, 0.42],
  [0.53, 0.42],
];

/**
 * A ring-with-bolt "power node" icon, generated once and reused as a sprite
 * map for markers/clusters instead of a plain soft blob.
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

  // Dark contrast halo, drawn first and underneath. This texture is shared
  // and tinted per-marker via the sprite material's `color` (multiplied
  // per-texel), so a near-black halo stays near-black regardless of tint —
  // giving every marker a consistent dark outline that reads clearly
  // against the globe's light-blue land as well as the black ocean, instead
  // of a same-brightness glow blending into lighter terrain.
  ctx.save();
  ctx.strokeStyle = "rgba(3,8,12,0.92)";
  ctx.lineWidth = size * 0.11;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(3,8,12,0.92)";
  ctx.beginPath();
  BOLT_POINTS.forEach(([x, y], i) => {
    const px = cx + (x * size - cx) * 1.22;
    const py = cy + (y * size - cy) * 1.22;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,0.95)";
  ctx.shadowBlur = size * 0.12;
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,1)";
  ctx.shadowBlur = size * 0.1;
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.beginPath();
  BOLT_POINTS.forEach(([x, y], i) => {
    const px = x * size;
    const py = y * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  cachedRingIcon = new THREE.CanvasTexture(canvas);
  return cachedRingIcon;
}
