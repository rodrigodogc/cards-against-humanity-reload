import { useEffect, useRef } from 'react';

import { getUserName } from '@/utils/get-user-name';
import { playEffect, startMusic, stopMusic } from '@/utils/sound';

export function useMatchSounds(
  match: MatchConvertedType | null,
  user: UserType
): void {
  const previousRef = useRef<{
    rounds: number;
    othersPlayed: number;
    othersVoted: number;
    allPlayed: boolean;
    messages: number;
    hasWinner: boolean;
  } | null>(null);

  useEffect(() => {
    startMusic();

    return stopMusic;
  }, []);

  useEffect(() => {
    if (!match) {
      return;
    }

    const round = match.actualRound;
    const playerCount = round?.decks.length || 0;

    const current = {
      rounds: match.rounds || 0,
      othersPlayed:
        round?.usersWhoPlayed.filter((played) => played.user.uid !== user.uid)
          .length || 0,
      othersVoted:
        round?.usersWhoVoted?.filter((voted) => voted.user.uid !== user.uid)
          .length || 0,
      allPlayed:
        playerCount > 0 && round?.usersWhoPlayed.length === playerCount,
      messages: match.messages?.length || 0,
      hasWinner: Boolean(match.winner),
    };

    const previous = previousRef.current;

    previousRef.current = current;

    if (current.hasWinner) {
      stopMusic();
    }

    // Quem chega à partida não ouve de novo o que já aconteceu.
    if (!previous) {
      return;
    }

    if (current.hasWinner && !previous.hasWinner) {
      playEffect(match.winner?.uid === user.uid ? 'win' : 'lose');
    } else if (current.rounds > previous.rounds) {
      playEffect('round');
    } else if (current.allPlayed && !previous.allPlayed) {
      playEffect('reveal');
    } else if (
      current.othersPlayed > previous.othersPlayed ||
      current.othersVoted > previous.othersVoted
    ) {
      playEffect('tick');
    }

    const lastMessage = match.messages?.[current.messages - 1];

    if (
      current.messages > previous.messages &&
      lastMessage?.userName !== getUserName(user)
    ) {
      playEffect('message');
    }
  }, [match, user]);
}
