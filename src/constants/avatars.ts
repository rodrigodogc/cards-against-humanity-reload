import { IconType } from 'react-icons';
import {
  GiBeerStein,
  GiBrain,
  GiChickenOven,
  GiClown,
  GiCoffin,
  GiCrown,
  GiDevilMask,
  GiDinosaurRex,
  GiEvilBat,
  GiGhost,
  GiGoat,
  GiKnifeFork,
  GiMoneyStack,
  GiMushroomGills,
  GiNinjaHead,
  GiPirateHat,
  GiPoisonBottle,
  GiPoolDive,
  GiRat,
  GiRobotGolem,
  GiSkullCrossedBones,
  GiSpiderAlt,
  GiTombstone,
  GiUnicorn,
} from 'react-icons/gi';

export interface PlayerIcon {
  id: string;
  label: string;
  icon: IconType;
}

export const AVATARS: PlayerIcon[] = [
  { id: 'caveira', label: 'Caveira', icon: GiSkullCrossedBones },
  { id: 'caixao', label: 'Caixão', icon: GiCoffin },
  { id: 'lapide', label: 'Lápide', icon: GiTombstone },
  { id: 'fantasma', label: 'Fantasma', icon: GiGhost },
  { id: 'diabo', label: 'Diabo', icon: GiDevilMask },
  { id: 'palhaco', label: 'Palhaço', icon: GiClown },
  { id: 'veneno', label: 'Veneno', icon: GiPoisonBottle },
  { id: 'rato', label: 'Rato', icon: GiRat },
  { id: 'morcego', label: 'Morcego', icon: GiEvilBat },
  { id: 'aranha', label: 'Aranha', icon: GiSpiderAlt },
  { id: 'cabra', label: 'Cabra', icon: GiGoat },
  { id: 'unicornio', label: 'Unicórnio', icon: GiUnicorn },
  { id: 'dinossauro', label: 'Dinossauro', icon: GiDinosaurRex },
  { id: 'robo', label: 'Robô', icon: GiRobotGolem },
  { id: 'ninja', label: 'Ninja', icon: GiNinjaHead },
  { id: 'pirata', label: 'Pirata', icon: GiPirateHat },
  { id: 'coroa', label: 'Coroa', icon: GiCrown },
  { id: 'dinheiro', label: 'Dinheiro', icon: GiMoneyStack },
  { id: 'cerveja', label: 'Cerveja', icon: GiBeerStein },
  { id: 'frango', label: 'Frango', icon: GiChickenOven },
  { id: 'talheres', label: 'Talheres', icon: GiKnifeFork },
  { id: 'cogumelo', label: 'Cogumelo', icon: GiMushroomGills },
  { id: 'cerebro', label: 'Cérebro', icon: GiBrain },
  { id: 'mergulho', label: 'Mergulho', icon: GiPoolDive },
];

export function getAvatar(id?: string | null): PlayerIcon | undefined {
  return AVATARS.find((avatar) => avatar.id === id);
}

export function getRandomAvatarId(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
}
