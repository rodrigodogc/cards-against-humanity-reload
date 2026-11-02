import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card } from '@/components/Card';
import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';
import { PlayerAvatar } from '@/components/player-avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  changeCardsPerPlayer,
  changeHideVotes,
  changeKeepCards,
  changePointsToWin,
  changeVisibility,
  finishMatch,
} from '@/services/matches';

import { ShowCardsOwnerButton } from '@/components/show-cards-owner-button';
import { fireworks } from '@/utils/fireworks';
import { getUserName } from '@/utils/get-user-name';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AvatarGroup,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Select,
  SimpleGrid,
  Tag,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaArrowRight, FaBars, FaFlag, FaHome, FaPlay } from 'react-icons/fa';
import { CardsPlayedList } from './CardsPlayedList';
import { CardsToPlay } from './CardsToPlay';
import { SettingsDrawer, SettingsDrawerHandles } from './SettingsDrawer';
import { MatchLinkInput } from './match-link-input';
import { Scoreboard } from './scoreboard';
import { useSetupMatch } from './useSetupMatch';

import styles from './styles.module.scss';

export function Match() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    isLoading,
    match,
    nextRound,
    loadingNext,
    isFirstTime,
    hasNewMessages,
    setHasNewMessases,
    newCardIds,
  } = useSetupMatch(id);

  const navigate = useNavigate();

  const menuRef = useRef<SettingsDrawerHandles>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const leaveCancelRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();

  const {
    isOpen: isLeaveOpen,
    onOpen: onLeaveOpen,
    onClose: onLeaveClose,
  } = useDisclosure();

  const round = match?.rounds || 0;
  const isOwner = match?.owner?.uid === user?.uid;

  const matchStarted = round > 0 && !isLoading && match;
  const hasWinner = match && match.winner;

  const userAlreadyPlayed = match?.actualRound?.usersWhoPlayed.find(
    (otherUser) => otherUser.user.uid === user?.uid
  );

  const userAlreadyVoted = match?.actualRound?.usersWhoVoted?.find(
    (otherUser) => otherUser.user.uid === user?.uid
  );

  // Só faz sentido esperar por quem recebeu cartas nesta rodada. Quem entrou
  // com a partida em andamento não tem deck e nunca vai jogar — comparar com
  // `match.users` deixava `allPlayersPlayed` falso para sempre, e o alerta de
  // "nem todos jogaram" aparecia em todo avanço de rodada.
  const playersInRound = match?.actualRound?.decks || [];

  const playersWhoPlayed = playersInRound.filter((deck) =>
    match?.actualRound?.usersWhoPlayed.some(
      (played) => played.user.uid === deck.user.uid
    )
  ).length;

  const allPlayersPlayed =
    matchStarted &&
    playersInRound.length > 0 &&
    playersWhoPlayed === playersInRound.length;

  function getRoundStatus(): string {
    // Sem estrelas nas cartas, é por aqui que se sabe quando avançar a rodada.
    const voteCount = match?.hideVotes
      ? ` ${match.actualRound?.usersWhoVoted.length || 0} de ${
          playersInRound.length
        } votos.`
      : '';

    if (!userAlreadyPlayed) {
      return 'Escolha a resposta mais engraçada que você tiver.';
    }

    if (!allPlayersPlayed) {
      const missing = playersInRound.length - playersWhoPlayed;

      return `Aguardando ${missing} de ${playersInRound.length} ${
        playersInRound.length === 1 ? 'jogador' : 'jogadores'
      }.`;
    }

    if (!userAlreadyVoted) {
      return `Vote na melhor resposta.${voteCount}`;
    }

    return isOwner
      ? `Quando todos votarem, passe para a próxima rodada.${voteCount}`
      : `Voto registrado. Aguardando a próxima rodada.${voteCount}`;
  }

  function handleOpenDrawer(): void {
    setHasNewMessases(false);
    menuRef.current?.openDrawer();
  }

  function handleNextRound(): void {
    if (matchStarted && !allPlayersPlayed) {
      onAlertOpen();
      return;
    }

    nextRound();
  }

  function handleConfirmNextRound(): void {
    onAlertClose();
    nextRound();
  }

  function handleLeaveWithoutFinishing(): void {
    onLeaveClose();
    navigate('/');
  }

  async function handleFinishMatch(): Promise<void> {
    onLeaveClose();

    await finishMatch(id!);

    navigate('/');
  }

  useEffect(() => {
    if (hasWinner) {
      fireworks();
    }
  }, [hasWinner]);

  return (
    <div className={styles.shell}>
      <SomeLoading
        loading={isLoading || loadingNext}
        message={isLoading ? 'Carregando partida...' : 'Carregando rodada...'}
      />

      {hasWinner && (
        <Center flex="1" flexDir="column" gap="6" py="6">
          <Heading as="h1" fontSize="2xl" textAlign="center">
            {getUserName(match.winner!)} venceu a partida!
          </Heading>

          <Card
            animationType="rotating"
            animationDelay="0s"
            message={`${getUserName(match.winner!)} venceu a partida!`}
            type="WHITE"
            className={styles.questionCard}
            frontClassName={styles.questionFront}
            backClassName={styles.questionBack}
          />

          <Box w="full" maxW="480px">
            <Scoreboard match={match} />
          </Box>

          <Button
            w={{ base: 'full', md: 'auto' }}
            rightIcon={<Icon as={FaHome} />}
            onClick={() => navigate('/')}
          >
            Voltar para o início
          </Button>
        </Center>
      )}

      {!hasWinner && !isLoading && !loadingNext && match && (
        <>
          <Flex as="header" align="center" gap="2" mb="2">
            {/* O anfitrião não encerra mais a partida de todo mundo só por
                clicar na seta de voltar: agora escolhe explicitamente. */}
            {isOwner ? <GoBack onClick={onLeaveOpen} /> : <GoBack toHome />}

            {matchStarted && (
              <Tag bg="app.accent" color="app.onAccent" flexShrink={0}>
                <Icon as={FaFlag} mr="2" /> {round}ª rodada
              </Tag>
            )}

            <Flex flex="1" justify="end" align="center" gap="2" minW="0">
              <AvatarGroup size="sm" max={4}>
                {match.users?.map((player) => (
                  <PlayerAvatar key={player.uid} user={player} />
                ))}
              </AvatarGroup>

              <Box pos="relative">
                <IconButton
                  aria-label="Abrir menu da partida"
                  onClick={handleOpenDrawer}
                  icon={<Icon as={FaBars} />}
                />

                <Box
                  boxSize="10px"
                  rounded="full"
                  bg="red.500"
                  pos="absolute"
                  top="-1"
                  right="-1"
                  transform="auto"
                  transition="0.2s ease-in-out"
                  scale={hasNewMessages ? '1' : '0'}
                />
              </Box>
            </Flex>
          </Flex>

          <SettingsDrawer ref={menuRef} match={match} />

          {matchStarted && (
            <Flex as="main" flex="1" direction="column" align="center" gap="3">
              <Text fontWeight="bold" textAlign="center" role="status">
                {getRoundStatus()}
              </Text>

              {/* Depois de jogar, a pergunta vai para o lado e deixa a largura
                  da tela para as respostas. */}
              <div
                className={styles.round}
                data-phase={userAlreadyPlayed ? 'answers' : 'hand'}
              >
                <Card
                  {...match.actualRound!.question}
                  animationDelay="0.2s"
                  animationType="auto"
                  className={styles.questionCard}
                  frontClassName={styles.questionFront}
                  backClassName={styles.questionBack}
                />

                {!userAlreadyPlayed && (
                  <CardsToPlay
                    match={match}
                    isFirstTime={isFirstTime}
                    newCardIds={newCardIds}
                  />
                )}

                <CardsPlayedList match={match} />
              </div>

              {isOwner && (
                <div className={styles.actionBar}>
                  <ShowCardsOwnerButton
                    matchId={id || ''}
                    w={{ base: 'full', md: 'auto' }}
                  />

                  <Button
                    w={{ base: 'full', md: '240px' }}
                    onClick={handleNextRound}
                    isLoading={loadingNext}
                    rightIcon={<Icon as={FaArrowRight} />}
                  >
                    Próxima rodada
                  </Button>
                </div>
              )}
            </Flex>
          )}

          {!matchStarted && (
            <Center as="main" flex="1" py="4">
              <Flex direction="column" gap="6" w="full" maxW="720px">
                <Box textAlign="center">
                  <Heading as="h1" fontSize="2xl">
                    Sala de espera
                  </Heading>

                  <Text color="app.muted">
                    {isOwner
                      ? 'Chame a galera e comece quando quiser.'
                      : `Esperando ${getUserName(
                          match.owner
                        )} iniciar a partida.`}
                  </Text>
                </Box>

                <Flex direction="column" gap="2">
                  <Heading as="h2" fontSize="lg">
                    Convide os amigos
                  </Heading>

                  <MatchLinkInput />
                </Flex>

                <Flex direction="column" gap="2">
                  <Heading as="h2" fontSize="lg">
                    Jogadores ({match.users?.length || 0})
                  </Heading>

                  <Scoreboard match={match} />
                </Flex>

                {isOwner && (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                      <FormControl>
                        <FormLabel>Duração</FormLabel>
                        <Select
                          value={match.pointsToWin}
                          onChange={(e) => {
                            changePointsToWin(id!, Number(e.target.value));
                          }}
                        >
                          <option value="10">Rápida (10 pontos)</option>
                          <option value="20">Normal (20 pontos)</option>
                          <option value="40">Longa (40 pontos)</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Visibilidade</FormLabel>
                        <Select
                          value={match.type}
                          onChange={(e) => {
                            changeVisibility(
                              id!,
                              e.target.value as 'PUBLIC' | 'PRIVATE'
                            );
                          }}
                        >
                          <option value="PRIVATE">
                            Privada (só com o link)
                          </option>
                          <option value="PUBLIC">
                            Pública (aparece na busca)
                          </option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Cartas na mão</FormLabel>
                        <Select
                          value={match.cardsPerPlayer}
                          onChange={(e) => {
                            changeCardsPerPlayer(id!, Number(e.target.value));
                          }}
                        >
                          <option value="4">4 cartas por jogador</option>
                          <option value="5">5 cartas por jogador</option>
                          <option value="6">6 cartas por jogador</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>A cada rodada</FormLabel>
                        <Select
                          value={match.keepCards ? 'keep' : 'random'}
                          onChange={(e) => {
                            changeKeepCards(id!, e.target.value === 'keep');
                          }}
                        >
                          <option value="keep">Manter as cartas da mão</option>
                          <option value="random">Receber cartas novas</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Votos e placar</FormLabel>
                        <Select
                          value={match.hideVotes ? 'hidden' : 'visible'}
                          onChange={(e) => {
                            changeHideVotes(id!, e.target.value === 'hidden');
                          }}
                        >
                          <option value="visible">
                            Mostrar durante a partida
                          </option>
                          <option value="hidden">Revelar só no final</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <div className={styles.actionBar}>
                      <Button
                        w="full"
                        size="lg"
                        onClick={handleNextRound}
                        isLoading={loadingNext}
                        rightIcon={<Icon as={FaPlay} />}
                      >
                        Iniciar partida
                      </Button>
                    </div>
                  </>
                )}
              </Flex>
            </Center>
          )}

          <AlertDialog
            isOpen={isLeaveOpen}
            leastDestructiveRef={leaveCancelRef}
            onClose={onLeaveClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent mx="4">
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Sair da partida
                </AlertDialogHeader>

                <AlertDialogBody>
                  Você é o anfitrião. Encerrar a partida tira todos os jogadores
                  da mesa; sair sem encerrar mantém a partida aberta para quem
                  ficou.
                </AlertDialogBody>

                <AlertDialogFooter gap="3" flexWrap="wrap">
                  <Button
                    ref={leaveCancelRef}
                    variant="defaultOutlined"
                    onClick={onLeaveClose}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleLeaveWithoutFinishing}>
                    Sair sem encerrar
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="red"
                    onClick={handleFinishMatch}
                  >
                    Encerrar partida
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onAlertClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent mx="4">
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Nem todos jogaram
                </AlertDialogHeader>

                <AlertDialogBody>
                  Alguns jogadores ainda não fizeram suas jogadas. Deseja
                  avançar para a próxima rodada mesmo assim?
                </AlertDialogBody>

                <AlertDialogFooter gap="3">
                  <Button
                    ref={cancelRef}
                    variant="defaultOutlined"
                    onClick={onAlertClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="red"
                    onClick={handleConfirmNextRound}
                  >
                    Avançar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
