'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { FeedList } from '@/components/feed/FeedList';
import { mockUsers, mockPosts } from '@/lib/mockData';

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const user = mockUsers.find(u => u.username === username);
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing ?? false);

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p>ユーザーが見つかりません</p>
        </div>
      </AppShell>
    );
  }

  const userPosts = user.isPrivate && !isFollowing
    ? []
    : mockPosts.filter(p => p.author.username === username);

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        <button onClick={() => router.back()} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{user.displayName}</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">{user.postsCount} 件の投稿</p>
        </div>
      </div>

      <div className="px-4 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace' }}
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
          >
            {user.username[0].toUpperCase()}
          </div>
          <button
            onClick={() => setIsFollowing(f => !f)}
            style={{
              background: isFollowing ? 'none' : 'var(--accent)',
              color: isFollowing ? 'var(--text-primary)' : '#fff',
              border: `1px solid ${isFollowing ? 'var(--border)' : 'var(--accent)'}`,
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {isFollowing ? 'フォロー中' : 'フォロー'}
          </button>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h2 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg leading-tight">{user.displayName}</h2>
            {user.isPrivate && <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">@{user.username}</p>
        </div>

        {user.bio && <p style={{ color: 'var(--text-primary)' }} className="text-sm mb-3">{user.bio}</p>}

        <div className="flex gap-4">
          <span style={{ color: 'var(--text-primary)' }} className="text-sm">
            <strong>{user.followingCount}</strong> <span style={{ color: 'var(--text-muted)' }}>フォロー中</span>
          </span>
          <span style={{ color: 'var(--text-primary)' }} className="text-sm">
            <strong>{user.followersCount}</strong> <span style={{ color: 'var(--text-muted)' }}>フォロワー</span>
          </span>
        </div>
      </div>

      {user.isPrivate && !isFollowing ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
          <Lock size={28} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>鍵アカウント</p>
          <p className="text-xs">フォローするとこのアカウントの投稿が表示されます</p>
        </div>
      ) : (
        <FeedList posts={userPosts} emptyMessage="まだ投稿がありません" />
      )}
    </AppShell>
  );
}
