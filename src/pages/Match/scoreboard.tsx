import { Flex, Icon, Text } from '@chakra-ui/react';
import { FaCheck, FaCrown } from 'react-icons/fa';

import { PlayerAvatar } from '@/components/player-avatar';
import { getUserName } from '@/utils/get-user-name';

interface ScoreboardProps {
  match: MatchConvertedType;
}

export function Scoreboard({ match }: ScoreboardProps): JSX.Element {
  function getPoints(uid: string): number {
    return match.points?.find(({ userId }) => userId === uid)?.value || 0;
  }

  const players = [...(match.users || [])].sort(
    (a, b) => getPoints(b.uid) - getPoints(a.uid)
  );

  return (
    <Flex as="ol" direction="column" gap="2" listStyleType="none" w="full">
      {players.map((player, index) => {
        const isOwner = player.uid === match.owner.uid;
        const hasPlayed = match.actualRound?.usersWhoPlayed.some(
          (played) => played.user.uid === player.uid
        );

        return (
          <Flex
            as="li"
            key={player.uid}
            align="center"
            gap="3"
            p="2"
            rounded="md"
            bg="app.surface"
          >
            <Text w="6" textAlign="center" fontWeight="bold" color="app.muted">
              {index + 1}
            </Text>

            <PlayerAvatar size="sm" user={player} />

            <Text fontWeight="bold" flex="1" minW="0" noOfLines={1}>
              {getUserName(player)}
            </Text>

            {isOwner && (
              <Icon
                as={FaCrown}
                color="yellow.500"
                aria-label="Anfitrião"
                title="Anfitrião"
              />
            )}

            {hasPlayed && (
              <Icon
                as={FaCheck}
                color="green.500"
                aria-label="Já jogou"
                title="Já jogou"
              />
            )}

            <Text fontWeight="bold" whiteSpace="nowrap">
              {getPoints(player.uid)} pts
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}
