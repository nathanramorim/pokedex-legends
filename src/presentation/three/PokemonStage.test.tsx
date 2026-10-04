import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { MoveStageProvider, useMoveStage } from './StageContext';
import { PokemonStage } from './PokemonStage';

const calls = vi.hoisted(() => ({
  disposed: [] as string[],
  rendererDisposed: 0,
  contextLossForced: 0,
  rendered: 0,
  created: { points: 0, pointsMaterial: 0, shader: 0 },
  failRenderer: false,
  bodyRotationY: 0,
}));

vi.mock('three', () => {
  const tracked = (name: string) =>
    class {
      dispose() { calls.disposed.push(name); }
    };
  class Vec { x = 0; y = 0; z = 0; set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } setScalar(v: number) { this.x = this.y = this.z = v; } }
  class Mesh {
    rotation = { x: 0, y: 0, z: 0 };
    position = new Vec();
    scale = new Vec();
    visible = true;
    constructor(public geometry: unknown, public material: unknown) {}
  }
  class Points extends Mesh { frustumCulled = true; constructor(g: unknown, m: unknown) { super(g, m); calls.created.points++; } }
  class Scene { add() {} remove() {} clear() {} }
  class WebGLRenderer {
    constructor() { if (calls.failRenderer) throw new Error('Error creating WebGL context.'); }
    setPixelRatio() {}
    setClearColor() {}
    setSize() {}
    render() { calls.rendered++; }
    dispose() { calls.rendererDisposed++; }
    forceContextLoss() { calls.contextLossForced++; }
  }
  class PerspectiveCamera { position = new Vec(); aspect = 1; updateProjectionMatrix() {} }
  class TextureLoader {
    setCrossOrigin() {}
    async loadAsync() { return { colorSpace: '', dispose: () => calls.disposed.push('texture') }; }
  }
  class BufferAttribute {}
  class BufferGeometry extends tracked('particleGeometry') { setAttribute() {} attributes = { position: { needsUpdate: false }, aSize: { needsUpdate: false }, aAlpha: { needsUpdate: false }, aRot: { needsUpdate: false }, aColor: { needsUpdate: false } }; }
  return {
    WebGLRenderer, Scene, PerspectiveCamera, Mesh, Points, TextureLoader, BufferAttribute, BufferGeometry,
    PlaneGeometry: tracked('plane'), CircleGeometry: tracked('circle'), TorusGeometry: tracked('torus'),
    MeshBasicMaterial: class extends tracked('material') { color = { set() {}, copy() {}, clone() { return {}; }, setScalar() {} }; opacity = 0.55; },
    PointsMaterial: class extends tracked('pointsMaterial') { opacity = 0; constructor() { super(); calls.created.pointsMaterial++; } },
    ShaderMaterial: class extends tracked('shaderMaterial') { constructor() { super(); calls.created.shader++; } },
    RingGeometry: tracked('ring'), Group: class {},
    CanvasTexture: tracked('shapeTexture'), AdditiveBlending: 2, LinearFilter: 1006,
    SRGBColorSpace: 'srgb', DoubleSide: 2,
  };
});

const props = { imageUrl: 'https://art/6.png', name: 'Charizard', accentToken: '--type-fire' };

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  calls.disposed.length = 0;
  calls.rendererDisposed = 0;
  calls.contextLossForced = 0;
  calls.rendered = 0;
  calls.created.points = 0;
  calls.created.pointsMaterial = 0;
  calls.created.shader = 0;
  calls.failRenderer = false;
  mockMatchMedia(false);
});
afterEach(() => vi.restoreAllMocks());

