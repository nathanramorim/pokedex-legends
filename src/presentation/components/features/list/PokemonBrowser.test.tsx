import { fireEvent, render, screen, within } from '@testing-library/react';
import type { PokemonListItem } from '@/application';
import type { PokemonType } from '@/domain';
import { PokemonBrowser } from './PokemonBrowser';

const TYPES: PokemonType[] = ['fire', 'water', 'grass'];
const items: PokemonListItem[] = Array.from({ length: 1025 }, (_, i) => ({
  id: i + 1,
  name: `mon-${i + 1}`,
  types: [TYPES[i % 3]],
}));

const renderBrowser = () => render(<PokemonBrowser items={items} artworkBaseUrl="https://art" />);

describe('PokemonBrowser', () => {
  it('CA1: informa o total completo de Pokémon', () => {
    renderBrowser();
    expect(screen.getByText('1025 de 1025 Pokémon')).toBeInTheDocument();
  });

  it('CA3: mantém poucos cards no DOM mesmo com a lista completa', () => {
    renderBrowser();
    const cards = within(screen.getByTestId('pokemon-grid')).getAllByRole('link');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(60);
  });

  it('CA2: filtra por tipo com botões de ícone e permite limpar', () => {
    renderBrowser();
    const fire = screen.getByRole('button', { name: 'Fogo' });
    fireEvent.click(fire);
    expect(fire).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('342 de 1025 Pokémon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByText('1025 de 1025 Pokémon')).toBeInTheDocument();
  });

  it('CA2: combina geração e busca; mostra estado vazio', () => {
    renderBrowser();
    fireEvent.click(screen.getByRole('button', { name: /1ª Kanto/ }));
    expect(screen.getByText('151 de 1025 Pokémon')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
    expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
  });
});
