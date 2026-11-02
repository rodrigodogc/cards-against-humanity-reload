import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { FormEvent, useRef } from 'react';

import { FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const MATCH_ID = /[A-Za-z0-9]{20}/;

export function JoinMatch() {
  const toast = useToast();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  function handleMatchJoin(event: FormEvent) {
    event.preventDefault();

    // Aceita tanto o código quanto o link inteiro que o amigo mandou.
    const code = inputRef.current?.value.trim().match(MATCH_ID)?.[0];

    if (!code) {
      toast({
        title: 'Código inválido',
        status: 'info',
        description: 'Cole o link ou o código da partida.',
      });

      return;
    }

    navigate(`/match/${code}`);
  }

  return (
    <>
      <Box>
        <Heading as="h1" fontSize="2xl">
          Entre em uma partida
        </Heading>

        <Text color="app.muted" fontSize="sm">
          Cole aqui o link ou o código que seu amigo enviou.
        </Text>
      </Box>

      <Flex as="form" onSubmit={handleMatchJoin}>
        <Input
          ref={inputRef}
          placeholder="Link ou código da partida"
          aria-label="Link ou código da partida"
          roundedRight="0"
        />

        <Button
          type="submit"
          px="8"
          roundedLeft="0"
          flexShrink={0}
          rightIcon={<Icon as={FiSend} transform="auto" rotate="45" />}
        >
          Entrar
        </Button>
      </Flex>
    </>
  );
}
