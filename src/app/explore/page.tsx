'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { RightPanel } from '@/components/layout/RightPanel';
import { mockPosts } from '@/lib/mockData';
import { PostType } from '@/lib/types';

const tabs: { label: string; value: PostType | 'all' }[] = [
  { label: 'すべて', value: 'all' },
  { label: '投稿', value: 'post' },
  { label: '質問', value: 'question' },
  { label: '情報', value: 'info' },
  { label: '記事', value: 'article' },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PostType | 'all'>('all');

  const filtered = activeTab === 'all'
    ? mockPosts
    : mockPosts.filter(p => p.type === activeTab);

  return (
    <AppShell rightPanel={<RightPanel />}>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm mb-3">Explore</h1>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                background: activeTab === tab.value ? 'var(--bg-tertiary)' : 'none',
                color: activeTab === tab.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.value ? 'var(--border)' : 'transparent'}`,
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: activeTab === tab.value ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <FeedList posts={filtered} />
    </AppShell>
  );
}
