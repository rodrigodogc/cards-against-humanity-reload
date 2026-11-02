import { Box, Center, Flex, Heading, Link, Text } from '@chakra-ui/react';

import { AppLogo } from '@/components/app-logo';
import { NickForm } from '@/components/nick-form';
import { ThemeMenu } from '@/components/theme-menu';

export function EntryScreen(): JSX.Element {
  return (
    <Center minH="100dvh" p="4" pos="relative">
      <Box pos="absolute" top="4" right="4">
        <ThemeMenu />
      </Box>

      <Flex
        direction="column"
        gap="6"
        w="full"
        maxW="480px"
        mt={{ base: '14', sm: '0' }}
      >
        <Box w="200px" mx="auto">
          <AppLogo />
        </Box>

        <Box textAlign="center">
          <Heading as="h1" fontSize="2xl">
            Escolha um nick e jogue
          </Heading>

          <Text color="app.muted">Sem cadastro, sem senha, sem e-mail.</Text>
        </Box>

        <NickForm />

        <Text fontSize="sm" textAlign="center">
          <Link href="/tutorial.html" textDecor="underline">
            Como jogar
          </Link>
        </Text>
      </Flex>
    </Center>
  );
}
