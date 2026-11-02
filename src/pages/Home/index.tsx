import { Container, Flex, Link, Tag, Text } from '@chakra-ui/react';
import { useState } from 'react';

import { EntryScreen } from '@/components/entry-screen';
import { SomeLoading } from '@/components/SomeLoading';
import { useAuth } from '@/contexts/AuthContext';
import { version } from '../../../package.json';
import { Actions } from './actions';
import { Header } from './header';
import { JoinMatch } from './join-match';
import { QuotaBanner } from './quota-banner';

export function Home(): JSX.Element {
  const { authenticated, isLoading } = useAuth();

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  if (isLoading) {
    return <SomeLoading loading message="Carregando..." />;
  }

  if (!authenticated) {
    return <EntryScreen />;
  }

  return (
    <Container
      as={Flex}
      maxW="900px"
      minH="100dvh"
      direction="column"
      pb="calc(1rem + env(safe-area-inset-bottom))"
    >
      <Header />

      {quotaExceeded && <QuotaBanner onClose={() => setQuotaExceeded(false)} />}

      <Flex
        as="main"
        flex="1"
        gap={{ base: '10', md: '12' }}
        py={{ base: '6', md: '12' }}
        align={{ base: 'stretch', md: 'center' }}
        flexDir={{ base: 'column', md: 'row' }}
      >
        <Actions onQuotaExceeded={() => setQuotaExceeded(true)} />

        <Flex flexDir="column" gap="3" flex="1">
          <JoinMatch />
        </Flex>
      </Flex>

      <Flex
        as="footer"
        align="center"
        justify="space-between"
        gap="3"
        wrap="wrap"
        fontSize="sm"
      >
        <Flex gap="4" wrap="wrap">
          <Link href="/tutorial.html" textDecor="underline">
            Como jogar
          </Link>
          <Link href="/faq.html" textDecor="underline">
            Dúvidas
          </Link>
          <Link href="/sobre.html" textDecor="underline">
            Sobre
          </Link>
        </Flex>

        <Flex align="center" gap="2">
          <Text color="app.muted">Humor adulto, 18+</Text>
          <Tag bg="app.accent" color="app.onAccent">
            {version}
          </Tag>
        </Flex>
      </Flex>
    </Container>
  );
}
