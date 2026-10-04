import { fireEvent, render, screen } from '@testing-library/react';
import { charizardDetail } from '@/test/fixtures';
import { PokemonDetailView } from './PokemonDetailView';

describe('PokemonDetailView', () => {
  it('mostra nome, número, tipos e a aba Sobre com status', () => {
    render(<PokemonDetailView detail={charizardDetail} itemIconBaseUrl="https://items" />);
    expect(screen.getByRole('heading', { name: 'Charizard' })).toBeInTheDocument();
    expect(screen.getByText('#0006')).toBeInTheDocument();
    expect(screen.getByText('Fogo')).toBeInTheDocument();
    expect(screen.getByText('Flame Pokémon')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'HP' })).toHaveAttribute('aria-valuenow', '78');
    expect(screen.getByRole('meter', { name: 'Total' })).toHaveAttribute('aria-valuenow', '534');
  });

  it('aba Habilidades marca a habilidade oculta', () => {
    render(<PokemonDetailView detail={charizardDetail} itemIconBaseUrl="https://items" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Habilidades' }));
    expect(screen.getByText('Blaze')).toBeInTheDocument();
    expect(screen.getByText('Oculta')).toBeInTheDocument();
    expect(screen.getByText(/Boosts Sp. Atk/)).toBeInTheDocument();
  });

  it('aba Itens mostra estado vazio quando não há itens', () => {
    render(<PokemonDetailView detail={charizardDetail} itemIconBaseUrl="https://items" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Itens' }));
    expect(screen.getByText('Sem itens')).toBeInTheDocument();
  });

  it('aba Itens lista itens com nome formatado', () => {
    const detail = { ...charizardDetail, pokemon: { ...charizardDetail.pokemon, heldItems: [{ name: 'oran-berry', iconUrl: 'https://i/oran-berry.png' }] } };
    render(<PokemonDetailView detail={detail} itemIconBaseUrl="https://items" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Itens' }));
    expect(screen.getByText('Oran Berry')).toBeInTheDocument();
  });
});
