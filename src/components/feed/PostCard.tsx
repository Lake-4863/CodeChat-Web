'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, Share2, CheckCircle } from 'lucide-react';
import { Post, PostType } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { PostContent } from './PostContent';

const typeLabel: Record<PostType, string> = {
  post: '投稿',
  question: '質問',
  info: '情報',
  article: '記事',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface PostCardProps {
  post: Post;
  focused?: boolean;
  onFocus?: () => void;
  onOpen?: () => void;
}

export function PostCard({ post, focused, onFocus, onOpen }: PostCardProps) {
  const router = useRouter();
  const { toggleLike, toggleBookmark } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focused) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focused]);

  const handleOpen = onOpen ?? (() => router.push(`/post/${post.id}`));
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  return (
    <div
      ref={ref}
      className={`post-card px-4 py-4 cursor-pointer${focused ? ' focused' : ''}`}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onClick={handleOpen}
      tabIndex={0}
      onFocus={onFocus}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === 'o') handleOpen();
        if (e.key === 'l') { e.stopPropagation(); toggleLike(post.id); }
        if (e.key === 'b') { e.stopPropagation(); toggleBookmark(post.id); }
        if (e.key === 's') { e.stopPropagation(); handleCopyLink(); }
      }}
      role="article"
      aria-label={`${post.author.displayName}の投稿`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={`/profile/${post.author.username}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-2 hover:underline"
          style={{ color: 'var(--text-primary)' }}
        >
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem' }}
            className="w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0"
          >
            {post.author.username[0].toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{post.author.displayName}</span>
          <span style={{ color: 'var(--text-muted)' }} className="text-xs">@{post.author.username}</span>
        </Link>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">{formatDate(post.createdAt)}</span>
        <div className="ml-auto flex items-center gap-2">
          {post.type !== 'post' && (
            <span className={`type-badge type-${post.type}`}>{typeLabel[post.type]}</span>
          )}
          {post.type === 'question' && post.isSolved && (
            <CheckCircle size={14} style={{ color: 'var(--green)' }} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-3 ml-8">
        <PostContent content={post.content} />
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {post.mediaUrls.map((url, i) =>
              post.mediaTypes?.[i] === 'video' ? (
                <video
                  key={i} src={url} controls
                  style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8, border: '1px solid var(--border)' }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i} src={url} alt="添付画像"
                  style={{ maxWidth: 300, maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
                  onClick={e => e.stopPropagation()}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 ml-8">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/explore/tag/${tag.toLowerCase()}`}
              onClick={e => e.stopPropagation()}
              className="tag-badge"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 ml-8">
        <ActionBtn
          icon={<Heart size={14} fill={post.isLiked ? 'var(--red)' : 'none'} />}
          count={post.likesCount}
          active={post.isLiked}
          activeColor="var(--red)"
          label="いいね [l]"
          onClick={e => { e.stopPropagation(); toggleLike(post.id); }}
          kbd="l"
        />
        <ActionBtn
          icon={<MessageCircle size={14} />}
          count={post.repliesCount}
          label="リプライ [r]"
          onClick={e => { e.stopPropagation(); router.push(`/post/${post.id}`); }}
          kbd="r"
        />
        <ActionBtn
          icon={<Bookmark size={14} fill={post.isBookmarked ? 'var(--accent)' : 'none'} />}
          count={post.bookmarksCount}
          active={post.isBookmarked}
          activeColor="var(--accent)"
          label="ブックマーク [b]"
          onClick={e => { e.stopPropagation(); toggleBookmark(post.id); }}
          kbd="b"
        />
        <ActionBtn
          icon={<Share2 size={14} />}
          label="共有 [s]"
          onClick={e => { e.stopPropagation(); handleCopyLink(); }}
          kbd="s"
        />
      </div>
    </div>
  );
}

function ActionBtn({
  icon, count, active, activeColor, label, onClick, kbd,
}: {
  icon: React.ReactNode;
  count?: number;
  active?: boolean;
  activeColor?: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  kbd: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 group"
      style={{ color: active ? activeColor : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
      title={label}
      aria-label={label}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {count !== undefined && (
        <span className="text-xs">{count}</span>
      )}
    </button>
  );
}
