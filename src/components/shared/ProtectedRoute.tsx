'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/storage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace('/login');
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) return null;
  return <>{children}</>;
}
