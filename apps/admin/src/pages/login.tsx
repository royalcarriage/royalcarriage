import React from 'react';
import { useRouter } from 'next/router';

/**
 * Login page - redirects to index for authentication
 * The main authentication is handled in _app.tsx and index.tsx
 */
export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to index page which handles authentication
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
