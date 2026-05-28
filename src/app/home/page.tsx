'use client';

import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { RightPanel } from '@/components/layout/RightPanel';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const { posts, postsLoading, setNewPostModalOpen } = useApp();

  return (
    <AppShell rightPanel={<RightPanel />}>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center justify-between px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">Home</h1>
        <button
          onClick={() => setNewPostModalOpen(true)}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          title="新規投稿 (n)"
        >
          <Plus size={14} /> 新規投稿
        </button>
      </div>

      {/* Feed */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">読み込み中...</p>
        </div>
      ) : (
        <FeedList posts={posts} emptyMessage="まだ投稿はありません。最初に投稿しましょう！" />
      )}
    </AppShell>
  );
}
