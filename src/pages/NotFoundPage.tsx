import { Link } from 'react-router';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';
import { ThemeToggle } from '../components/ThemeToggle.tsx';

export function NotFoundPage() {
  useDocumentMeta({
    title: 'Page Not Found — Chess Graph',
    description: 'The page you were looking for could not be found.',
  });

  return (
    <div className="relative min-h-screen bg-page text-primary flex items-center justify-center">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="text-center">
        <span className="text-6xl font-bold mb-4 block" aria-hidden="true">404</span>
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-tertiary mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
