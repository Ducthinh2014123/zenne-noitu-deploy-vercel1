import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Redirect / -> /auth/login
export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/auth/login'); }, [router]);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
    </div>
  );
}
