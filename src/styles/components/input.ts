import { ComponentStyleConfig } from '@chakra-ui/react';

const outlineField = {
  bg: 'app.bg',
  borderColor: 'app.border',

  _hover: {
    borderColor: 'app.text',
  },

  _focusVisible: {
    borderColor: 'app.accent',
    boxShadow: '0 0 0 1px var(--app-accent)',
  },
};

export const Input: ComponentStyleConfig = {
  variants: {
    outline: {
      field: outlineField,
    },
  },
};

export const Select: ComponentStyleConfig = {
  variants: {
    outline: {
      field: outlineField,
    },
  },
};