describe('PokemonStage (CA10)', () => {
  it('sem WebGL cai para a imagem estática', async () => {
    calls.failRenderer = true;
    render(<PokemonStage {...props} />);
    await waitFor(() => expect(document.querySelector('[data-status="fallback"]')).toBeInTheDocument());
    expect(screen.getByAltText('Charizard')).toBeInTheDocument();
    expect(screen.getByLabelText(/Charizard\. Arraste/)).toHaveAttribute('aria-hidden', 'true');
  });

  it('com WebGL mostra o canvas interativo e esconde a imagem', async () => {
    render(<PokemonStage {...props} />);
    await waitFor(() => expect(document.querySelector('[data-status="ready"]')).toBeInTheDocument());
    expect(screen.queryByAltText('Charizard')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Arraste ou use as setas/ })).toHaveAttribute('tabindex', '0');
    expect(calls.rendered).toBeGreaterThan(0);
  });

  it('libera geometrias, materiais, textura e renderer ao desmontar', async () => {
    const { unmount } = render(<PokemonStage {...props} />);
    await waitFor(() => expect(document.querySelector('[data-status="ready"]')).toBeInTheDocument());
    unmount();
    expect(calls.disposed).toEqual(expect.arrayContaining(['texture', 'plane', 'circle', 'torus', 'particleGeometry', 'material', 'pointsMaterial']));
    expect(calls.rendererDisposed).toBe(1);
    expect(calls.contextLossForced).toBe(1);
  });

  it('desmontar antes de carregar não vaza o renderer', async () => {
    const { unmount } = render(<PokemonStage {...props} />);
    unmount();
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    expect(calls.rendererDisposed).toBe(calls.contextLossForced);
  });

  it('responde ao teclado e ao toque sem erro', async () => {
    render(<PokemonStage {...props} />);
    await waitFor(() => expect(document.querySelector('[data-status="ready"]')).toBeInTheDocument());
    const canvas = screen.getByRole('img', { name: /Arraste ou use as setas/ });
    const before = calls.rendered;
    fireEvent.keyDown(canvas, { key: 'ArrowRight' });
    fireEvent.keyDown(canvas, { key: 'Enter' });
    fireEvent.pointerDown(canvas, { clientX: 10, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 10, pointerId: 1 });
    await waitFor(() => expect(calls.rendered).toBeGreaterThan(before));
  });

  it('prefers-reduced-motion: não mantém animação contínua em repouso', async () => {
    mockMatchMedia(true);
    let rafCalls = 0;
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => { rafCalls++; return 1; });
    render(<PokemonStage {...props} />);
    await waitFor(() => expect(document.querySelector('[data-status="ready"]')).toBeInTheDocument());
    expect(rafCalls).toBe(0);
    raf.mockRestore();
  });
});

function PlayButton({ label = 'tocar', category = 'special' as const }) {
  const stage = useMoveStage();
  return <button onClick={() => stage.playMove('fire', category)}>{label}</button>;
}

const withBridge = (ui: React.ReactNode) => render(<MoveStageProvider>{ui}</MoveStageProvider>);
const ready = () => waitFor(() => expect(document.querySelector('[data-status="ready"]')).toBeInTheDocument());
const disposedCount = (name: string) => calls.disposed.filter((d) => d === name).length;

describe('animação de golpe', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.HTMLCanvasElement.prototype.getContext = (() => null) as never;
  });

  it('A1: tocar o golpe cria o efeito no palco (e tocar de novo cria outro)', async () => {
    withBridge(<><PokemonStage {...props} /><PlayButton /></>);
    await ready();
    const base = calls.created.points; // partículas de fundo
    fireEvent.click(screen.getByText('tocar'));
    expect(calls.created.points).toBe(base + 1);
    fireEvent.click(screen.getByText('tocar'));
    expect(calls.created.points).toBe(base + 2);
  });

  it('A4: nova animação cancela e libera a anterior; desmontar libera tudo', async () => {
    const { unmount } = withBridge(<><PokemonStage {...props} /><PlayButton /></>);
    await ready();
    fireEvent.click(screen.getByText('tocar'));
    const before = disposedCount('shaderMaterial');
    fireEvent.click(screen.getByText('tocar'));
    expect(disposedCount('shaderMaterial')).toBe(before + 1);
    unmount();
    expect(calls.created.shader).toBe(2);
    expect(disposedCount('shaderMaterial')).toBe(calls.created.shader);
    expect(disposedCount('particleGeometry')).toBe(calls.created.points);
  });

  it('A5: com prefers-reduced-motion não há projétil nem partículas', async () => {
    mockMatchMedia(true);
    withBridge(<><PokemonStage {...props} /><PlayButton /></>);
    await ready();
    const base = calls.created.points;
    fireEvent.click(screen.getByText('tocar'));
    expect(calls.created.points).toBe(base);
  });

  it('A6: sem WebGL, tocar o golpe não gera erro', async () => {
    calls.failRenderer = true;
    withBridge(<><PokemonStage {...props} /><PlayButton /></>);
    await waitFor(() => expect(document.querySelector('[data-status="fallback"]')).toBeInTheDocument());
    expect(() => fireEvent.click(screen.getByText('tocar'))).not.toThrow();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('A7: palco fora da tela (retrato) rola até ele e toca; visível (landscape) não rola', async () => {
    withBridge(<><PokemonStage {...props} /><PlayButton /></>);
    await ready();
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');

    rect.mockReturnValue({ top: -600, bottom: -300, left: 0, right: 300, width: 300, height: 300, x: 0, y: -600, toJSON() {} });
    const base = calls.created.points;
    fireEvent.click(screen.getByText('tocar'));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(calls.created.points).toBe(base); // espera a rolagem terminar
    await waitFor(() => expect(calls.created.points).toBe(base + 1));

    rect.mockReturnValue({ top: 20, bottom: 320, left: 0, right: 300, width: 300, height: 300, x: 0, y: 20, toJSON() {} });
    fireEvent.click(screen.getByText('tocar'));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(calls.created.points).toBe(base + 2);
  });
});
