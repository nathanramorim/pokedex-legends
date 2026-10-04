import { PROFILES, hexToRgb, mixRgb, BLACK, WHITE, type ParticleProfile, type Rgb } from './particle-profiles';
import type { PokemonType } from '@/domain';

/** Gerador pseudoaleatório com semente (mulberry32): simulação determinística. */
export class Rng {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number) {
    return min + (max - min) * this.next();
  }
  signed() {
    return this.next() * 2 - 1;
  }
}

export const FLOOR_Y = -1.45;
/** Ajuste global para as partículas lerem bem sobre a tela verde clara da Pokédex. */
export const SIZE_BOOST = 1.9;

export interface SpawnOptions {
  x: number;
  y: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  sizeScale?: number;
  lifeScale?: number;
  /** Segundos até a partícula aparecer. */
  delay?: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Sistema de partículas com física simples (gravidade/empuxo, arrasto, turbulência,
 * espiral, quicada). Os buffers abaixo são lidos direto pelo renderizador.
 */
export class ParticleSystem {
  readonly positions: Float32Array;
  readonly sizes: Float32Array;
  readonly alphas: Float32Array;
  readonly rotations: Float32Array;
  readonly colors: Float32Array;

  private readonly vel: Float32Array;
  private readonly age: Float32Array;
  private readonly life: Float32Array;
  private readonly spin: Float32Array;
  private readonly phase: Float32Array;
  private readonly scale: Float32Array;
  private readonly alive: Uint8Array;
  private readonly rng: Rng;
  private readonly start: Rgb;
  private readonly mid: Rgb;
  private readonly end: Rgb;
  private cursor = 0;

  readonly profile: ParticleProfile;
  /** Centro usado pelas forças em espiral. */
  center = { x: 0, y: 0 };

  constructor(readonly capacity: number, type: PokemonType, colorHex: string, seed: number) {
    this.profile = PROFILES[type];
    this.positions = new Float32Array(capacity * 3);
    this.sizes = new Float32Array(capacity);
    this.alphas = new Float32Array(capacity);
    this.rotations = new Float32Array(capacity);
    this.colors = new Float32Array(capacity * 3);
    this.vel = new Float32Array(capacity * 3);
    this.age = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.spin = new Float32Array(capacity);
    this.phase = new Float32Array(capacity);
    this.scale = new Float32Array(capacity);
    this.alive = new Uint8Array(capacity);
    this.rng = new Rng(seed);
    const base = hexToRgb(colorHex);
    this.mid = base;
    this.start = mixRgb(base, WHITE, this.profile.startMix);
    this.end = mixRgb(base, BLACK, this.profile.endMix);
  }

  get random() {
    return this.rng;
  }

  get activeCount() {
    let n = 0;
    for (let i = 0; i < this.capacity; i++) if (this.alive[i]) n++;
    return n;
  }

  /** Cria uma partícula; devolve false se o limite foi atingido. */
  spawn(o: SpawnOptions): boolean {
    for (let k = 0; k < this.capacity; k++) {
      const i = (this.cursor + k) % this.capacity;
      if (this.alive[i]) continue;
      this.cursor = (i + 1) % this.capacity;
      const p = this.profile;
      this.alive[i] = 1;
      this.age[i] = -(o.delay ?? 0);
      this.life[i] = this.rng.range(p.life[0], p.life[1]) * (o.lifeScale ?? 1);
      this.spin[i] = p.upright ? 0 : this.rng.signed() * p.spin;
      this.phase[i] = this.rng.range(0, Math.PI * 2);
      this.scale[i] = o.sizeScale ?? 1;
      this.rotations[i] = p.upright ? this.rng.signed() * 0.25 : this.rng.range(0, Math.PI * 2);
      this.positions.set([o.x, o.y, o.z ?? 0], i * 3);
      this.vel.set([o.vx ?? 0, o.vy ?? 0, o.vz ?? 0], i * 3);
      this.alphas[i] = 0;
      this.sizes[i] = 0;
      return true;
    }
    return false;
  }

