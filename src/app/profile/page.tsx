'use client';

import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { mockPosts } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useApp();
  const userPosts = mockPosts.filter(p => p.author.id === user.id || p.author.username === user.username);

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center justify-between px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">Profile</h1>
        <Link href="/settings" style={{ color: 'var(--text-muted)' }}>
          <Settings size={16} />
        </Link>
      </div>

      {/* Profile header */}
      <div className="px-4 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace' }}
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
          >
            {user.username[0].toUpperCase()}
          </div>
          <Link
            href="/settings"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 500 }}
          >
            プロフィール編集
          </Link>
        </div>

        <div className="mb-3">
          <h2 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg leading-tight">{user.displayName}</h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">@{user.username}</p>
        </div>

        {user.bio && (
          <p style={{ color: 'var(--text-primary)' }} className="text-sm mb-3">{user.bio}</p>
        )}

        <div className="flex gap-4">
          <span style={{ color: 'var(--text-primary)' }} className="text-sm">
            <strong>{user.followingCount}</strong> <span style={{ color: 'var(--text-muted)' }}>フォロー中</span>
          </span>
          <span style={{ color: 'var(--text-primary)' }} className="text-sm">
            <strong>{user.followersCount}</strong> <span style={{ color: 'var(--text-muted)' }}>フォロワー</span>
          </span>
          <span style={{ color: 'var(--text-primary)' }} className="text-sm">
            <strong>{user.postsCount}</strong> <span style={{ color: 'var(--text-muted)' }}>投稿</span>
          </span>
        </div>
      </div>

      <FeedList
        posts={userPosts}
        emptyMessage="まだ投稿がありません。nキーで最初の投稿を！"
      />
    </AppShell>
  );
}
