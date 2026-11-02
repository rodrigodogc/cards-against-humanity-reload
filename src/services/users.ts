import { usersCollection } from '@/firebase/config';
import {
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

import Repository from '@/lib/Repository';
import { getAny, mapValue } from './core';

const USERS_KEY = '@CARDS_AGAINST_HUMANITY/USERS';

/** Perfis mudam muito pouco; um dia de cache é conservador. */
const CACHE_TTL = 24 * 60 * 60 * 1000;

const RANKING_TTL = 5 * 60 * 1000;

interface CachedUser {
  user: UserType;
  cachedAt: number;
}

type UsersCache = Record<string, CachedUser>;

/**
 * `convertMatch` resolve uma DocumentReference de usuário para cada jogador,
 * cada resposta, cada voto e cada deck — e roda a cada snapshot da partida.
 * Sem cache, isso são dezenas de `getDoc` faturados por evento, por cliente
 * conectado: é a maior fonte isolada de leituras do projeto.
 *
 * Duas camadas resolvem o problema:
 *   1. `PENDING` deduplica chamadas simultâneas do mesmo uid (a conversão pede
 *      o mesmo jogador várias vezes em paralelo → vira uma leitura só);
 *   2. `CACHE` evita reler entre snapshots e entre sessões (localStorage).
 */
const CACHE: UsersCache = Repository.get<UsersCache>(USERS_KEY) || {};

const PENDING = new Map<string, Promise<UserType>>();

let RANKING: { users: UserType[]; cachedAt: number } | null = null;

function isFresh(cached: CachedUser | undefined): cached is CachedUser {
  return Boolean(cached) && Date.now() - cached!.cachedAt < CACHE_TTL;
}

function persist(): void {
  Repository.save(USERS_KEY, CACHE);
}

function putOnCache(id: string, user: UserType): void {
  // `getAny` devolve {} quando o documento não existe: não vale cachear, senão
  // um usuário recém-criado ficaria "inexistente" por 24h.
  if (!user || !user.uid) {
    return;
  }

  CACHE[id] = { user, cachedAt: Date.now() };
  persist();
}

/**
 * Cria ou atualiza o perfil. O ícone escolhido fica em `photoURL` (o id de
 * `constants/avatars`): é o campo de perfil que o Firebase Auth já persiste e
 * que as regras do Firestore já conhecem.
 *
 * `merge: true` é essencial: sem ele o setDoc substitui o documento inteiro e
 * apaga `wins` a cada edição do perfil.
 */
export async function saveProfile({
  uid,
  displayName,
  photoURL,
}: UserType): Promise<void> {
  await setDoc(
    doc(usersCollection, uid),
    { uid, displayName, photoURL },
    { merge: true }
  );

  // Preserva o que já estava em cache (como `wins`).
  putOnCache(uid, {
    ...(CACHE[uid]?.user || {}),
    uid,
    displayName,
    photoURL,
  });
}

/**
 * Leitura de perfil com cache. Use em qualquer lugar que só precise
 * exibir o usuário (nome, ícone).
 */
export async function getUser(id: string): Promise<UserType> {
  const cached = CACHE[id];

  if (isFresh(cached)) {
    return cached.user;
  }

  const pending = PENDING.get(id);

  if (pending) {
    return pending;
  }

  const promise = getAny<UserType>(usersCollection, id)
    .then((user) => {
      putOnCache(id, user);
      return user;
    })
    .finally(() => {
      PENDING.delete(id);
    });

  PENDING.set(id, promise);

  return promise;
}

/** Ao entrar em uma partida, nicks e ícones editados precisam aparecer. */
export function forgetUsers(ids: string[]): void {
  ids.forEach((id) => {
    delete CACHE[id];
  });

  persist();
}

export async function getRanking(size = 50): Promise<UserType[]> {
  if (RANKING && Date.now() - RANKING.cachedAt < RANKING_TTL) {
    return RANKING.users;
  }

  const data = await getDocs(
    query(usersCollection, orderBy('wins', 'desc'), limit(size))
  );

  const users = mapValue(data);

  RANKING = { users, cachedAt: Date.now() };

  return users;
}
