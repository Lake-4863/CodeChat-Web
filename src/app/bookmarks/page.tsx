'use client';

import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { useApp } from '@/context/AppContext';

export default function BookmarksPage() {
  const { posts } = useApp();
  const bookmarked = posts.filter(p => p.isBookmarked);

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">Bookmarks</h1>
        {bookmarked.length > 0 && (
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">{bookmarked.length} 件保存済み</p>
        )}
      </div>

      <FeedList
        posts={bookmarked}
        emptyMessage="ブックマークがありません。投稿を選んで b キーを押してください"
      />
    </AppShell>
  );
}
