import type * as ThreeNS from 'three';
import { KEY_ROTATION_STEP, clampRotation, dragToRotation, floatOffset, springStep, swayAngle, type Spring } from './stage-math';

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
  dispose(): void;
}

const PARTICLES = 36;

export async function createStage(THREE: Three, container: HTMLElement, canvas: HTMLCanvasElement, options: StageOptions): Promise<Stage> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 6;

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
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const draw = (time: number) => {
    const t = time / 1000;
    const idle = options.reducedMotion ? 0 : 1;
    body.rotation.y = rotation.value + swayAngle(t) * idle;
    body.position.y = floatOffset(t) * idle;
    const scale = 1 + pulse.value;
    body.scale.set(scale, scale, 1);
    shadow.scale.set((1.3 - body.position.y * 1.5) * scale, 1, 1);
    ring.rotation.z = options.reducedMotion ? 0 : t * 0.25;
    ring.rotation.y = -rotation.value * 0.6;
    particles.rotation.y = rotation.value * 0.3 + (options.reducedMotion ? 0 : t * 0.05);
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    if (disposed) return;
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
    // Em movimento reduzido só redesenha enquanto há interação.
    if (!options.reducedMotion || dragging || !settled) frame = requestAnimationFrame(tick);
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
    dispose() {
      disposed = true;
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
