import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useColorMode,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaPalette } from 'react-icons/fa';

import {
  ColorPreference,
  COLOR_MODE_KEY,
  Palette,
  PALETTES,
  useAppTheme,
} from '@/hooks/useAppTheme';

export function ThemeMenu(): JSX.Element {
  const { colorPreference, changeColorPreference, palette, changePalette } =
    useAppTheme();

  return (
    <Menu closeOnSelect={false} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Mudar tema"
        icon={<Icon as={FaPalette} />}
        variant="defaultOutlined"
      />

      <MenuList zIndex="popover">
        <MenuOptionGroup
          title="Aparência"
          type="radio"
          value={colorPreference}
          onChange={(value) => changeColorPreference(value as ColorPreference)}
        >
          <MenuItemOption value="system">Automático</MenuItemOption>
          <MenuItemOption value="light">Claro</MenuItemOption>
          <MenuItemOption value="dark">Escuro</MenuItemOption>
        </MenuOptionGroup>

        <MenuDivider />

        <MenuOptionGroup
          title="Tema"
          type="radio"
          value={palette}
          onChange={(value) => changePalette(value as Palette)}
        >
          {PALETTES.map(({ id, label }) => (
            <MenuItemOption key={id} value={id}>
              {label}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}

/**
 * Mantém o tema em dia com o sistema (no modo automático) e a cor da barra do
 * navegador em dia com o tema.
 */
export function ThemeSync(): null {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function handleSystemChange(): void {
      let preference: string | null = null;

      try {
        preference = localStorage.getItem(COLOR_MODE_KEY);
      } catch {
        // Sem localStorage, o tema segue o sistema.
      }

      if (!preference || preference === 'system') {
        setColorMode('system');
      }
    }

    media.addEventListener('change', handleSystemChange);

    return () => media.removeEventListener('change', handleSystemChange);
  }, [setColorMode]);

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');

    function updateThemeColor(): void {
      const color = getComputedStyle(root).getPropertyValue('--app-bg').trim();

      meta?.setAttribute('content', color);
    }

    updateThemeColor();

    const observer = new MutationObserver(updateThemeColor);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-palette'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
