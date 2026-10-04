import type { EffectShape } from './move-effects';

/** Desenha a forma (branca, o tom vem do material) num canvas quadrado. */
export function drawShape(ctx: CanvasRenderingContext2D, shape: EffectShape, size = 64) {
  const c = size / 2;
  const r = size * 0.4;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = size * 0.08;

  const poly = (points: number, outer: number, inner: number, rotation = -Math.PI / 2) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = rotation + (i * Math.PI) / points;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](c + Math.cos(angle) * radius, c + Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  };

  switch (shape) {
    case 'star': poly(5, r, r * 0.45); break;
    case 'burst': poly(8, r, r * 0.3); break;
    case 'flame':
      ctx.beginPath();
      ctx.moveTo(c, c + r);
      ctx.bezierCurveTo(c - r * 1.05, c + r * 0.85, c - r * 0.95, c + r * 0.1, c - r * 0.35, c - r * 0.35);
      ctx.bezierCurveTo(c - r * 0.45, c - r * 0.05, c - r * 0.2, c - r * 0.2, c - r * 0.1, c - r * 0.55);
      ctx.bezierCurveTo(c - r * 0.05, c - r * 0.8, c + r * 0.15, c - r * 0.95, c + r * 0.1, c - r * 1.05);
      ctx.bezierCurveTo(c + r * 0.75, c - r * 0.45, c + r * 0.25, c - r * 0.2, c + r * 0.55, c + r * 0.05);
      ctx.bezierCurveTo(c + r * 0.65, c - r * 0.15, c + r * 0.75, c - r * 0.1, c + r * 0.8, c + r * 0.3);
      ctx.bezierCurveTo(c + r * 1, c + r * 0.85, c + r * 0.4, c + r, c, c + r);
      ctx.fill();
      break;
    case 'drop':
      ctx.beginPath();
      ctx.moveTo(c, c - r);
      ctx.bezierCurveTo(c + r * 0.3, c - r * 0.4, c + r * 0.8, c + r * 0.1, c + r * 0.55, c + r * 0.55);
      ctx.arc(c, c + r * 0.3, r * 0.65, 0.35, Math.PI - 0.35);
      ctx.bezierCurveTo(c - r * 0.8, c + r * 0.1, c - r * 0.3, c - r * 0.4, c, c - r);
      ctx.fill();
      break;
    case 'bolt':
      ctx.beginPath();
      [[0.15, -1], [-0.6, 0.1], [-0.05, 0.1], [-0.25, 1], [0.65, -0.2], [0.05, -0.2], [0.15, -1]].forEach(([x, y], i) =>
        ctx[i === 0 ? 'moveTo' : 'lineTo'](c + x * r, c + y * r));
      ctx.fill();
      break;
    case 'leaf':
      ctx.beginPath();
      ctx.moveTo(c - r * 0.8, c + r * 0.8);
      ctx.quadraticCurveTo(c - r * 0.9, c - r * 0.6, c + r * 0.8, c - r * 0.8);
      ctx.quadraticCurveTo(c + r * 0.9, c + r * 0.6, c - r * 0.8, c + r * 0.8);
      ctx.fill();
      break;
    case 'diamond': poly(4, r, r * 0.55); break;
    case 'ring':
      ctx.lineWidth = size * 0.12;
      ctx.beginPath();
      ctx.arc(c, c, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'bubble':
      ctx.lineWidth = size * 0.08;
      ctx.beginPath();
      ctx.arc(c, c, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c - r * 0.3, c - r * 0.3, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'dust':
      [[-0.5, -0.3, 0.22], [0.4, -0.5, 0.18], [0.1, 0.1, 0.26], [-0.4, 0.55, 0.17], [0.6, 0.5, 0.2]].forEach(([x, y, s]) => {
        ctx.beginPath();
        ctx.arc(c + x * r, c + y * r, s * r, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case 'swirl':
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const angle = t * Math.PI * 3;
        const radius = r * (0.15 + t * 0.8);
        ctx[t === 0 ? 'moveTo' : 'lineTo'](c + Math.cos(angle) * radius, c + Math.sin(angle) * radius);
      }
      ctx.stroke();
      break;
    case 'spark':
      ctx.fillRect(c - r * 0.12, c - r, r * 0.24, r * 2);
      ctx.fillRect(c - r, c - r * 0.12, r * 2, r * 0.24);
      break;
    case 'rock': poly(6, r, r * 0.92, 0); break;
    case 'wisp':
      ctx.beginPath();
      ctx.arc(c + r * 0.2, c - r * 0.2, r * 0.45, 0, Math.PI * 2);
      ctx.moveTo(c + r * 0.2, c - r * 0.2);
      ctx.quadraticCurveTo(c - r * 0.2, c + r * 0.2, c - r * 0.9, c + r * 0.8);
      ctx.quadraticCurveTo(c, c + r * 0.5, c + r * 0.55, c);
      ctx.fill();
      break;
    case 'claw':
      ctx.lineWidth = size * 0.1;
      [-0.5, 0, 0.5].forEach((o) => {
        ctx.beginPath();
        ctx.moveTo(c + (o - 0.3) * r, c - r * 0.9);
        ctx.lineTo(c + (o + 0.3) * r, c + r * 0.9);
        ctx.stroke();
      });
      break;
    case 'crescent':
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(c + r * 0.5, c - r * 0.15, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      break;
    case 'gear':
      poly(8, r, r * 0.78, 0);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(c, c, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      break;
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(c, c + r * 0.9);
      ctx.bezierCurveTo(c - r * 1.3, c, c - r * 0.8, c - r * 1, c, c - r * 0.35);
      ctx.bezierCurveTo(c + r * 0.8, c - r * 1, c + r * 1.3, c, c, c + r * 0.9);
      ctx.fill();
      break;
  }
}
