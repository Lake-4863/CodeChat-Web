'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types';
import { PostCard } from './PostCard';
import { useGlobalKey } from '@/hooks/useKeyboard';
import { useApp } from '@/context/AppContext';

interface FeedListProps {
  posts: Post[];
  emptyMessage?: string;
}

export function FeedList({ posts, emptyMessage = '投稿がありません' }: FeedListProps) {
  const router = useRouter();
  const { toggleLike, toggleBookmark, lastFocusedPostId, setLastFocusedPostId } = useApp();
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Restore focus when returning from a post
  useEffect(() => {
    if (lastFocusedPostId) {
      const idx = posts.findIndex(p => p.id === lastFocusedPostId);
      if (idx !== -1) setFocusedIdx(idx);
      setLastFocusedPostId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focused = posts[focusedIdx];

  const navigate = useCallback((postId: string) => {
    setLastFocusedPostId(postId);
    router.push(`/post/${postId}`);
  }, [router, setLastFocusedPostId]);

  const moveFocus = useCallback((delta: number) => {
    setFocusedIdx(prev => {
      if (prev === -1) return delta > 0 ? 0 : posts.length - 1;
      return Math.max(0, Math.min(posts.length - 1, prev + delta));
    });
  }, [posts.length]);

  useGlobalKey('j', () => moveFocus(1));
  useGlobalKey('ArrowDown', () => moveFocus(1));
  useGlobalKey('k', () => moveFocus(-1));
  useGlobalKey('ArrowUp', () => moveFocus(-1));
  useGlobalKey('Enter', () => { if (focused) navigate(focused.id); });
  useGlobalKey('o',     () => { if (focused) navigate(focused.id); });
  useGlobalKey('l',     () => { if (focused) toggleLike(focused.id); });
  useGlobalKey('b',     () => { if (focused) toggleBookmark(focused.id); });
  useGlobalKey('r',     () => { if (focused) navigate(focused.id); });
  useGlobalKey('s',     () => {
    if (focused) navigator.clipboard.writeText(`${window.location.origin}/post/${focused.id}`);
  });

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div role="feed" aria-label="投稿フィード">
      {posts.map((post, idx) => (
        <PostCard
          key={post.id}
          post={post}
          focused={idx === focusedIdx}
          onFocus={() => setFocusedIdx(idx)}
          onOpen={() => navigate(post.id)}
        />
      ))}
      <div className="py-4 text-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-xs">
          <span className="kbd">j</span>/<span className="kbd">k</span> 移動 &nbsp;
          <span className="kbd">Enter</span> 開く &nbsp;
          <span className="kbd">?</span> ヘルプ
        </p>
      </div>
    </div>
  );
}
