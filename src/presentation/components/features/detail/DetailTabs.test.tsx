import { fireEvent, render, screen, within } from '@testing-library/react';
import type { EvolutionDetail, EvolutionNode } from '@/domain';
import { describeEvolution } from '@/presentation/format';
import { charizardDetail } from '@/test/fixtures';
import { PokemonDetailView } from './PokemonDetailView';

const none: EvolutionDetail = {
  trigger: 'level-up', minLevel: null, item: null, heldItem: null, knownMove: null, location: null, minHappiness: null, timeOfDay: null,
};
const node = (id: number, name: string, details: EvolutionDetail[] = [], evolvesTo: EvolutionNode[] = []): EvolutionNode => ({
  id, name, artworkUrl: `https://art/${id}.png`, details, evolvesTo,
});

const open = (detail = charizardDetail, tab?: string) => {
  render(<PokemonDetailView detail={detail} itemIconBaseUrl="https://items" />);
  if (tab) fireEvent.click(screen.getByRole('tab', { name: tab }));
};

describe('abas do detalhe', () => {
  it('CA4: tem as 8 abas (7 do discovery + Golpes)', () => {
    open();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Sobre', 'Habilidades', 'Golpes', 'Evoluções', 'Combate', 'Mega', 'Itens', 'Captura',
    ]);
  });

  it('CA5: Combate mostra 4× Pedra para Charizard', () => {
    open(charizardDetail, 'Combate');
    const weak = screen.getByRole('region', { name: 'Vulnerável contra' });
    expect(within(weak).getByText('Pedra').parentElement).toHaveTextContent('4×');
    expect(within(screen.getByRole('region', { name: 'Imune a' })).getByText('Terra')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Efetivo contra' })).getByText('Planta')).toBeInTheDocument();
  });

  it('CA6: Evoluções ramificadas (Eevee)', () => {
    const eevee = node(133, 'eevee', [], [
      node(134, 'vaporeon', [{ ...none, trigger: 'use-item', item: 'water-stone' }]),
      node(135, 'jolteon', [{ ...none, trigger: 'use-item', item: 'thunder-stone' }]),
      node(196, 'espeon', [{ ...none, minHappiness: 220, timeOfDay: 'day' }]),
    ]);
    open({ ...charizardDetail, evolution: eevee }, 'Evoluções');
    const list = screen.getByRole('list', { name: 'Linha evolutiva' });
    expect(within(list).getByText('Vaporeon')).toBeInTheDocument();
    expect(within(list).getByText('Jolteon')).toBeInTheDocument();
    expect(within(list).getByText('Espeon')).toBeInTheDocument();
    expect(within(list).getByText(/Usar Water Stone/)).toBeInTheDocument();
  });

  it('CA6: sem linha evolutiva mostra estado vazio', () => {
    open(charizardDetail, 'Evoluções');
    expect(screen.getByText('Não evolui')).toBeInTheDocument();
  });

  it('CA7: Mega mostra formas ou estado vazio', () => {
    open(charizardDetail, 'Mega');
    expect(screen.getByText('Sem Mega Evolução')).toBeInTheDocument();
  });

  it('CA7: Mega lista as formas Mega', () => {
    const detail = {
      ...charizardDetail,
      megaForms: [
        { name: 'charizard-mega-x', label: 'Mega Charizard X', artworkUrl: 'https://art/1.png', types: ['fire' as const, 'dragon' as const] },
        { name: 'charizard-mega-y', label: 'Mega Charizard Y', artworkUrl: 'https://art/2.png', types: ['fire' as const, 'flying' as const] },
      ],
    };
    open(detail, 'Mega');
    expect(screen.getByText('Mega Charizard X')).toBeInTheDocument();
    expect(screen.getByText('Mega Charizard Y')).toBeInTheDocument();
  });

  it('Captura: recomenda pokébola com motivo e taxa', () => {
    open(charizardDetail, 'Captura');
    expect(screen.getByText('Great Ball')).toBeInTheDocument();
    expect(screen.getByText('45/255')).toBeInTheDocument();
    expect(screen.getByText(/Captura difícil/)).toBeInTheDocument();
  });

  it('Captura: lendário não recebe Poké Ball comum', () => {
    const detail = { ...charizardDetail, species: { ...charizardDetail.species, isLegendary: true, captureRate: 3 } };
    open(detail, 'Captura');
    expect(screen.queryByText('Poké Ball')).not.toBeInTheDocument();
    expect(screen.getByText('Ultra Ball')).toBeInTheDocument();
  });
});

