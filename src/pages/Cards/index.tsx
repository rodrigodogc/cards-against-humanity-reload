import { useMemo, useState } from 'react';

import { Card } from '@/components/Card';

import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';

import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useFetchCards } from './useFetchCards';

import styles from './styles.module.scss';

type CardFilter = 'ALL' | 'WHITE' | 'BLACK';

const PAGE_SIZE = 48;

const FILTERS: { id: CardFilter; label: string }[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'WHITE', label: 'Respostas' },
  { id: 'BLACK', label: 'Perguntas' },
];

export function Cards(): JSX.Element {
  const { isLoading, cards } = useFetchCards();

  const [cardsFilter, setCardsFilter] = useState<CardFilter>('ALL');
  const [cardsSearch, setCardsSearch] = useState('');
  const [visibleCards, setVisibleCards] = useState(PAGE_SIZE);

  const filteredCards = useMemo(() => {
    const search = cardsSearch.trim().toLowerCase();

    return cards.filter(
      ({ type, message }) =>
        (cardsFilter === 'ALL' || cardsFilter === type) &&
        message.toLowerCase().includes(search)
    );
  }, [cards, cardsFilter, cardsSearch]);

  const whites = cards.filter(({ type }) => type === 'WHITE').length;

  return (
    <Container as="main" maxW="1200px" py="4">
      <SomeLoading loading={isLoading} message="Carregando cartas..." />

      <Box mb="4">
        <GoBack toHome />
      </Box>

      <Heading as="h1" fontSize="2xl" textAlign="center">
        Cartas
      </Heading>

      <Text color="app.muted" textAlign="center" mb="6">
        {whites} respostas e {cards.length - whites} perguntas no baralho.
      </Text>

      <Center flexDir="column" gap="4" mb="6">
        <InputGroup maxW="600px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} />
          </InputLeftElement>

          <Input
            aria-label="Buscar cartas"
            placeholder="Buscar pelo texto da carta..."
            value={cardsSearch}
            onChange={(event) => {
              setCardsSearch(event.target.value);
              setVisibleCards(PAGE_SIZE);
            }}
          />
        </InputGroup>

        <ButtonGroup isAttached w="full" maxW="600px">
          {FILTERS.map(({ id, label }) => (
            <Button
              key={id}
              flex="1"
              px="2"
              fontSize="sm"
              aria-pressed={cardsFilter === id}
              variant={cardsFilter === id ? 'default' : 'defaultOutlined'}
              onClick={() => {
                setCardsFilter(id);
                setVisibleCards(PAGE_SIZE);
              }}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </Center>

      {!isLoading && filteredCards.length === 0 && (
        <Text textAlign="center">Nenhuma carta encontrada.</Text>
      )}

      <SimpleGrid minChildWidth="150px" spacing="3" justifyItems="center">
        {filteredCards.slice(0, visibleCards).map(({ id, message, type }) => (
          <Card
            key={id}
            message={message}
            type={type}
            className={styles.card}
            backClassName={styles.cardBack}
          />
        ))}
      </SimpleGrid>

      {visibleCards < filteredCards.length && (
        <Center mt="6">
          <Button
            variant="defaultOutlined"
            onClick={() => setVisibleCards(visibleCards + PAGE_SIZE)}
          >
            Carregar mais ({filteredCards.length - visibleCards})
          </Button>
        </Center>
      )}
    </Container>
  );
}
