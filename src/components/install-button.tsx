import {
  Button,
  ButtonProps,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallButton(props: ButtonProps): JSX.Element | null {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleInstallPrompt(event: Event): void {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleInstalled(): void {
      setInstallEvent(null);
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled()) {
    return null;
  }

  // O iOS não tem `beforeinstallprompt`: a instalação é manual.
  if (isIos()) {
    return (
      <Popover>
        <PopoverTrigger>
          <Button
            variant="defaultOutlined"
            leftIcon={<Icon as={FaDownload} />}
            {...props}
          >
            Instalar app
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            No Safari, toque em Compartilhar e depois em &quot;Adicionar à Tela
            de Início&quot;.
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  if (!installEvent) {
    return null;
  }

  return (
    <Button
      variant="defaultOutlined"
      leftIcon={<Icon as={FaDownload} />}
      onClick={() => installEvent.prompt()}
      {...props}
    >
      Instalar app
    </Button>
  );
}
