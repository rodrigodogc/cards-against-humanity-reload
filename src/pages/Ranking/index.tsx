import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaTrophy } from 'react-icons/fa';

import { GoBack } from '@/components/GoBack';
import { PlayerAvatar } from '@/components/player-avatar';
import { SomeLoading } from '@/components/SomeLoading';
import { useAuth } from '@/contexts/AuthContext';
import { getRanking } from '@/services/users';
import { getErrorMessage } from '@/utils/get-error-message';
import { getUserName } from '@/utils/get-user-name';

const PODIUM_COLORS = ['yellow.500', 'gray.400', 'orange.400'];

export function Ranking(): JSX.Element {
  const { user } = useAuth();
  const toast = useToast();

  const [players, setPlayers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRanking(): Promise<void> {
      try {
        setPlayers(await getRanking());
      } catch (error) {
        console.error('error', error);

        toast({
          title: 'Aconteceu um erro',
          description: getErrorMessage(
            error,
            'Não foi possível carregar o ranking.'
          ),
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadRanking();
  }, [toast]);

  return (
    <Container as="main" maxW="640px" py="4">
      <SomeLoading loading={isLoading} message="Carregando ranking..." />

      <Box mb="6">
        <GoBack toHome />
      </Box>

      <Heading as="h1" fontSize="2xl">
        Ranking
      </Heading>

      <Text color="app.muted" mb="6">
        Os 50 jogadores com mais partidas vencidas.
      </Text>

      {!isLoading && players.length === 0 && (
        <Center flexDir="column" gap="2" minH="40vh" textAlign="center">
          <Icon as={FaTrophy} fontSize="4xl" />
          <Text>Ninguém venceu uma partida ainda. A vaga é sua.</Text>
        </Center>
      )}

      <Flex as="ol" direction="column" gap="2" listStyleType="none">
        {players.map((player, index) => {
          const isMe = player.uid === user.uid;

          return (
            <Flex
              as="li"
              key={player.uid}
              align="center"
              gap="3"
              p="3"
              rounded="md"
              bg="app.surface"
              border={isMe ? '2px' : '0'}
              borderColor="app.accent"
            >
              <Center w="8" fontWeight="bold" flexShrink={0}>
                {index < PODIUM_COLORS.length ? (
                  <Icon
                    as={FaTrophy}
                    color={PODIUM_COLORS[index]}
                    aria-label={`${index + 1}º lugar`}
                  />
                ) : (
                  `${index + 1}º`
                )}
              </Center>

              <PlayerAvatar user={player} size="sm" />

              <Text fontWeight="bold" flex="1" minW="0" noOfLines={1}>
                {getUserName(player)}
                {isMe && ' (você)'}
              </Text>

              <Text whiteSpace="nowrap">
                {player.wins} {player.wins === 1 ? 'vitória' : 'vitórias'}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Container>
  );
}
