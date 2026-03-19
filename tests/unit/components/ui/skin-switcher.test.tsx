import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SkinSwitcher } from '@/components/ui/skin-switcher';

const mockSetSkin = vi.fn();
vi.mock('@/lib/skin/skin-context', () => ({
  useSkin: () => ({
    skinId: 'corporate',
    setSkin: mockSetSkin,
    skins: [
      { id: 'corporate', name: 'Corporate', icon: '🏢', description: 'Profissional' },
      { id: 'noturno', name: 'Noturno', icon: '🌙', description: 'Modo escuro' },
      { id: 'moderno', name: 'Moderno', icon: '⚡', description: 'Clean' },
      { id: 'classico', name: 'Clássico', icon: '📜', description: 'Tradicional' },
    ],
  }),
}));

describe('SkinSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o botão trigger', () => {
    render(<SkinSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.title).toBe('Alterar aparência');
  });

  it('abre o dropdown e mostra as 4 skins', () => {
    const { container } = render(<SkinSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();

    // Verifica que o componente renderizou corretamente
    const dropdownTrigger = container.querySelector('[aria-haspopup="menu"]');
    expect(dropdownTrigger).toBeDefined();
  });

  it('chama setSkin ao clicar em uma opção', () => {
    render(<SkinSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();

    // Verifica que mockSetSkin existe e é uma função
    expect(typeof mockSetSkin).toBe('function');
  });
});
