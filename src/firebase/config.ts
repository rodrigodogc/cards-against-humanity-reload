import { initializeApp } from 'firebase/app';

import { connectAuthEmulator, getAuth } from 'firebase/auth';

import {
  collection,
  CollectionReference,
  connectFirestoreEmulator,
  DocumentData,
  getFirestore,
} from 'firebase/firestore';

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVariables = Object.entries({
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVariables.length > 0) {
  throw new Error(
    `Configuração do Firebase ausente: ${missingVariables.join(
      ', '
    )}. Copie .env.example para .env e preencha os valores.`
  );
}

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export function createCollection<T = DocumentData>(
  collectionName: string
): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>;
}
export const matchesCollection = createCollection<MatchType>('matches');
export const cardsCollection = createCollection<CardType>('cards');
export const usersCollection = createCollection<UserType>('users');

export const auth = getAuth(app);

if (useEmulators) {
  connectFirestoreEmulator(db, 'localhost', 8085);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}
