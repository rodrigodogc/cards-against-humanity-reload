import { CSSProperties, useMemo, useState } from 'react';

import { Card } from '@/components/Card';
import { CARD_TOKEN } from '@/constants/globals';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { setAnswerToActiveRound } from '@/services/matches';
import { countString } from '@/utils/count-string';

import { Box, Button, Flex, Icon, Text, useToast } from '@chakra-ui/react';
import { FaCheck, FaCheckCircle } from 'react-icons/fa';
import { getErrorMessage } from '@/utils/get-error-message';

import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
  isFirstTime: boolean;
  newCardIds: Set<string>;
}

export function CardsToPlay({
  match,
  isFirstTime,
  newCardIds,
}: CardsToPlayProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [selectedCardsId, setSelectedCardsId] = useState<string[]>([]);
  const [sending, setTrueSending, setFalseSending] = useBoolean(false);

  const cardsPerPlayer = match.cardsPerPlayer || 4;

  const deck = useMemo(
    () =>
      match.actualRound?.decks
        .find((playerDeck) => playerDeck.user.uid === user.uid)
        ?.cards.slice(0, cardsPerPlayer) || [],
    [match, user, cardsPerPlayer]
  );

  const { question } = match.actualRound!;

  const totalOfPlays = countString(question.message, CARD_TOKEN) || 1;
  const missingCards = totalOfPlays - selectedCardsId.length;

  function selectCard(cardId: string): () => void {
    return () => {
      if (selectedCardsId.includes(cardId)) {
        const newSelectedCardsId = selectedCardsId.filter(
          (id) => cardId !== id
        );

        setSelectedCardsId(newSelectedCardsId);
        return;
      }

      if (selectedCardsId.length === totalOfPlays) {
        const [, ...otherCardsId] = selectedCardsId;

        setSelectedCardsId([...otherCardsId, cardId]);

        return;
      }

      setSelectedCardsId([...selectedCardsId, cardId]);
    };
  }

  async function confirmPlay(): Promise<void> {
    try {
      setTrueSending();

      const data = {
        user: user.uid,
        answers: selectedCardsId,
      };

      await setAnswerToActiveRound(match.id, data);

      setSelectedCardsId([]);
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível realizar a jogada.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      setFalseSending();
    }
  }

  const newCardOrder = deck
    .filter((card) => newCardIds.has(card.id))
    .map((card) => card.id);

  function renderCard(card: CardType): JSX.Element {
    const selectedIndex = selectedCardsId.indexOf(card.id);
    const isSelected = selectedIndex !== -1;
    const isNewCard = newCardIds.has(card.id);
    const newCardIndex = newCardOrder.indexOf(card.id);

    return (
      <Box
        key={card.id}
        className={styles.handItem}
        onClick={selectCard(card.id)}
      >
        {isSelected && (
          <span className={styles.selectionBadge}>
            {totalOfPlays > 1 ? selectedIndex + 1 : <Icon as={FaCheck} />}
          </span>
        )}

        <Card
          {...card}
          isPressed={isSelected}
          animationType={isNewCard ? 'auto' : 'off'}
          animationDelay={isNewCard ? `${newCardIndex * 150}ms` : '0ms'}
          className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
          frontClassName={styles.cardFront}
          backClassName={`${styles.cardBack} ${
            isSelected ? styles.isSelected : ''
          }`}
          messageClassName={styles.cardText}
        />
      </Box>
    );
  }

  if (match.rounds === 0) {
    return null;
  }

  if (deck.length === 0) {
    return (
      <Text textAlign="center" fontWeight="bold">
        {isFirstTime
          ? 'Você joga a partir da próxima rodada.'
          : 'Você recebe suas cartas na próxima rodada.'}
      </Text>
    );
  }

  return (
    <Flex w="full" flexDir="column" align="center">
      <div
        className={styles.hand}
        style={{ '--cards': deck.length } as CSSProperties}
      >
        {deck.map(renderCard)}
      </div>

      <div className={styles.actionBar}>
        <Button
          w="full"
          maxW="500px"
          leftIcon={<Icon as={FaCheckCircle} />}
          isLoading={sending}
          isDisabled={missingCards > 0}
          onClick={confirmPlay}
        >
          {missingCards > 0
            ? `Selecione ${missingCards} ${
                missingCards === 1 ? 'carta' : 'cartas'
              }`
            : 'Confirmar jogada'}
        </Button>
      </div>
    </Flex>
  );
}
