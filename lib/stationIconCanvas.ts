// Shared 2D canvas rendering for the station "power node" icon (ring +
// lightning bolt + dark contrast halo), used by both the Three.js globe
// (lib/three/glowTexture.ts, tinted per-marker via sprite material color)
// and the MapLibre globe (baked as solid-colored PNGs, since MapLibre's
// data-driven `icon-color` needs an SDF image, which is more setup than a
// few pre-colored variants for the status colors we actually use).

// A lightning-bolt silhouette, normalized to a 0-1 box.
const BOLT_POINTS: [number, number][] = [
  [0.58, 0.12],
  [0.36, 0.54],
  [0.49, 0.54],
  [0.41, 0.88],
  [0.67, 0.42],
  [0.53, 0.42],
];

/** Draws one ring-with-bolt icon, in `color`, with a dark contrast halo, onto a fresh canvas. */
export function drawStationIcon(color: string, size = 128): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const cx = size / 2;
  const cy = size / 2;

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
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.1;
  ctx.fillStyle = color;
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

  return canvas;
}