  /** Explosão radial: n partículas com velocidade dentro da faixa do perfil. */
  burst(origin: { x: number; y: number; z?: number }, n: number, speedScale = 1, opts: Partial<SpawnOptions> = {}) {
    const p = this.profile;
    for (let k = 0; k < n; k++) {
      const angle = this.rng.range(0, Math.PI * 2);
      const speed = this.rng.range(p.speed[0], p.speed[1]) * speedScale;
      this.spawn({
        x: origin.x, y: origin.y, z: origin.z ?? 0,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, vz: this.rng.range(0, speed * 0.4),
        ...opts,
        sizeScale: (opts.sizeScale ?? 1) * this.rng.range(0.7, 1.25),
      });
    }
  }

  step(dt: number) {
    const p = this.profile;
    const damp = Math.exp(-p.drag * dt);
    for (let i = 0; i < this.capacity; i++) {
      if (!this.alive[i]) continue;
      this.age[i] += dt;
      const age = this.age[i];
      if (age < 0) {
        this.alphas[i] = 0;
        continue;
      }
      const t = age / this.life[i];
      if (t >= 1) {
        this.alive[i] = 0;
        this.alphas[i] = 0;
        this.sizes[i] = 0;
        continue;
      }

      const o = i * 3;
      let vx = this.vel[o];
      let vy = this.vel[o + 1];
      let vz = this.vel[o + 2];
      let x = this.positions[o];
      let y = this.positions[o + 1];
      let z = this.positions[o + 2];
      const ph = this.phase[i];

      vx += Math.sin(age * 3.1 + ph) * p.turbulence * dt;
      vy += Math.cos(age * 2.3 + ph * 1.7) * p.turbulence * dt;
      vz += Math.sin(age * 2.7 + ph * 0.6) * p.turbulence * dt * 0.5;
      if (p.swirl !== 0) {
        const dx = x - this.center.x;
        const dy = y - this.center.y;
        const r = Math.hypot(dx, dy) + 1e-3;
        vx += (-dy / r) * p.swirl * dt;
        vy += (dx / r) * p.swirl * dt;
      }
      vy -= p.gravity * dt;
      vx *= damp;
      vy *= damp;
      vz *= damp;
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;

      if (p.bounce > 0 && y < FLOOR_Y && vy < 0) {
        y = FLOOR_Y;
        vy = -vy * p.bounce;
        vx *= 0.8;
        if (Math.abs(vy) < 0.3) vy = 0;
      }

      this.vel[o] = vx;
      this.vel[o + 1] = vy;
      this.vel[o + 2] = vz;
      this.positions[o] = x + (p.jitter ? this.rng.signed() * p.jitter : 0);
      this.positions[o + 1] = y + (p.jitter ? this.rng.signed() * p.jitter : 0);
      this.positions[o + 2] = z;
      this.rotations[i] += this.spin[i] * dt;

      const fadeIn = Math.min(1, age / 0.06);
      const twinkle = 1 - p.twinkle * (0.5 + 0.5 * Math.sin(age * 22 + ph));
      this.alphas[i] = fadeIn * (1 - t) ** 1.3 * twinkle;
      this.sizes[i] = lerp(p.sizeStart, p.sizeEnd, t) * this.scale[i] * SIZE_BOOST;

      const c = t < 0.35 ? mixRgb(this.start, this.mid, t / 0.35) : mixRgb(this.mid, this.end, (t - 0.35) / 0.65);
      this.colors[o] = c[0];
      this.colors[o + 1] = c[1];
      this.colors[o + 2] = c[2];
    }
  }

  /** Velocidade atual da partícula (para testes e efeitos). */
  velocityOf(i: number) {
    return { x: this.vel[i * 3], y: this.vel[i * 3 + 1], z: this.vel[i * 3 + 2] };
  }
}
