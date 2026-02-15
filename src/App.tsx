import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { RepertoireProvider } from './hooks/useRepertoire.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AllGraphsPage } from './pages/AllGraphsPage.tsx';
import { EditorPage } from './pages/EditorPage.tsx';
import { useRepertoire } from './hooks/useRepertoire.tsx';

function AppRoutes() {
  const { state } = useRepertoire();

  if (state.isLoading) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/repertoires" element={<AllGraphsPage />} />
      <Route path="/repertoire/:id" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <RepertoireProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RepertoireProvider>
  );
}

export default App;
