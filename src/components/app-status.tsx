import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-unresolved -- módulo virtual do vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Avisos globais do app instalado: sem conexão (o jogo depende do servidor, mas
 * o app e as cartas abrem offline) e nova versão disponível. A atualização só
 * acontece no clique, para nunca recarregar a página no meio de uma partida.
 */
export function AppStatus(): JSX.Element | null {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    function updateStatus(): void {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!isOffline && !needRefresh) {
    return null;
  }

  return (
    <Flex
      pos="fixed"
      insetX="0"
      bottom="0"
      zIndex="toast"
      align="center"
      justify="center"
      gap="3"
      px="4"
      py="2"
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
      bg="app.accent"
      color="app.onAccent"
      role="status"
    >
      <Text fontSize="sm">
        {isOffline
          ? 'Sem conexão. Para jogar, é preciso estar on-line.'
          : 'Nova versão disponível.'}
      </Text>

      {!isOffline && (
        <Button
          size="sm"
          variant="outline"
          color="app.onAccent"
          borderColor="app.onAccent"
          onClick={() => updateServiceWorker(true)}
        >
          Atualizar
        </Button>
      )}
    </Flex>
  );
}
