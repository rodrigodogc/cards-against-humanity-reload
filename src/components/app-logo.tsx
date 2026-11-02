import { useColorModeValue } from '@chakra-ui/react';

import { BlackLogo, WhiteLogo } from '@/components/Card/Logos';

/** O logo com texto legível sobre o fundo do tema atual. */
export function AppLogo(): JSX.Element {
  const Logo = useColorModeValue(WhiteLogo, BlackLogo);

  return <Logo />;
}
