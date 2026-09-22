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
  const ringRadius = size * 0.34;

  // Solid dark disc, drawn first and underneath. Replaces the old design's
  // heavy white glow (which read as a bright blurred blob, especially where
  // several markers sit close together) with a crisp filled badge — this
  // texture is shared and tinted per-marker via the sprite material's
  // `color` (multiplied per-texel), so the near-black disc stays near-black
  // regardless of tint, giving every marker a consistent dark base that
  // reads clearly against the globe's light-blue land as well as the black
  // ocean.
  ctx.save();
  ctx.fillStyle = "rgba(4,10,15,0.94)";
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius + size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // A single thin ring outline, not the old double-ring stack.
  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = size * 0.04;
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.lineWidth = size * 0.045;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Bolt, sized to sit inside the ring with margin instead of nearly
  // touching it, with only a subtle glow rather than a heavy blurred halo.
  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = size * 0.04;
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.beginPath();
  BOLT_POINTS.forEach(([x, y], i) => {
    const px = cx + (x * size - cx) * 0.62;
    const py = cy + (y * size - cy) * 0.62;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  cachedRingIcon = new THREE.CanvasTexture(canvas);
  return cachedRingIcon;
}
