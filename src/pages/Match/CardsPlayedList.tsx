import { CSSProperties } from 'react';

import { Card } from '@/components/Card';
import { PlayerAvatar } from '@/components/player-avatar';

import { getUserName } from '@/utils/get-user-name';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Text,
  useToast,
} from '@chakra-ui/react';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { setVoteToActiveRound } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { FaStar, FaVoteYea } from 'react-icons/fa';
import styles from './styles.module.scss';

interface CardsPlayedListProps {
  match: MatchConvertedType;
}

interface GroupedAnswersType {
  user: UserType;
  cards: CardType[];
}

export function CardsPlayedList({ match }: CardsPlayedListProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [isVoting, setTrueVoting, setFalseVoting] = useBoolean(false);

  const userAlreadyVoted = match?.actualRound?.usersWhoVoted?.find(
    (otherUser) => otherUser.user.uid === user?.uid
  );

  const groupedAnswers =
    match.actualRound?.answers.reduce<GroupedAnswersType[]>(
      (grouped, { card, user }) => {
        const groupFound = grouped.find((group) => group.user.uid === user.uid);

        if (groupFound) {
          groupFound.cards.push(card);
          return grouped;
        }

        return [...grouped, { user, cards: [card] }];
      },
      []
    ) || [];

  async function confirmVote(votedUser: string) {
    try {
      setTrueVoting();

      const data = {
        user: user.uid,
        votedUser,
      };

      await setVoteToActiveRound(match.id, data);
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível votar nesta carta.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      setFalseVoting();
    }
  }

  function renderAnswers(group: GroupedAnswersType): JSX.Element {
    const isMyGroup = group.user.uid === user?.uid;
    const showOwner = match.shouldShowCardOwner || isMyGroup;
    const votes =
      match.actualRound?.usersWhoVoted.filter(
        ({ votedUser }) => group.user.uid === votedUser.uid
      ) || [];

    return (
      <div
        key={group.user.uid}
        className={styles.answerGroup}
        data-cards={group.cards.length}
      >
        <Flex gap="2" align="center" minH="8">
          <PlayerAvatar
            size="sm"
            user={group.user}
            anonymous={!showOwner}
            flexShrink={0}
          />

          <Box minW="0">
            <Text fontWeight="bold" noOfLines={1}>
              {showOwner ? getUserName(group.user) : 'Anônimo'}
            </Text>

            {showOwner && (
              <Text fontSize="xs" color="app.muted">
                {match?.points.find((point) => point.userId === group.user.uid)
                  ?.value || 0}{' '}
                pts
              </Text>
            )}
          </Box>
        </Flex>

        <div
          className={styles.answerCards}
          style={{ '--cards': group.cards.length } as CSSProperties}
        >
          {group.cards.map((card) => (
            <Card
              key={card.id}
              {...card}
              className={styles.card}
              frontClassName={styles.cardFront}
              backClassName={styles.cardBack}
              messageClassName={styles.cardText}
            />
          ))}
        </div>

        <Center gap="1" flexWrap="wrap" minH="6">
          {votes.map(({ user: voter }) => (
            <Center key={voter.uid} bg="app.accent" w="6" h="6" rounded="full">
              <Icon as={FaStar} color="app.onAccent" fontSize="sm" />
            </Center>
          ))}
        </Center>

        {!isMyGroup && (
          <Button
            isLoading={isVoting}
            isDisabled={Boolean(userAlreadyVoted)}
            fontSize="xs"
            px="2"
            leftIcon={<Icon as={FaVoteYea} />}
            onClick={() => confirmVote(group.user.uid)}
          >
            {userAlreadyVoted
              ? `${
                  userAlreadyVoted.votedUser.uid === group.user.uid
                    ? 'Seu voto'
                    : 'Você já votou'
                }`
              : 'Votar nessa'}
          </Button>
        )}
      </div>
    );
  }

  const hasCardsPlayed = (match?.actualRound?.answers.length || 0) > 0;

  if (match.rounds === 0 || !hasCardsPlayed) {
    return null;
  }

  return (
    <Flex flexDir="column" w="full" gap="3" minW="0">
      <Heading as="h2" fontSize="xl" textAlign="center">
        Respostas
      </Heading>

      <div className={styles.answers}>{groupedAnswers.map(renderAnswers)}</div>
    </Flex>
  );
}
