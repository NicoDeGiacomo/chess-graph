import { Link } from 'react-router';
import { useDocumentMeta } from '../hooks/useDocumentMeta.ts';

export function NotFoundPage() {
  useDocumentMeta({
    title: 'Page Not Found — Chess Graph',
    description: 'The page you were looking for could not be found.',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg text-zinc-400 mb-8">
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
