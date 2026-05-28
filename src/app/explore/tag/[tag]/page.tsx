'use client';

import { use } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { RightPanel } from '@/components/layout/RightPanel';
import { mockPosts } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TagFeedPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const router = useRouter();
  const tagName = decodeURIComponent(tag);

  const filtered = mockPosts.filter(p =>
    p.tags.some(t => t.toLowerCase() === tagName.toLowerCase())
  );

  return (
    <AppShell rightPanel={<RightPanel />}>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        <button
          onClick={() => router.back()}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">#{tagName}</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">{filtered.length} 件の投稿</p>
        </div>
      </div>
      <FeedList posts={filtered} emptyMessage={`#${tagName} の投稿はまだありません`} />
    </AppShell>
  );
}
