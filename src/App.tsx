import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '@/components/PrivateRoute';
import { AppStatus } from '@/components/app-status';
import { ThemeSync } from '@/components/theme-menu';
import { AuthProvider } from '@/contexts/AuthContext';
import { Cards } from '@/pages/Cards';
import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';
import { Matches } from '@/pages/Matches';
import { Ranking } from '@/pages/Ranking';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';

export function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <AppStatus />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/match/:id"
          element={
            <PrivateRoute>
              <Match />
            </PrivateRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <PrivateRoute>
              <Matches />
            </PrivateRoute>
          }
        />

        <Route
          path="/ranking"
          element={
            <PrivateRoute>
              <Ranking />
            </PrivateRoute>
          }
        />

        <Route path="/cards" element={<Cards />} />
      </Routes>
    </AuthProvider>
  );
}
