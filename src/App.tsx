import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { RepertoireProvider } from './hooks/useRepertoire.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AllGraphsPage } from './pages/AllGraphsPage.tsx';
import { EditorPage } from './pages/EditorPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { useRepertoire } from './hooks/useRepertoire.tsx';

function AppRoutes() {
  const { state } = useRepertoire();

  if (state.isLoading) {
    return (
      <div className="h-screen bg-page text-primary flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/repertoires" element={<AllGraphsPage />} />
      <Route path="/repertoire/:id" element={<EditorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RepertoireProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RepertoireProvider>
    </ThemeProvider>
  );
}

export default App;
