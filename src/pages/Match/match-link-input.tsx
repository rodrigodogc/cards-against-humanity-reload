import { Button, Flex, Icon, Input, useToast } from '@chakra-ui/react';

import { FaCopy, FaShareAlt } from 'react-icons/fa';

export function MatchLinkInput() {
  const toast = useToast();

  const canShare = typeof navigator.share === 'function';

  async function handleCopyMatchLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);

      toast({
        title: 'Link copiado',
        description: 'Agora é só mandar para os amigos.',
        status: 'info',
      });
    } catch {
      toast({
        title: 'Não foi possível copiar',
        description: 'Selecione o link e copie manualmente.',
        status: 'info',
      });
    }
  }

  async function handleShare(): Promise<void> {
    try {
      await navigator.share({
        title: 'Cartas Contra a Humanidade',
        text: 'Entra aí na minha partida:',
        url: window.location.href,
      });
    } catch {
      // Cancelar o compartilhamento também cai aqui: nada a fazer.
    }
  }

  return (
    <Flex>
      <Input
        readOnly
        aria-label="Link da partida"
        value={window.location.href}
        roundedRight="0"
        onFocus={(event) => event.target.select()}
      />

      <Button
        px="6"
        roundedLeft="0"
        flexShrink={0}
        rightIcon={<Icon as={canShare ? FaShareAlt : FaCopy} />}
        onClick={canShare ? handleShare : handleCopyMatchLink}
      >
        {canShare ? 'Enviar' : 'Copiar'}
      </Button>
    </Flex>
  );
}
