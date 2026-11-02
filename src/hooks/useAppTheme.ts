import { useColorMode } from '@chakra-ui/react';
import { useState } from 'react';

import Repository from '@/lib/Repository';

export type ColorPreference = 'light' | 'dark' | 'system';

export type Palette = 'classic' | 'neon' | 'blood' | 'casino';

export const PALETTES: { id: Palette; label: string }[] = [
  { id: 'classic', label: 'Clássico' },
  { id: 'neon', label: 'Neon' },
  { id: 'blood', label: 'Sangue' },
  { id: 'casino', label: 'Cassino' },
];

// O script inline de index.html lê as mesmas chaves para evitar flash de tema.
export const PALETTE_KEY = '@CARDS_AGAINST_HUMANITY/PALETTE';
export const COLOR_MODE_KEY = 'chakra-ui-color-mode';

function readColorPreference(): ColorPreference {
  try {
    return (
      (localStorage.getItem(COLOR_MODE_KEY) as ColorPreference) || 'system'
    );
  } catch {
    return 'system';
  }
}

export function useAppTheme() {
  const { setColorMode } = useColorMode();

  const [colorPreference, setColorPreference] =
    useState<ColorPreference>(readColorPreference);

  const [palette, setPaletteState] = useState<Palette>(
    () => Repository.get<Palette>(PALETTE_KEY) || 'classic'
  );

  function changeColorPreference(preference: ColorPreference): void {
    setColorPreference(preference);
    setColorMode(preference);
  }

  function changePalette(newPalette: Palette): void {
    setPaletteState(newPalette);
    Repository.save(PALETTE_KEY, newPalette);
    document.documentElement.dataset.palette = newPalette;
  }

  return { colorPreference, changeColorPreference, palette, changePalette };
}
