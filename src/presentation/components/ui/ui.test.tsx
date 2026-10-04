import { fireEvent, render, screen } from '@testing-library/react';
import { StatBar, StateMessage, Tabs, TypeBadge } from '.';

const items = [
  { id: 'a', label: 'Sobre', content: <p>conteúdo A</p> },
  { id: 'b', label: 'Combate', content: <p>conteúdo B</p> },
  { id: 'c', label: 'Mega', content: <p>conteúdo C</p> },
];

describe('Tabs', () => {
  it('expõe tablist/tab/tabpanel e mostra a primeira aba', () => {
    render(<Tabs items={items} ariaLabel="Detalhes" />);
    expect(screen.getByRole('tablist', { name: 'Detalhes' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('conteúdo A');
    expect(screen.getByRole('tab', { name: 'Sobre' })).toHaveAttribute('aria-selected', 'true');
  });

  it('troca de aba por clique', () => {
    render(<Tabs items={items} ariaLabel="Detalhes" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Combate' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('conteúdo B');
  });

  it('navega por setas, Home e End com tabindex móvel', () => {
    render(<Tabs items={items} ariaLabel="Detalhes" />);
    const first = screen.getByRole('tab', { name: 'Sobre' });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Combate' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Sobre' })).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Combate' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Mega' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Mega' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Sobre' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('StatBar', () => {
  it('expõe valor como meter acessível', () => {
    render(<StatBar label="hp" value={78} />);
    expect(screen.getByRole('meter', { name: 'hp' })).toHaveAttribute('aria-valuenow', '78');
  });
});

describe('StateMessage', () => {
  it('erro usa role alert; loading usa status', () => {
    const { rerender } = render(<StateMessage kind="error">falhou</StateMessage>);
    expect(screen.getByRole('alert')).toHaveTextContent('falhou');
    rerender(<StateMessage kind="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });
});

describe('TypeBadge', () => {
  it('traduz o tipo e mantém rótulo acessível no modo compacto', () => {
    render(<TypeBadge type="fire" compact />);
    expect(screen.getByText('Fogo')).toBeInTheDocument();
  });
});
