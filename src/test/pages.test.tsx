import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PokemonDataUnavailableError, PokemonNotFoundError } from '@/domain';
import { charizardDetail } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn(), notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }) }));

vi.mock('@/main/container', () => ({ useCases: { listPokemon: mocks.list, getPokemonDetail: mocks.detail } }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));

import Home from '../../app/page';
import PokemonPage from '../../app/pokemon/[id]/page';

describe('páginas (CA12)', () => {
  it('lista: erro da API mostra mensagem de erro, não quebra', async () => {
    mocks.list.mockRejectedValue(new PokemonDataUnavailableError());
    render(await Home());
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar a lista');
  });

  it('lista: sucesso renderiza o navegador de Pokémon', async () => {
    mocks.list.mockResolvedValue([{ id: 1, name: 'bulbasaur', types: ['grass'] }]);
    render(await Home());
    expect(screen.getByText('1 de 1 Pokémon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pokédex' })).toBeInTheDocument();
  });

  it('detalhe: erro da API mostra mensagem', async () => {
    mocks.detail.mockRejectedValue(new PokemonDataUnavailableError());
    render(await PokemonPage({ params: Promise.resolve({ id: '6' }) }));
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar este Pokémon');
  });

  it('detalhe: id inexistente ou inválido chama notFound', async () => {
    mocks.detail.mockRejectedValue(new PokemonNotFoundError(99999));
    await expect(PokemonPage({ params: Promise.resolve({ id: '99999' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(PokemonPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('detalhe: sucesso renderiza o Pokémon', async () => {
    mocks.detail.mockResolvedValue(charizardDetail);
    render(await PokemonPage({ params: Promise.resolve({ id: '6' }) }));
    expect(screen.getByRole('heading', { name: 'Charizard' })).toBeInTheDocument();
  });
});
