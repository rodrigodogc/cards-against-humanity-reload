import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth } from '@/firebase/config';
import { ensureProfile, saveProfile } from '@/services/users';

export interface Profile {
  nick: string;
  avatar: string;
}

export interface AuthContextProps {
  user: UserType;
  authenticated: boolean;
  isLoading: boolean;
  handleEnter: (profile: Profile) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

function toUser({ uid, displayName, photoURL }: User): UserType {
  return { uid, displayName, photoURL };
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<UserType>({} as UserType);
  const [isLoading, setIsLoading] = useState(true);

  // Quem fechou a aba entre o login anônimo e o nick ainda precisa escolher um.
  const authenticated = Boolean(user?.uid && user?.displayName);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toUser(firebaseUser) : ({} as UserType));
      setIsLoading(false);

      if (firebaseUser?.displayName) {
        ensureProfile(toUser(firebaseUser)).catch((error) => {
          console.error('error', error);
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleEnter = useCallback(async ({ nick, avatar }: Profile) => {
    const firebaseUser =
      auth.currentUser || (await signInAnonymously(auth)).user;

    const profile = {
      uid: firebaseUser.uid,
      displayName: nick,
      photoURL: avatar,
    };

    // Primeiro o banco: com o nick na sessão, o formulário não aparece de novo,
    // e uma falha aqui deixaria o jogador sem perfil.
    await saveProfile(profile);

    await updateProfile(firebaseUser, { displayName: nick, photoURL: avatar });

    // `updateProfile` não dispara `onAuthStateChanged`.
    setUser(profile);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setUser({} as UserType);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authenticated,
      handleEnter,
      handleLogout,
      isLoading,
    }),
    [user, authenticated, handleEnter, handleLogout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextProps {
  return useContext(AuthContext);
}
