export function getErrorMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  defaultMessage = 'Aconteceu um erro'
) {
  if (error?.code === 'resource-exhausted') {
    return 'O limite diário do servidor foi atingido. Tente novamente mais tarde.';
  }

  // Mensagens do Firebase vêm em inglês e não ajudam quem está jogando.
  return defaultMessage;
}
