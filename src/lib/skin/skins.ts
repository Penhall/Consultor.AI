import type { SkinMeta } from './types';

export const SKINS: SkinMeta[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Profissional e confiável',
    icon: '🏢',
    previewBg: '#ffffff',
    previewPrimary: '#1e3a5f',
  },
  {
    id: 'noturno',
    name: 'Noturno',
    description: 'Modo escuro elegante',
    icon: '🌙',
    previewBg: '#060d1f',
    previewPrimary: '#9b72e8',
  },
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Clean e minimalista',
    icon: '⚡',
    previewBg: '#fafafa',
    previewPrimary: '#1a9e87',
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Tradicional e sóbrio',
    icon: '📜',
    previewBg: '#f7f4ee',
    previewPrimary: '#5e2d91',
  },
];

export const DEFAULT_SKIN_ID = 'corporate' as const;
