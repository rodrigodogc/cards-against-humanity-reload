import { extendTheme } from '@chakra-ui/react';

import { Button } from './components/button';
import { Input, Select } from './components/input';
import { thinScrollbar } from './tokens';

function sameInBothModes(value: string) {
  return { _light: value, _dark: value };
}

export const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: false,
  },

  colors: {
    app: {
      bg: 'var(--app-bg)',
      surface: 'var(--app-surface)',
      text: 'var(--app-text)',
      muted: 'var(--app-muted)',
      accent: 'var(--app-accent)',
      onAccent: 'var(--app-on-accent)',
      border: 'var(--app-border)',
      shadow: 'var(--app-shadow)',
    },
  },

  semanticTokens: {
    colors: {
      'chakra-body-bg': sameInBothModes('var(--app-bg)'),
      'chakra-body-text': sameInBothModes('var(--app-text)'),
      'chakra-border-color': sameInBothModes('var(--app-border)'),
      'chakra-subtle-bg': sameInBothModes('var(--app-surface)'),
      'chakra-subtle-text': sameInBothModes('var(--app-muted)'),
      'chakra-placeholder-color': sameInBothModes('var(--app-muted)'),
    },
  },

  components: {
    Button,
    Input,
    Select,
  },

  styles: {
    global: {
      '*': {
        ...thinScrollbar,
      },

      html: {
        scrollBehavior: 'smooth',
      },

      body: {
        overflowX: 'hidden',
      },
    },
  },
});
