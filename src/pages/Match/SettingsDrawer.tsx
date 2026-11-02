import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  Input,
  Text,
  VStack,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { AppLogo } from '@/components/app-logo';
import { FinishMatchButton } from '@/components/finish-match-button';
import { ThemeMenu } from '@/components/theme-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { addMessageToMatch } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { getUserName } from '@/utils/get-user-name';
import { FiSend } from 'react-icons/fi';
import { MatchLinkInput } from './match-link-input';
import { Scoreboard } from './scoreboard';

const MAX_MESSAGE_LENGTH = 300;

interface SettingsDrawerProps {
  match: MatchConvertedType | null;
}

export interface SettingsDrawerHandles {
  openDrawer: () => void;
}

function SettingsDrawerBase(
  { match }: SettingsDrawerProps,
  ref: React.ForwardedRef<SettingsDrawerHandles>
): JSX.Element {
  const [isOpen, openDrawer, closeDrawer] = useBoolean(false);

  const [isSendingMessage, startSendingMessage, stopSendingMessage] =
    useBoolean(false);

  const toast = useToast();
  const { user } = useAuth();

  const size = useBreakpointValue({ base: 'full', md: 'md' });

  const inputRef = useRef<HTMLInputElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const isOwner = match?.owner?.uid === user?.uid;

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  async function handleSendMessage() {
    const message = inputRef.current?.value.trim();

    if (!message || !match) {
      return;
    }

    try {
      startSendingMessage();

      await addMessageToMatch(match.id, {
        message,
        userName: getUserName(user),
      });

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível enviar a mensagem.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      stopSendingMessage();
    }
  }

  const messagesLength = match?.messages?.length || 0;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        stackRef.current?.scrollTo({
          top: stackRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isOpen, messagesLength]);

  const messages = [...(match?.messages || [])].sort(
    (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
  );

  return (
    <Drawer isOpen={isOpen} placement="right" size={size} onClose={closeDrawer}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Flex align="center" gap="3" pr="8">
            <Box w="160px">
              <AppLogo />
            </Box>

            <ThemeMenu />
          </Flex>
        </DrawerHeader>

        <DrawerBody pb="calc(1.5rem + env(safe-area-inset-bottom))">
          <Flex w="full" flexDir="column" gap="6">
            <Flex flexDir="column" gap="2">
              <Heading as="h3" fontSize="lg">
                Convide os amigos
              </Heading>

              <MatchLinkInput />
            </Flex>

            <Flex flexDir="column" gap="2">
              <Heading as="h3" fontSize="lg">
                {match?.hideVotes ? 'Jogadores' : 'Placar'}
              </Heading>

              <Text fontSize="sm" color="app.muted">
                Ganha quem fizer {match?.pointsToWin || 0} pontos.
                {match?.hideVotes && ' O placar só aparece no final.'}
              </Text>

              {match && <Scoreboard match={match} />}
            </Flex>

            <Flex flexDir="column" gap="2">
              <Heading as="h3" fontSize="lg">
                Chat
              </Heading>

              <VStack
                h="240px"
                border="1px"
                spacing="1"
                borderColor="app.border"
                rounded="md"
                p="3"
                overflowY="auto"
                ref={stackRef}
              >
                {messages.length === 0 && (
                  <Text color="app.muted" fontSize="sm">
                    Ninguém falou nada ainda. Comece a provocação.
                  </Text>
                )}

                {messages.map((message) => {
                  const createdAt: Date = message.createdAt.toDate();

                  const time = createdAt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <Text
                      key={message.id}
                      w="full"
                      color="app.muted"
                      wordBreak="break-word"
                    >
                      <Text as="span" fontSize="xs">
                        {time}
                      </Text>{' '}
                      <Text as="span" fontWeight="bold" color="app.text">
                        {message.userName}:
                      </Text>{' '}
                      {message.message}
                    </Text>
                  );
                })}
              </VStack>

              <Flex>
                <Input
                  ref={inputRef}
                  aria-label="Mensagem"
                  placeholder="Escreva sua mensagem..."
                  maxLength={MAX_MESSAGE_LENGTH}
                  roundedRight="0"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  px="6"
                  roundedLeft="0"
                  flexShrink={0}
                  rightIcon={<Icon as={FiSend} transform="auto" rotate="45" />}
                  onClick={handleSendMessage}
                  isLoading={isSendingMessage}
                >
                  Enviar
                </Button>
              </Flex>
            </Flex>

            {isOwner && <FinishMatchButton matchId={match?.id || ''} />}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export const SettingsDrawer = forwardRef<
  SettingsDrawerHandles,
  SettingsDrawerProps
>(SettingsDrawerBase);
