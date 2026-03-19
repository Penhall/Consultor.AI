export type SkinId = 'corporate' | 'noturno' | 'moderno' | 'classico';

export const VALID_SKIN_IDS: SkinId[] = ['corporate', 'noturno', 'moderno', 'classico'];

export interface SkinMeta {
  id: SkinId;
  name: string;
  description: string;
  icon: string;
  /** Cor de preview para o mini-card nas configurações */
  previewBg: string;
  previewPrimary: string;
}

export function isValidSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && (VALID_SKIN_IDS as string[]).includes(value);
}
