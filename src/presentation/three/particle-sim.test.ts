import { POKEMON_TYPES, type PokemonType } from '@/domain';
import { ParticleSystem, FLOOR_Y, Rng } from './particle-sim';
import { PROFILES, hexToRgb, mixRgb, WHITE } from './particle-profiles';

const make = (type: PokemonType, seed = 7, capacity = 32) => new ParticleSystem(capacity, type, '#f08030', seed);

function run(sys: ParticleSystem, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds; t += dt) sys.step(dt);
}

describe('ParticleSystem — física (A9)', () => {
  it('fogo sobe (empuxo) e água cai (gravidade)', () => {
    const fire = make('fire');
    fire.spawn({ x: 0, y: 0 });
    run(fire, 0.4);
    expect(fire.positions[1]).toBeGreaterThan(0.05);

    const water = make('water');
    water.spawn({ x: 0, y: 0 });
    run(water, 0.4);
    expect(water.positions[1]).toBeLessThan(-0.15);
  });

  it('pedra quica no chão e nunca atravessa', () => {
    const rock = make('rock');
    rock.spawn({ x: 0, y: -1, vy: -3 });
    let bounced = false;
    let minY = Infinity;
    for (let t = 0; t < 1.2; t += 1 / 60) {
      const before = rock.velocityOf(0).y;
      rock.step(1 / 60);
      if (before < 0 && rock.velocityOf(0).y > 0) bounced = true;
      minY = Math.min(minY, rock.positions[1]);
    }
    expect(bounced).toBe(true);
    expect(minY).toBeGreaterThanOrEqual(FLOOR_Y - 1e-6);
  });

  it('tipos sem quicada atravessam o chão sem travar', () => {
    const fire = make('fire');
    fire.spawn({ x: 0, y: -1.4, vy: -3 });
    run(fire, 0.2);
    expect(fire.positions[1]).toBeLessThan(FLOOR_Y);
  });

  it('arrasto freia a partícula (explosão de lutador freia rápido)', () => {
    const sys = make('fighting');
    sys.spawn({ x: 0, y: 0, vx: 4 });
    run(sys, 0.1);
    const early = sys.velocityOf(0).x;
    run(sys, 0.2);
    expect(sys.velocityOf(0).x).toBeLessThan(early * 0.6);
  });

  it('espiral gira em torno do centro (voador)', () => {
    const sys = make('flying');
    sys.center = { x: 0, y: 0 };
    sys.spawn({ x: 1, y: 0 });
    run(sys, 0.3);
    expect(sys.positions[1]).toBeGreaterThan(0.1); // ganhou y a partir de x>0: tangencial anti-horário
  });

  it('vida: alpha cai a zero, a partícula some e libera o slot; tamanho evolui', () => {
    const sys = make('fire');
    sys.spawn({ x: 0, y: 0 });
    run(sys, 0.15);
    const early = sys.sizes[0];
    expect(sys.alphas[0]).toBeGreaterThan(0.3);
    run(sys, 0.7);
    expect(sys.sizes[0]).toBeLessThanOrEqual(early);
    run(sys, 1.5);
    expect(sys.activeCount).toBe(0);
    expect(sys.alphas[0]).toBe(0);
  });

  it('fogo esfria: começa clara e termina mais escura que a cor do tipo', () => {
    const sys = make('fire');
    sys.spawn({ x: 0, y: 0, lifeScale: 3 });
    run(sys, 0.05);
    const start = [sys.colors[0], sys.colors[1], sys.colors[2]];
    run(sys, 2.5);
    const late = [sys.colors[0], sys.colors[1], sys.colors[2]];
    const brightness = (c: number[]) => c[0] + c[1] + c[2];
    expect(brightness(start)).toBeGreaterThan(brightness(late));
    const base = hexToRgb('#f08030');
    expect(brightness(late)).toBeLessThan(brightness(base));
  });

  it('delay mantém a partícula invisível até a hora', () => {
    const sys = make('normal');
    sys.spawn({ x: 0, y: 0, delay: 0.2 });
    run(sys, 0.1);
    expect(sys.alphas[0]).toBe(0);
    run(sys, 0.2);
    expect(sys.alphas[0]).toBeGreaterThan(0);
  });

  it('respeita o limite de capacidade', () => {
    const sys = make('normal', 1, 4);
    const results = Array.from({ length: 6 }, () => sys.spawn({ x: 0, y: 0 }));
    expect(results.filter(Boolean)).toHaveLength(4);
    expect(sys.activeCount).toBe(4);
  });

  it('é determinístico com a mesma semente e diferente com outra', () => {
    const a = make('ghost', 42);
    const b = make('ghost', 42);
    const c = make('ghost', 43);
    for (const s of [a, b, c]) {
      s.burst({ x: 0, y: 0 }, 8);
      run(s, 0.5);
    }
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.positions)).not.toEqual(Array.from(c.positions));
  });

  it('burst radial espalha em todas as direções', () => {
    const sys = make('normal', 5, 64);
    sys.burst({ x: 0, y: 0 }, 40);
    run(sys, 0.15);
    const xs = Array.from({ length: 40 }, (_, i) => sys.positions[i * 3]);
    expect(Math.min(...xs)).toBeLessThan(-0.05);
    expect(Math.max(...xs)).toBeGreaterThan(0.05);
  });
});

describe('perfis e cores', () => {
  it('todo tipo tem perfil físico com faixas válidas', () => {
    for (const type of POKEMON_TYPES) {
      const p = PROFILES[type];
      expect(p.life[0]).toBeGreaterThan(0.1);
      expect(p.life[1]).toBeGreaterThanOrEqual(p.life[0]);
      expect(p.speed[1]).toBeGreaterThanOrEqual(p.speed[0]);
      expect(p.sizeStart).toBeGreaterThan(0);
      expect(p.bounce).toBeGreaterThanOrEqual(0);
      expect(p.bounce).toBeLessThan(1);
    }
  });

  it('perfis refletem o comportamento esperado', () => {
    expect(PROFILES.fire.gravity).toBeLessThan(0);
    expect(PROFILES.water.gravity).toBeGreaterThan(2);
    expect(PROFILES.rock.bounce).toBeGreaterThan(0);
    expect(PROFILES.electric.life[1]).toBeLessThan(PROFILES.ghost.life[0]);
    expect(PROFILES.fairy.twinkle).toBeGreaterThan(PROFILES.rock.twinkle);
  });

  it('hex e mistura de cores', () => {
    expect(hexToRgb('#ff0000')).toEqual([1, 0, 0]);
    expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
    expect(mixRgb([0, 0, 0], WHITE, 0.5)).toEqual([0.5, 0.5, 0.5]);
  });

  it('Rng é reproduzível e fica em [0,1)', () => {
    const a = new Rng(1);
    const b = new Rng(1);
    for (let i = 0; i < 20; i++) {
      const v = a.next();
      expect(v).toBe(b.next());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
