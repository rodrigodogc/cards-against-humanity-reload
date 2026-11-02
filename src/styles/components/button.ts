import { ComponentStyleConfig } from '@chakra-ui/react';

const shine = {
  content: '""',
  height: '155px',
  left: '-75px',
  opacity: '.2',
  position: 'absolute',
  top: '-50px',
  transform: 'rotate(35deg)',
  transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
  width: '50px',
  pointerEvents: 'none',
};

const hoverShine = {
  // O brilho só faz sentido com mouse; no toque ele ficaria preso após o clique.
  '@media (hover: hover)': {
    _after: {
      left: '120%',
      transition: 'all 2s cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
};

const pressed = {
  boxShadow: 'none !important',
  pos: 'relative',
  top: '.2em',
};

export const Button: ComponentStyleConfig = {
  baseStyle: {
    textTransform: 'uppercase',
  },

  defaultProps: {
    variant: 'default',
  },

  variants: {
    default: {
      bg: 'app.accent',
      color: 'app.onAccent',
      boxShadow: '0 .2em var(--app-shadow) !important',
      position: 'relative',
      overflow: 'hidden',

      _after: { ...shine, background: 'var(--app-on-accent)' },

      _hover: {
        ...hoverShine,

        _disabled: {
          bg: 'app.accent',
          color: 'app.onAccent',
        },
      },

      _active: pressed,
    },

    defaultOutlined: {
      bg: 'transparent',
      border: '1px',
      borderColor: 'app.border',
      color: 'app.text',
      boxShadow: '0 .2em var(--app-border) !important',
      position: 'relative',
      overflow: 'hidden',

      _after: { ...shine, background: 'var(--app-muted)' },

      _hover: hoverShine,

      _active: pressed,
    },
  },
};
