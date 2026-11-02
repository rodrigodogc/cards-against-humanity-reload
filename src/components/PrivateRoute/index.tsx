import { EntryScreen } from '@/components/entry-screen';
import { useAuth } from '@/contexts/AuthContext';
import { SomeLoading } from '../SomeLoading';

interface CustomRouteProps {
  children: JSX.Element;
}

export function PrivateRoute({ children }: CustomRouteProps): JSX.Element {
  const { authenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SomeLoading loading message="Carregando..." />;
  }

  // Renderiza a entrada na própria rota, sem redirecionar: assim quem abre um
  // link de convite cai direto na partida depois de escolher o nick.
  return authenticated ? children : <EntryScreen />;
}
