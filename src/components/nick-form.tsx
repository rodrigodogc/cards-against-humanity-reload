import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FormEvent, useState } from 'react';

import { AVATARS, getRandomAvatarId } from '@/constants/avatars';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/get-error-message';
import {
  NICK_MAX_LENGTH,
  normalizeNick,
  validateNick,
} from '@/utils/validate-nick';

interface NickFormProps {
  submitLabel?: string;
  onDone?: () => void;
}

export function NickForm({
  submitLabel = 'Entrar',
  onDone,
}: NickFormProps): JSX.Element {
  const { user, handleEnter } = useAuth();
  const toast = useToast();

  const [nick, setNick] = useState(user?.displayName || '');
  const [avatar, setAvatar] = useState(user?.photoURL || getRandomAvatarId());
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const nickError = validateNick(nick);

    setError(nickError);

    if (nickError) {
      return;
    }

    try {
      setIsSaving(true);

      await handleEnter({ nick: normalizeNick(nick), avatar });

      onDone?.();
    } catch (saveError) {
      console.error('error', saveError);

      toast({
        title: 'Não foi possível entrar',
        description: getErrorMessage(saveError, 'Tente novamente.'),
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Flex as="form" onSubmit={handleSubmit} direction="column" gap="5" w="full">
      <FormControl isInvalid={Boolean(error)}>
        <FormLabel>Seu nick</FormLabel>

        <Input
          autoFocus
          size="lg"
          value={nick}
          maxLength={NICK_MAX_LENGTH}
          placeholder="Como vão te chamar?"
          autoComplete="nickname"
          onChange={(event) => {
            setNick(event.target.value);
            setError(null);
          }}
        />

        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>

      <FormControl as="fieldset">
        <FormLabel as="legend">Seu ícone</FormLabel>

        <SimpleGrid columns={{ base: 6, sm: 8 }} spacing="2">
          {AVATARS.map(({ id, label, icon }) => (
            <Tooltip key={id} label={label} openDelay={400}>
              <IconButton
                aria-label={label}
                aria-pressed={avatar === id}
                icon={<Icon as={icon} boxSize="6" />}
                variant={avatar === id ? 'default' : 'defaultOutlined'}
                minW="0"
                w="full"
                h="44px"
                onClick={() => setAvatar(id)}
              />
            </Tooltip>
          ))}
        </SimpleGrid>
      </FormControl>

      <Button type="submit" size="lg" isLoading={isSaving}>
        {submitLabel}
      </Button>

      <Text fontSize="sm" color="app.muted" textAlign="center">
        Conteúdo adulto e humor pesado. É só piada, nunca agressão. Ao entrar,
        você confirma ter 18 anos ou mais.
      </Text>
    </Flex>
  );
}
