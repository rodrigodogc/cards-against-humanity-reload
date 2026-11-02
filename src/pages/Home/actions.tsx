import { InstallButton } from '@/components/install-button';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { QuotaExceededError } from '@/lib/QuotaExceededError';
import { newMatch } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { Button, Icon, VStack, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { RiPhoneFindFill } from 'react-icons/ri';
import { RxCardStackPlus } from 'react-icons/rx';
import { TbCards } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';

interface ActionsProps {
  onQuotaExceeded: () => void;
}

export function Actions({ onQuotaExceeded }: ActionsProps) {
  const { user } = useAuth();

  const navigate = useNavigate();
  const toast = useToast();

  const [isCreating, startCreate, stopCreate] = useBoolean(false);

  const handleNewMatch = useCallback(async () => {
    try {
      startCreate();

      const id = await newMatch(user.uid);

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);

      if (
        error instanceof QuotaExceededError ||
        (error as { code?: string })?.code === 'resource-exhausted'
      ) {
        onQuotaExceeded();

        return;
      }

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
  }, [navigate, startCreate, stopCreate, toast, user, onQuotaExceeded]);

  return (
    <VStack flex="1" spacing="3">
      <Button
        onClick={handleNewMatch}
        isLoading={isCreating}
        leftIcon={<Icon as={RxCardStackPlus} transform="auto" rotate="90" />}
        w="full"
        size="lg"
      >
        Nova partida
      </Button>

      <Button
        as={Link}
        to="/matches"
        leftIcon={<Icon as={RiPhoneFindFill} />}
        w="full"
        variant="defaultOutlined"
      >
        Encontrar partidas
      </Button>

      <Button
        as={Link}
        to="/ranking"
        leftIcon={<Icon as={FaTrophy} />}
        w="full"
        variant="defaultOutlined"
      >
        Ranking
      </Button>

      <Button
        as={Link}
        to="/cards"
        leftIcon={<Icon as={TbCards} />}
        w="full"
        variant="defaultOutlined"
      >
        Ver cartas
      </Button>

      <InstallButton w="full" />
    </VStack>
  );
}
