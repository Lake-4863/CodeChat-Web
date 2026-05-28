'use client';

import { ReactNode } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { TabProvider, useTabs } from '@/context/TabContext';
import { TabBar } from '@/components/layout/TabBar';
import { CommandPalette } from '@/components/overlay/CommandPalette';
import { ShortcutHelp } from '@/components/overlay/ShortcutHelp';
import { NewPostModal } from '@/components/post/NewPostModal';
import { useGlobalKey } from '@/hooks/useKeyboard';

function GlobalKeyboardHandler() {
  const { openNewTab, closeTab, activeTabId } = useTabs();
  const { setCommandPaletteOpen, setShortcutHelpOpen, setNewPostModalOpen } = useApp();

  useGlobalKey('t', () => openNewTab('/home'), { ctrl: true });
  useGlobalKey('w', () => closeTab(activeTabId), { ctrl: true });
  useGlobalKey('k', () => setCommandPaletteOpen(true), { ctrl: true });
  useGlobalKey('?', () => setShortcutHelpOpen(true));
  useGlobalKey('Escape', () => {
    setCommandPaletteOpen(false);
    setShortcutHelpOpen(false);
    setNewPostModalOpen(false);
  });

  return null;
}

function GlobalOverlays() {
  const { isCommandPaletteOpen, isShortcutHelpOpen, isNewPostModalOpen } = useApp();
  return (
    <>
      {isCommandPaletteOpen && <CommandPalette />}
      {isShortcutHelpOpen && <ShortcutHelp />}
      {isNewPostModalOpen && <NewPostModal />}
    </>
  );
}

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <TabProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TabBar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        <GlobalKeyboardHandler />
        <GlobalOverlays />
      </TabProvider>
    </AppProvider>
  );
}
