export const NICK_MIN_LENGTH = 2;
export const NICK_MAX_LENGTH = 16;

const ALLOWED_CHARACTERS = /^[\p{L}\p{N} _-]+$/u;

export function normalizeNick(nick: string): string {
  return nick.trim().replace(/\s+/g, ' ');
}

/** Devolve a mensagem de erro, ou `null` se o nick for válido. */
export function validateNick(nick: string): string | null {
  const normalized = normalizeNick(nick);

  if (normalized.length < NICK_MIN_LENGTH) {
    return `Use pelo menos ${NICK_MIN_LENGTH} caracteres.`;
  }

  if (normalized.length > NICK_MAX_LENGTH) {
    return `Use no máximo ${NICK_MAX_LENGTH} caracteres.`;
  }

  if (!ALLOWED_CHARACTERS.test(normalized)) {
    return 'Use apenas letras, números, espaço, _ e -.';
  }

  return null;
}
