// O baralho vai junto com o app, em um chunk próprio: cartas não gastam nenhuma
// leitura do Firestore. As partidas seguem guardando `DocumentReference`s de
// `cards`, mas só o `.id` delas é usado; a coleção em si não existe.
let DECK: Promise<Map<string, CardType>> | null = null;

function loadDeck(): Promise<Map<string, CardType>> {
  if (!DECK) {
    DECK = Promise.all([
      import('@/data/cards.json'),
      import('@/data/cards-extra.json'),
    ]).then(([original, extra]) => {
      const cards = [...original.default, ...extra.default] as CardType[];

      return new Map(cards.map((card) => [card.id, card]));
    });
  }

  return DECK;
}

export async function getCards(): Promise<CardType[]> {
  const deck = await loadDeck();

  return [...deck.values()];
}

export async function getCard(id: string): Promise<CardType> {
  const deck = await loadDeck();

  // Uma carta pode ser removida do JSON com partidas em andamento.
  return deck.get(id) || { id, type: 'WHITE', message: 'Carta indisponível.' };
}
