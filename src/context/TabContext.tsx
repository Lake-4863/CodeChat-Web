'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface Tab {
  id: string;
  path: string;
  title: string;
}

interface TabContextValue {
  tabs: Tab[];
  activeTabId: string;
  openNewTab: (path?: string) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  notifyNavigation: (path: string, title: string) => void;
}

export const TabContext = createContext<TabContextValue | null>(null);

function titleFromPath(path: string): string {
  if (path === '/home')           return 'Home';
  if (path === '/explore')        return 'Explore';
  if (path === '/notifications')  return 'Notifications';
  if (path === '/bookmarks')      return 'Bookmarks';
  if (path === '/settings')       return 'Settings';
  if (path === '/chat')           return 'Chat';
  if (path === '/search')         return 'Search';
  if (path === '/profile')        return 'Profile';
  if (path === '/signin')         return 'Sign In';
  if (path === '/signup')         return 'Sign Up';
  if (path.startsWith('/post/'))          return 'Post';
  if (path.startsWith('/thread/'))        return 'Thread';
  if (path.startsWith('/profile/'))       return '@' + path.split('/')[2];
  if (path.startsWith('/explore/tag/'))   return '#' + path.split('/')[3];
  return 'CodeChat';
}

let tabCounter = 1;
function newTabId() { return `tab-${++tabCounter}`; }

export function TabProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', path: '/home', title: 'Home' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Sync active tab's path whenever pathname changes
  useEffect(() => {
    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, path: pathname, title: titleFromPath(pathname) }
        : t
    ));
  }, [pathname, activeTabId]);

  const openNewTab = useCallback((path = '/home') => {
    const id = newTabId();
    const title = titleFromPath(path);
    setTabs(prev => [...prev, { id, path, title }]);
    setActiveTabId(id);
    router.push(path);
  }, [router]);

  const closeTab = useCallback((id: string) => {
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTabId === id) {
      const target = next[Math.min(idx, next.length - 1)];
      setActiveTabId(target.id);
      router.push(target.path);
    }
  }, [router, tabs, activeTabId]);

  const switchTab = useCallback((id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;
    setActiveTabId(id);
    router.push(tab.path);
  }, [tabs, router]);

  const notifyNavigation = useCallback((path: string, title: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, path, title } : t));
  }, [activeTabId]);

  return (
    <TabContext.Provider value={{ tabs, activeTabId, openNewTab, closeTab, switchTab, notifyNavigation }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTabs must be inside TabProvider');
  return ctx;
}
