import { useEffect, useState } from 'react';

import { convertMatchSummary, getLastMatches } from '@/services/matches';

import { useBoolean } from '@/hooks/useBoolean';
import { useToast } from '@chakra-ui/react';
import { getErrorMessage } from '@/utils/get-error-message';

interface UseLastMatchesReturn {
  matches: MatchConvertedType[];
  setMatches: (matches: MatchConvertedType[]) => void;
  loading: boolean;
}

export function useLastMatches(size = 10): UseLastMatchesReturn {
  const [loading, , stopLoading] = useBoolean(true);
  const [matches, setMatches] = useState<MatchConvertedType[]>([]);
  const toast = useToast();

  useEffect(() => {
    async function loadMatches(): Promise<void> {
      try {
        const matches = await getLastMatches(size);

        const convertedMatches = await Promise.all(
          matches.map(convertMatchSummary)
        );

        setMatches(convertedMatches);
      } catch (error) {
        console.error('error', error);

        const description = getErrorMessage(
          error,
          'Não foi possível encontrar as últimas partidas.'
        );

        toast({
          description,
          title: 'Aconteceu um erro',
          status: 'error',
        });
      } finally {
        stopLoading();
      }
    }

    loadMatches();
  }, [size, stopLoading, toast]);

  // O stream em tempo real desta tela foi REMOVIDO junto com `streamMatches`.
  // Ele abria um listener sobre todas as partidas não finalizadas: a cada
  // jogada de qualquer partida do site, todo cliente parado nesta tela recebia
  // (e pagava) uma atualização.

  return { matches, setMatches, loading };
}
