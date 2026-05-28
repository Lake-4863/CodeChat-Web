'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Home, Compass, User, Bell, Bookmark, Settings, MessageSquare, FileEdit, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Command {
  id: string;
  label: string;
  description?: string;
  kbd?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { setCommandPaletteOpen, setNewPostModalOpen, toggleTheme } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  const commands: Command[] = [
    { id: 'home', label: 'Go to Home', kbd: 'g h', icon: <Home size={14} />, action: () => { router.push('/home'); close(); } },
    { id: 'explore', label: 'Go to Explore', kbd: 'g e', icon: <Compass size={14} />, action: () => { router.push('/explore'); close(); } },
    { id: 'profile', label: 'Go to Profile', kbd: 'g p', icon: <User size={14} />, action: () => { router.push('/profile'); close(); } },
    { id: 'notifications', label: 'Go to Notifications', kbd: 'g n', icon: <Bell size={14} />, action: () => { router.push('/notifications'); close(); } },
    { id: 'bookmarks', label: 'Go to Bookmarks', kbd: 'g b', icon: <Bookmark size={14} />, action: () => { router.push('/bookmarks'); close(); } },
    { id: 'chat', label: 'Go to Chat', kbd: 'g c', icon: <MessageSquare size={14} />, action: () => { router.push('/chat'); close(); } },
    { id: 'settings', label: 'Go to Settings', kbd: 'g s', icon: <Settings size={14} />, action: () => { router.push('/settings'); close(); } },
    { id: 'new-post', label: 'New Post', kbd: 'n', icon: <FileEdit size={14} />, action: () => { setNewPostModalOpen(true); close(); } },
    { id: 'theme', label: 'Toggle Dark/Light Theme', kbd: 'g t', icon: <Sun size={14} />, action: () => { toggleTheme(); close(); } },
    { id: 'search', label: 'Search Posts', kbd: '/', icon: <Search size={14} />, action: () => { router.push('/search'); close(); } },
  ];

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(filtered.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(0, i - 1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIdx]?.action();
    }
  };

  return (
    <div className="overlay-backdrop" onClick={close} role="dialog" aria-modal="true" aria-label="コマンドパレット">
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search input */}
        <div
          style={{ borderBottom: '1px solid var(--border)' }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="コマンドを検索..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              flex: 1,
              fontSize: '0.9rem',
            }}
            aria-label="コマンド検索"
          />
          <span className="kbd text-xs">Esc</span>
        </div>

        {/* Results */}
        <div className="py-1 max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">コマンドが見つかりません</p>
            </div>
          )}
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '8px 16px',
                background: idx === selectedIdx ? 'var(--bg-hover)' : 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                textAlign: 'left',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{cmd.icon}</span>
              <span className="flex-1 text-sm">{cmd.label}</span>
              {cmd.kbd && <span className="kbd">{cmd.kbd}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
