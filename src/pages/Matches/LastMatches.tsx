import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';

import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';

import { FaSearch } from 'react-icons/fa';
import { RxCardStackPlus } from 'react-icons/rx';

import { FinishMatchButton } from '@/components/finish-match-button';
import { PlayerAvatar } from '@/components/player-avatar';
import { getErrorMessage } from '@/utils/get-error-message';
import { getUserName } from '@/utils/get-user-name';

interface LastMatchesProps {
  matches: MatchConvertedType[];
  onMatchesChange: (matches: MatchConvertedType[]) => void;
}

export function LastMatches({
  matches,
  onMatchesChange,
}: LastMatchesProps): JSX.Element {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [creatingMatch, startCreate, stopCreate] = useBoolean(false);

  async function handleNewMatch() {
    try {
      startCreate();

      const id = await newMatch(user.uid);

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível criar a partida.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      stopCreate();
    }
  }

  return (
    <Flex flexDir="column">
      {matches.length === 0 ? (
        <Center flexDir="column" gap="4" minH="60vh">
          <Icon as={FaSearch} fontSize="4xl" />

          <Box textAlign="center">
            <Heading as="h1" fontSize="2xl">
              Nenhuma partida pública no momento
            </Heading>

            <Text color="app.muted">Crie uma agora e chame seus amigos.</Text>
          </Box>

          <Button isLoading={creatingMatch} onClick={handleNewMatch}>
            Criar partida
          </Button>
        </Center>
      ) : (
        <>
          <Heading as="h1" fontSize="2xl" mb="6">
            Partidas públicas
          </Heading>

          <SimpleGrid w="full" spacing={4} minChildWidth="260px">
            {matches.map(({ id, owner, rounds }) => (
              <Card
                key={id}
                bg="app.surface"
                color="app.text"
                p="4"
                rounded="md"
                border="1px"
                borderColor="app.border"
              >
                <Flex mb="4" gap="2" align="center">
                  <PlayerAvatar user={owner} />

                  <Box minW="0">
                    <Text fontWeight="bold" noOfLines={1}>
                      Anfitrião: {getUserName(owner)}
                    </Text>

                    <Text color="app.muted" fontSize="sm">
                      {rounds === 0
                        ? 'Na sala de espera'
                        : `Rodadas: ${rounds}`}
                    </Text>
                  </Box>
                </Flex>

                <Flex flexDir="column" gap="2" justify="end" flex="1">
                  <Button
                    leftIcon={
                      <Icon as={RxCardStackPlus} transform="auto" rotate="90" />
                    }
                    as={Link}
                    to={`/match/${id}`}
                    w="full"
                  >
                    Entrar na partida
                  </Button>

                  {owner.uid === user.uid && (
                    <FinishMatchButton
                      matchId={id}
                      afterFinish={(finishedId) => {
                        onMatchesChange(
                          matches.filter((match) => match.id !== finishedId)
                        );
                      }}
                    />
                  )}
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Flex>
  );
}
