'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { mockPosts } from '@/lib/mockData';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? mockPosts.filter(p =>
        p.content.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        p.author.username.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm mb-3">Search</h1>
        <div
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
          className="flex items-center gap-2 px-3 py-2"
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="投稿・タグ・ユーザーを検索..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', flex: 1, fontSize: '0.875rem' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>
      </div>

      {query.trim() === '' ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
          <Search size={32} />
          <p className="text-sm">キーワードを入力して検索</p>
          <p className="text-xs">投稿内容、タグ、ユーザー名で検索できます</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">「{query}」の検索結果はありません</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">{results.length} 件見つかりました</p>
          </div>
          <FeedList posts={results} />
        </>
      )}
    </AppShell>
  );
}