describe('aba Golpes', () => {
  it('mostra ícone do tipo, categoria, poder, precisão e PP', () => {
    open(charizardDetail, 'Golpes');
    const list = screen.getByRole('list', { name: 'Golpes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getByRole('img', { name: 'Tipo Fogo' })).toBeInTheDocument();
    const ember = within(list).getByText('Ember').closest('li') as HTMLElement;
    expect(ember).toHaveTextContent('Nv. 7');
    expect(ember).toHaveTextContent('Especial');
    expect(ember).toHaveTextContent('Poder 40');
    const dance = within(list).getByText('Dragon Dance').closest('li') as HTMLElement;
    expect(dance).toHaveTextContent('Status');
    expect(dance).toHaveTextContent('Poder —');
  });

  it('sem golpes mostra estado vazio', () => {
    open({ ...charizardDetail, moves: [] }, 'Golpes');
    expect(screen.getByText('Sem golpes')).toBeInTheDocument();
  });

  it('M1: selecionar mostra o efeito, trocar muda e selecionar de novo fecha', () => {
    open(charizardDetail, 'Golpes');
    const ember = screen.getByRole('button', { name: /Ember/ });
    const scratch = screen.getByRole('button', { name: /Scratch/ });
    expect(screen.queryByRole('region', { name: /Efeito de/ })).not.toBeInTheDocument();

    fireEvent.click(ember);
    expect(screen.getByRole('region', { name: 'Efeito de Ember' })).toHaveTextContent('Has a 10% chance to burn the target.');

    fireEvent.click(scratch);
    expect(screen.queryByRole('region', { name: 'Efeito de Ember' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Efeito de Scratch' })).toHaveTextContent('regular damage');

    fireEvent.click(scratch);
    expect(screen.queryByRole('region', { name: /Efeito de/ })).not.toBeInTheDocument();
  });

  it('M2/M3: golpe sem texto, alvo e prioridade em português, chance só quando existe', () => {
    open(charizardDetail, 'Golpes');
    fireEvent.click(screen.getByRole('button', { name: /Dragon Dance/ }));
    const panel = screen.getByRole('region', { name: 'Efeito de Dragon Dance' });
    expect(panel).toHaveTextContent('Sem descrição disponível.');
    expect(panel).toHaveTextContent('O próprio usuário');
    expect(panel).toHaveTextContent('+1');
    expect(panel).not.toHaveTextContent('Chance do efeito');

    fireEvent.click(screen.getByRole('button', { name: /Ember/ }));
    const ember = screen.getByRole('region', { name: 'Efeito de Ember' });
    expect(ember).toHaveTextContent('Um oponente');
    expect(ember).toHaveTextContent('Normal');
    expect(ember).toHaveTextContent('10%');
  });

  it('M4: botão expõe aria-expanded e aria-controls e responde ao teclado', () => {
    open(charizardDetail, 'Golpes');
    const ember = screen.getByRole('button', { name: /Ember/ });
    expect(ember).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(ember);
    expect(ember).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(ember.getAttribute('aria-controls')!)).toBe(screen.getByRole('region', { name: 'Efeito de Ember' }));
    expect(ember.tagName).toBe('BUTTON');
  });
});

describe('describeEvolution', () => {
  it('descreve gatilhos comuns', () => {
    expect(describeEvolution([{ ...none, minLevel: 16 }])).toBe('Nível 16');
    expect(describeEvolution([{ ...none, trigger: 'trade' }])).toBe('Troca');
    expect(describeEvolution([{ ...none, trigger: 'trade', heldItem: 'metal-coat' }])).toBe('Troca segurando Metal Coat');
    expect(describeEvolution([{ ...none, minHappiness: 220, timeOfDay: 'night' }])).toBe('Amizade 220+ à noite');
    expect(describeEvolution([])).toBe('');
  });
});
