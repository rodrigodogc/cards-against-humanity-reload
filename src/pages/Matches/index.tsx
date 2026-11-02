import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';

import { Box, Container } from '@chakra-ui/react';
import { LastMatches } from './LastMatches';
import { useLastMatches } from './useLastMatches';

export function Matches(): JSX.Element {
  const { loading: loadingLastMatches, matches, setMatches } = useLastMatches();

  return (
    <>
      <SomeLoading
        loading={loadingLastMatches}
        message="Carregando as últimas partidas..."
      />

      <Container as="main" maxW="1100px" py="4">
        <Box mb="6">
          <GoBack toHome />
        </Box>

        <LastMatches matches={matches} onMatchesChange={setMatches} />
      </Container>
    </>
  );
}
