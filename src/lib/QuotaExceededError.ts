export class QuotaExceededError extends Error {
  // Mesmo código dos erros do Firestore para reaproveitar o tratamento
  // existente em getErrorMessage.
  code = 'resource-exhausted';

  constructor() {
    super(
      'O limite diário de uso do servidor foi atingido. Tente novamente mais tarde.'
    );

    this.name = 'QuotaExceededError';
  }
}
