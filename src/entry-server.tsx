import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { FeaturesPage } from './pages/FeaturesPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ThemeProvider>
    </StaticRouter>,
  );
}
