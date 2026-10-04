import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { PokemonStage } from './PokemonStage';

const calls = vi.hoisted(() => ({
  disposed: [] as string[],
  rendererDisposed: 0,
  contextLossForced: 0,
  rendered: 0,
  failRenderer: false,
  bodyRotationY: 0,
}));

vi.mock('three', () => {
  const tracked = (name: string) =>
    class {
      dispose() { calls.disposed.push(name); }
    };
  class Vec { x = 0; y = 0; z = 0; set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } }
  class Mesh {
    rotation = { x: 0, y: 0, z: 0 };
    position = new Vec();
    scale = new Vec();
    constructor(public geometry: unknown, public material: unknown) {}
  }
  class Points extends Mesh {}
  class Scene { add() {} clear() {} }
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
  class BufferGeometry extends tracked('particleGeometry') { setAttribute() {} }
  return {
    WebGLRenderer, Scene, PerspectiveCamera, Mesh, Points, TextureLoader, BufferAttribute, BufferGeometry,
    PlaneGeometry: tracked('plane'), CircleGeometry: tracked('circle'), TorusGeometry: tracked('torus'),
    MeshBasicMaterial: tracked('material'), PointsMaterial: tracked('pointsMaterial'),
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
