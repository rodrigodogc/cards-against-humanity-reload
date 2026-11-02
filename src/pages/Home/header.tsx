import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { AppLogo } from '@/components/app-logo';
import { NickForm } from '@/components/nick-form';
import { PlayerAvatar } from '@/components/player-avatar';
import { ThemeMenu } from '@/components/theme-menu';
import { useAuth } from '@/contexts/AuthContext';
import { getUserName } from '@/utils/get-user-name';

export function Header(): JSX.Element {
  const { user, handleLogout } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      gap="3"
      minH="80px"
    >
      <Box w={{ base: '120px', sm: '200px' }}>
        <AppLogo />
      </Box>

      <Flex align="center" gap="3">
        <ThemeMenu />

        <Flex
          as="button"
          type="button"
          align="center"
          gap="2"
          onClick={onOpen}
          aria-label="Editar perfil"
        >
          <Text
            fontWeight="bold"
            display={{ base: 'none', sm: 'block' }}
            maxW="160px"
            noOfLines={1}
          >
            {getUserName(user)}
          </Text>

          <PlayerAvatar user={user} />
        </Flex>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent mx="4">
          <ModalHeader>Seu perfil</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb="6">
            <NickForm submitLabel="Salvar" onDone={onClose} />

            <Popover>
              <PopoverTrigger>
                <Button variant="link" w="full" mt="4" color="app.muted">
                  Sair desta conta
                </Button>
              </PopoverTrigger>

              <PopoverContent>
                <PopoverArrow />
                <PopoverHeader fontWeight="bold">
                  Suas vitórias serão perdidas
                </PopoverHeader>

                <PopoverBody>
                  <Text mb="3" fontSize="sm">
                    Sua conta só existe neste navegador. Ao sair, não há como
                    voltar a ela, e o histórico no ranking fica para trás.
                  </Text>

                  <Button
                    w="full"
                    variant="solid"
                    colorScheme="red"
                    onClick={handleLogout}
                  >
                    Sair mesmo assim
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
