'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/shared/SplashScreen';
import { getSession } from '@/lib/storage';

const SPLASH_DURATION_MS = 1100;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setTimeout(() => {
      const session = getSession();
      router.replace(session ? '/dashboard' : '/login');
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(id);
  }, [router]);

  return <SplashScreen />;
}
