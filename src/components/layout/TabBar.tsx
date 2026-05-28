'use client';

import { X, Plus, Home } from 'lucide-react';
import { useTabs } from '@/context/TabContext';

const TAB_ICONS: Record<string, string> = {
  'Home': '🏠', 'Explore': '🔭', 'Notifications': '🔔', 'Bookmarks': '🔖',
  'Settings': '⚙️', 'Chat': '💬', 'Search': '🔍', 'Profile': '👤',
  'Post': '📝', 'Thread': '🧵',
};

function tabIcon(title: string): string {
  if (title.startsWith('@')) return '👤';
  if (title.startsWith('#')) return '🏷️';
  return TAB_ICONS[title] ?? '📄';
}

export function TabBar() {
  const { tabs, activeTabId, openNewTab, closeTab, switchTab } = useTabs();

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        height: 36,
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
      }}
      role="tablist"
      aria-label="タブ"
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => switchTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px 0 10px',
              minWidth: 110,
              maxWidth: 180,
              background: isActive ? 'var(--bg-primary)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRight: '1px solid var(--border)',
              borderBottom: isActive ? '2px solid var(--focus-ring)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 400,
              flexShrink: 0,
              position: 'relative',
            }}
            className="group hover:bg-[var(--bg-hover)] transition-colors"
          >
            <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>{tabIcon(tab.title)}</span>
            <span className="flex-1 truncate text-left">{tab.title}</span>
            {tabs.length > 1 && (
              <span
                onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: '50%',
                  color: 'var(--text-muted)', flexShrink: 0,
                  opacity: 0,
                }}
                className="group-hover:opacity-100 hover:!bg-[var(--bg-hover)] hover:!text-[var(--text-primary)] transition-opacity"
                role="button"
                aria-label={`${tab.title}を閉じる`}
              >
                <X size={10} />
              </span>
            )}
          </button>
        );
      })}

      {/* New tab button */}
      <button
        onClick={() => openNewTab('/home')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: '100%',
          background: 'transparent', border: 'none',
          borderRight: '1px solid var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
        }}
        className="hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        title="新しいタブ"
        aria-label="新しいタブを開く"
      >
        <Plus size={14} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Keyboard hint */}
      <div
        style={{ display: 'flex', alignItems: 'center', paddingRight: 12, color: 'var(--text-muted)', fontSize: '0.65rem', gap: 4, flexShrink: 0 }}
      >
        <span className="kbd" style={{ fontSize: '0.6rem' }}>Ctrl+T</span>
        <span>新規</span>
        <span className="kbd" style={{ marginLeft: 4, fontSize: '0.6rem' }}>Ctrl+W</span>
        <span>閉じる</span>
      </div>
    </div>
  );
}
