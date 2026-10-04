import type * as ThreeNS from 'three';
import { drawShape } from './draw-shapes';
import { PROJECTILE, RUSH, bodyPoseFor, shakeOffset } from './effect-timeline';
import type { EffectShape, ResolvedEffect } from './move-effects';
import { ParticleSystem } from './particle-sim';
import {
  KEY_ROTATION_STEP, clamp01, clampRotation, dragToRotation, easeOut, envelope, floatOffset,
  projectilePoint, springStep, swayAngle, type Spring,
} from './stage-math';

type Three = typeof ThreeNS;

export interface StageOptions {
  imageUrl: string;
  accentColor: string;
  reducedMotion: boolean;
  onContextLost?: () => void;
}

export interface Stage {
  /** Rotaciona por teclado (acessibilidade). */
  nudge(direction: -1 | 1): void;
  react(): void;
  /** Toca a animação de um golpe; cancela a anterior. */
  playMove(effect: ResolvedEffect): void;
  dispose(): void;
}

interface ActiveEffect {
  /** Atualiza o efeito; devolve true quando terminou. */
  update(now: number): boolean;
  dispose(): void;
}

const PARTICLES = 36;
const CAPACITY = 160;
const BASE_CAMERA_Z = 6;

const VERTEX_SHADER = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aRot;
  attribute vec3 aColor;
  uniform float uScale;
  uniform float uMaxPoint;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vColor;
  void main() {
    vAlpha = aAlpha;
    vRot = aRot;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Limite de tamanho: GPUs (sobretudo móveis) têm teto de ponto e desenham mal sprites enormes.
    gl_PointSize = min(uMaxPoint, aSize * uScale / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D map;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float s = sin(vRot);
    float co = cos(vRot);
    vec2 uv = vec2(co * c.x - s * c.y, s * c.x + co * c.y) + 0.5;
    float a = texture2D(map, uv).a * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const seedFor = (effect: ResolvedEffect, play: number) => {
  let h = play * 2654435761;
  for (const ch of `${effect.type}:${effect.category}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};

export async function createStage(THREE: Three, container: HTMLElement, canvas: HTMLCanvasElement, options: StageOptions): Promise<Stage> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = BASE_CAMERA_Z;

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const texture = track(await loader.loadAsync(options.imageUrl));
  texture.colorSpace = THREE.SRGBColorSpace;

  // Plano do Pokémon
  const body = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.7, 2.7)),
    track(new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })),
  );
  scene.add(body);
  const bodyMaterial = body.material as ThreeNS.MeshBasicMaterial;

  // Sombra no chão
  const shadow = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.7, 32)),
    track(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })),
  );
  shadow.rotation.x = -Math.PI / 2.4;
  shadow.position.set(0, -1.62, -0.2);
  shadow.scale.set(1.3, 1, 1);
  scene.add(shadow);

  // Anel de energia atrás (parallax) na cor do tipo
  const ring = new THREE.Mesh(
    track(new THREE.TorusGeometry(2.2, 0.05, 12, 64)),
    track(new THREE.MeshBasicMaterial({ color: options.accentColor, transparent: true, opacity: 0.55 })),
  );
  ring.position.z = -1.2;
  scene.add(ring);

  // Partículas
  const positions = new Float32Array(PARTICLES * 3);
  for (let i = 0; i < PARTICLES; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = -0.5 - Math.random() * 1.5;
  }
  const particleGeometry = track(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    track(new THREE.PointsMaterial({ color: options.accentColor, size: 0.06, transparent: true, opacity: 0.8 })),
  );
  scene.add(particles);

  // Efeitos de golpe
  const shapeTextures = new Map<EffectShape, ThreeNS.Texture>();
  const textureFor = (shape: EffectShape) => {
    let texture = shapeTextures.get(shape);
    if (!texture) {
      const shapeCanvas = document.createElement('canvas');
      shapeCanvas.width = shapeCanvas.height = 64;
      const ctx = shapeCanvas.getContext('2d');
      if (ctx) drawShape(ctx, shape, 64);
      texture = track(new THREE.CanvasTexture(shapeCanvas));
      // Sem mipmaps: com sprites grandes e girados o mip borrado vira um quadrado translúcido.
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      shapeTextures.set(shape, texture);
    }
    return texture;
  };
  let fx: ActiveEffect | null = null;
  let plays = 0;
  let viewScale = 136;
  let scaleUniform: { value: number } | null = null;

  // Estado de interação
  let rotation: Spring = { value: 0, velocity: 0 };
  let rotationTarget = 0;
  let pulse: Spring = { value: 0, velocity: 0 };
  let pulseTarget = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartRotation = 0;
  let moved = false;
  let frame = 0;
  let last = performance.now();
  let disposed = false;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    viewScale = (h * Math.min(window.devicePixelRatio || 1, 2)) / 2;
    if (scaleUniform) scaleUniform.value = viewScale;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const draw = (time: number) => {
    const t = time / 1000;
    const idle = options.reducedMotion ? 0 : 1;
    body.rotation.y = rotation.value + swayAngle(t) * idle;
    body.position.y = floatOffset(t) * idle;
    body.position.z = 0;
    body.rotation.z = 0;
    bodyMaterial.color.setScalar(1);
    camera.position.set(0, 0, BASE_CAMERA_Z);
    const scale = 1 + pulse.value;
    body.scale.set(scale, scale, 1);
    if (fx && fx.update(time)) endEffect();
    shadow.scale.set((1.3 - body.position.y * 1.5) * scale, 1, 1);
    ring.rotation.z = options.reducedMotion ? 0 : t * 0.25;
    ring.rotation.y = -rotation.value * 0.6;
    particles.rotation.y = rotation.value * 0.3 + (options.reducedMotion ? 0 : t * 0.05);
    renderer.render(scene, camera);
  };

  const tick = () => {
    if (disposed) return;
    // Um único relógio (performance.now) para animação idle e efeitos de golpe.
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (!dragging) rotationTarget = 0;
    rotation = options.reducedMotion
      ? { value: rotationTarget, velocity: 0 }
      : dragging
        ? { value: rotationTarget, velocity: 0 }
        : springStep(rotation, rotationTarget, dt);
    pulse = springStep(pulse, pulseTarget, dt, 160, 12);
    pulseTarget = 0;
    draw(now);
    const settled = Math.abs(rotation.value) < 0.001 && Math.abs(pulse.value) < 0.001 && Math.abs(pulse.velocity) < 0.001;
    // Em movimento reduzido só redesenha enquanto há interação ou efeito em curso.
    if (!options.reducedMotion || dragging || !settled || fx) frame = requestAnimationFrame(tick);
    else frame = 0;
  };

  const requestFrame = () => {
    if (!frame && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const react = () => {
    pulse = { value: pulse.value, velocity: 1.6 };
    requestFrame();
  };

  const endEffect = () => {
    fx?.dispose();
    fx = null;
  };

  const createEffect = (effect: ResolvedEffect, start: number): ActiveEffect => {
    // Movimento reduzido: só um brilho curto do anel, sem partículas nem deslocamento.
    if (options.reducedMotion) {
      const ringMaterial = ring.material as ThreeNS.MeshBasicMaterial;
      const baseColor = ringMaterial.color.clone();
      const baseOpacity = ringMaterial.opacity;
      return {
        update(now) {
          const p = clamp01((now - start) / 1000 / 0.5);
          ringMaterial.color.set(effect.color);
          ringMaterial.opacity = baseOpacity + (1 - baseOpacity) * envelope(p);
          return p >= 1;
        },
        dispose() {
          ringMaterial.color.copy(baseColor);
          ringMaterial.opacity = baseOpacity;
        },
      };
    }

    const system = new ParticleSystem(CAPACITY, effect.type, effect.color, seedFor(effect, ++plays));
    const rng = system.random;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(system.positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(system.sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(system.alphas, 1));
    geometry.setAttribute('aRot', new THREE.BufferAttribute(system.rotations, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(system.colors, 3));
    const uniforms = { map: { value: textureFor(effect.shape) }, uScale: { value: viewScale }, uMaxPoint: { value: 72 } };
    scaleUniform = uniforms.uScale;
    const material = new THREE.ShaderMaterial({
      uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, transparent: true, depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 5; // partículas desenham por cima do corpo
    scene.add(points);

    // Onda de choque no impacto
    const waveMaterial = new THREE.MeshBasicMaterial({ color: effect.color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const waveGeometry = new THREE.RingGeometry(0.9, 1, 64);
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    wave.renderOrder = 4;
    wave.visible = false;
    scene.add(wave);

    const impactAt = effect.motion === 'rush' ? RUSH.impact : PROJECTILE.impact;
    const acc = { charge: 0, trail: 0, aura: 0 };
    const take = (key: keyof typeof acc, rate: number, dt: number) => {
      acc[key] += rate * dt;
      const n = Math.floor(acc[key]);
      acc[key] -= n;
      return n;
    };
    let impacted = false;
    let lastNow = start;
    let impactPoint = { x: 0.15, y: 0, z: 0.9 };
    const mouth = { x: 0.15, y: 0.25, z: 0.3 };
    const fallsFromAbove = system.profile.gravity > 1.5; // água, gelo, pedra, terra, aço: caem como chuva

    return {
      update(now) {
        const p = clamp01((now - start) / 1000 / effect.duration);
        const dt = Math.min(0.1, Math.max(0, (now - lastNow) / 1000));
        lastNow = now;
        const pose = bodyPoseFor(effect.motion, p);

        // Corpo do Pokémon
        body.position.z = pose.z;
        body.scale.x *= pose.scaleX;
        body.scale.y *= pose.scaleY;
        body.rotation.z = pose.rotZ;
        bodyMaterial.color.setScalar(1 + 0.9 * pose.flash);
        const shake = shakeOffset(now / 1000, pose.shake);
        camera.position.set(shake.x, shake.y, BASE_CAMERA_Z);

        // Emissão por tipo de movimento
        if (effect.motion === 'rush') {
          if (!impacted && p >= impactAt) {
            impacted = true;
            impactPoint = { x: 0.15, y: 0, z: pose.z + 0.3 };
            system.burst(impactPoint, 26, 1, { sizeScale: 0.8 });
            system.burst(impactPoint, 12, 0.55, { delay: 0.05, lifeScale: 1.3, sizeScale: 0.8 });
          }
        } else if (effect.motion === 'projectile') {
          if (p < PROJECTILE.charge) {
            for (let k = take('charge', 130, dt); k > 0; k--) {
              const angle = rng.range(0, Math.PI * 2);
              const r = rng.range(1, 1.5);
              const speed = rng.range(1.8, 2.6);
              system.spawn({
                x: mouth.x + Math.cos(angle) * r, y: mouth.y + Math.sin(angle) * r, z: mouth.z,
                vx: -Math.cos(angle) * speed, vy: -Math.sin(angle) * speed, sizeScale: 0.55, lifeScale: 0.4,
              });
            }
          } else if (p < impactAt) {
            const flight = (p - PROJECTILE.charge) / (impactAt - PROJECTILE.charge);
            const head = projectilePoint(flight);
            for (let k = take('trail', 170, dt); k > 0; k--) {
              system.spawn({
                x: head.x + rng.signed() * 0.05, y: head.y + rng.signed() * 0.05, z: head.z,
                vx: -0.8 + rng.signed() * 0.5, vy: rng.signed() * 0.5, sizeScale: rng.range(0.6, 1), lifeScale: 0.55,
              });
            }
            system.spawn({ x: head.x, y: head.y, z: head.z, sizeScale: 2.1, lifeScale: 0.2 });
          }
          if (!impacted && p >= impactAt) {
            impacted = true;
            impactPoint = projectilePoint(1);
            system.burst(impactPoint, 34, 1.1, { sizeScale: 0.85 });
            system.burst(impactPoint, 14, 0.6, { delay: 0.05, lifeScale: 1.2, sizeScale: 0.85 });
          }
        } else if (p < 0.88) {
          system.center = { x: 0, y: 0 };
          for (let k = take('aura', 85 * envelope(p) + 10, dt); k > 0; k--) {
            const angle = rng.range(0, Math.PI * 2);
            const r = rng.range(0.9, 1.3);
            system.spawn({
              x: Math.cos(angle) * r,
              y: fallsFromAbove ? rng.range(1.1, 1.7) : rng.range(-1.35, -0.9),
              z: 0.2 + Math.sin(angle) * 0.3,
              vx: -Math.sin(angle) * 0.4,
              vy: fallsFromAbove ? 0 : rng.range(0.6, 1.4),
              sizeScale: rng.range(0.7, 1.2),
            });
          }
        }

        // Física (subpassos para acompanhar quadros lentos)
        const steps = Math.min(8, Math.max(1, Math.ceil(dt / (1 / 60))));
        for (let k = 0; k < steps; k++) system.step(dt / steps);
        for (const name of ['position', 'aSize', 'aAlpha', 'aRot', 'aColor'] as const) geometry.attributes[name].needsUpdate = true;

        // Onda de choque
        if (impacted) {
          const age = (p - impactAt) / 0.3;
          wave.visible = age < 1;
          // anel contido no quadro (z fixo, raio máximo ≈ 1,3) e mais sutil
          wave.position.set(impactPoint.x, impactPoint.y, 0.3);
          wave.scale.setScalar(0.2 + 1.1 * easeOut(age));
          waveMaterial.opacity = 0.5 * (1 - clamp01(age)) ** 1.5;
        }

        const lingering = system.activeCount > 0 && (now - start) / 1000 < effect.duration + 1.6;
        return p >= 1 && !lingering;
      },
      dispose() {
        if (scaleUniform === uniforms.uScale) scaleUniform = null;
        scene.remove(points);
        scene.remove(wave);
        geometry.dispose();
        material.dispose();
        waveGeometry.dispose();
        waveMaterial.dispose();
      },
    };
  };

  const playMove = (effect: ResolvedEffect) => {
    if (disposed) return;
    endEffect();
    fx = createEffect(effect, performance.now());
    requestFrame();
  };

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    moved = false;
    dragStartX = e.clientX;
    dragStartRotation = rotation.value;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) > 4) moved = true;
    rotationTarget = clampRotation(dragStartRotation + dragToRotation(delta, container.clientWidth));
    requestFrame();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    if (!moved) react();
    requestFrame();
  };
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else requestFrame();
  };
  const onContextLost = (e: Event) => {
    e.preventDefault();
    options.onContextLost?.();
  };

  const observer = new ResizeObserver(() => {
    resize();
    requestFrame();
  });
  observer.observe(container);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('webglcontextlost', onContextLost);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  draw(performance.now());
  if (!options.reducedMotion) requestFrame();

  return {
    nudge(direction) {
      rotationTarget = clampRotation(rotation.value + direction * KEY_ROTATION_STEP);
      rotation = { value: rotationTarget, velocity: 0 };
      dragging = false;
      requestFrame();
    },
    react,
    playMove,
    dispose() {
      disposed = true;
      endEffect();
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.clear();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
