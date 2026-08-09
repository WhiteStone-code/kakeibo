import type { ThemeId } from '../types';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  preview: [string, string, string]; // 3 colores de muestra para el selector
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'zen',
    name: 'Zen',
    emoji: '🍵',
    tagline: 'Matcha, tinta y calma. Disciplina japonesa.',
    preview: ['#7C9473', '#2B3A55', '#F4C9B8'],
  },
  {
    id: 'sakura',
    name: 'Sakura',
    emoji: '🌸',
    tagline: 'Rosa cerezo, dulce y kawaii.',
    preview: ['#F582AE', '#8093F1', '#FFD0EC'],
  },
  {
    id: 'neon',
    name: 'Neón',
    emoji: '⚡',
    tagline: 'Energía nocturna, vibrante y eléctrica.',
    preview: ['#FF2E9A', '#00E5FF', '#B6FF3C'],
  },
  {
    id: 'oceano',
    name: 'Océano',
    emoji: '🌊',
    tagline: 'Azules profundos, fresco y relajante.',
    preview: ['#0EA5C4', '#0B4F8A', '#7CE7E1'],
  },
  {
    id: 'bosque',
    name: 'Bosque',
    emoji: '🌲',
    tagline: 'Verdes y tierra, cálido y natural.',
    preview: ['#5B8C5A', '#8C5B3F', '#D9C27E'],
  },
];

export const getThemeMeta = (id: ThemeId) => THEMES.find((t) => t.id === id) ?? THEMES[0];
