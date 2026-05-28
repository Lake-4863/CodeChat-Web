'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SideNav } from './SideNav';
import { useApp } from '@/context/AppContext';
import { useGlobalKey, useGPrefix } from '@/hooks/useKeyboard';

export function AppShell({ children, rightPanel }: { children: ReactNode; rightPanel?: ReactNode }) {
  const router = useRouter();
  const { setNewPostModalOpen, toggleTheme, isAuthenticated, authLoading } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/signin');
  }, [authLoading, isAuthenticated, router]);

  useGlobalKey('n', () => setNewPostModalOpen(true));
  useGlobalKey('/', () => router.push('/search'));

  useGPrefix({
    h: () => router.push('/home'),
    e: () => router.push('/explore'),
    p: () => router.push('/profile'),
    n: () => router.push('/notifications'),
    b: () => router.push('/bookmarks'),
    s: () => router.push('/settings'),
    f: () => router.push('/thread'),
    c: () => router.push('/dm'),
    t: () => toggleTheme(),
  });

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <SideNav />

      <main className="flex-1 flex h-full overflow-hidden">
        <div className="flex-1 max-w-2xl mx-auto w-full overflow-y-auto" style={{ borderRight: '1px solid var(--border)' }}>
          {children}
        </div>

        {rightPanel && (
          <aside className="w-72 shrink-0 hidden xl:block px-4 py-6 overflow-y-auto">
            {rightPanel}
          </aside>
        )}
      </main>
    </div>
  );
}
