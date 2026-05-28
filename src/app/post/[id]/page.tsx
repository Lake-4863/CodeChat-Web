'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Send } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PostContent } from '@/components/feed/PostContent';
import { mockPosts, mockReplies, currentUser } from '@/lib/mockData';
import { Post } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useGlobalKey } from '@/hooks/useKeyboard';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const typeLabel: Record<string, string> = { post: '投稿', question: '質問', info: '情報', article: '記事' };

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { posts, toggleLike, toggleBookmark } = useApp();
  const [replyContent, setReplyContent] = useState('');
  const [localReplies, setLocalReplies] = useState<Post[]>(
    mockReplies.filter(r => r.parentId === id)
  );
  const [showReplyBox, setShowReplyBox] = useState(false);

  const post = posts.find(p => p.id === id) ?? mockPosts.find(p => p.id === id);

  useGlobalKey('u', () => router.back());
  useGlobalKey('r', () => setShowReplyBox(true));
  useGlobalKey('l', () => { if (post) toggleLike(post.id); });
  useGlobalKey('b', () => { if (post) toggleBookmark(post.id); });
  useGlobalKey('s', () => { navigator.clipboard.writeText(window.location.href); });

  if (!post) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p>投稿が見つかりません</p>
        </div>
      </AppShell>
    );
  }

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    const reply: Post = {
      id: `r${Date.now()}`,
      author: currentUser,
      content: replyContent.trim(),
      type: 'post',
      tags: [],
      likesCount: 0,
      repliesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isBookmarked: false,
      parentId: post.id,
    };
    setLocalReplies(prev => [...prev, reply]);
    setReplyContent('');
    setShowReplyBox(false);
  };

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        <button
          onClick={() => router.back()}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
          title="戻る (u)"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">投稿</h1>
        <span className="kbd ml-auto">u</span>
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">戻る</span>
      </div>

      {/* Main post */}
      <article className="px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem' }}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            {post.author.username[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{post.author.displayName}</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-xs">@{post.author.username}</div>
          </div>
          <div className="ml-auto">
            <span className={`type-badge type-${post.type}`}>{typeLabel[post.type]}</span>
          </div>
        </div>

        <PostContent content={post.content} />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="tag-badge">#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }} className="text-xs mt-4 pt-3">
          {formatDate(post.createdAt)}
        </div>

        {/* Stats */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }} className="flex gap-6 py-3 mt-3">
          <span style={{ color: 'var(--text-primary)' }} className="text-sm"><strong>{post.repliesCount}</strong> <span style={{ color: 'var(--text-muted)' }}>リプライ</span></span>
          <span style={{ color: 'var(--text-primary)' }} className="text-sm"><strong>{post.likesCount}</strong> <span style={{ color: 'var(--text-muted)' }}>いいね</span></span>
          <span style={{ color: 'var(--text-primary)' }} className="text-sm"><strong>{post.bookmarksCount}</strong> <span style={{ color: 'var(--text-muted)' }}>ブックマーク</span></span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 pt-2">
          {[
            { icon: <MessageCircle size={18} />, label: 'リプライ [r]', onClick: () => setShowReplyBox(true) },
            { icon: <Heart size={18} fill={post.isLiked ? 'var(--red)' : 'none'} />, label: 'いいね [l]', active: post.isLiked, color: 'var(--red)', onClick: () => toggleLike(post.id) },
            { icon: <Bookmark size={18} fill={post.isBookmarked ? 'var(--accent)' : 'none'} />, label: 'ブックマーク [b]', active: post.isBookmarked, color: 'var(--accent)', onClick: () => toggleBookmark(post.id) },
            { icon: <Share2 size={18} />, label: '共有 [s]', onClick: () => navigator.clipboard.writeText(window.location.href) },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} style={{ color: btn.active ? btn.color : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} className="hover:scale-110 transition-transform" title={btn.label}>
              {btn.icon}
            </button>
          ))}
        </div>
      </article>

      {/* Reply box */}
      {showReplyBox && (
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-3">
            <div
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem' }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 mt-1"
            >
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`@${post.author.username} へのリプライ...`}
                rows={3}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSubmitReply(); } if (e.key === 'Escape') setShowReplyBox(false); }}
                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--focus-ring)', borderRadius: '8px', color: 'var(--text-primary)', padding: '10px', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button onClick={() => setShowReplyBox(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>キャンセル</button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  style={{ background: replyContent.trim() ? 'var(--accent)' : 'var(--bg-tertiary)', color: replyContent.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: replyContent.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Send size={12} /> 返信
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      <div>
        {localReplies.length === 0 && !showReplyBox && (
          <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">まだリプライはありません</p>
            <button onClick={() => setShowReplyBox(true)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', marginTop: 8 }}>
              最初にリプライする
            </button>
          </div>
        )}
        {localReplies.map(reply => (
          <div key={reply.id} className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem' }} className="w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">
                {reply.author.username[0].toUpperCase()}
              </div>
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{reply.author.displayName}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">@{reply.author.username}</span>
            </div>
            <div className="ml-8">
              <PostContent content={reply.content} />
              <div className="flex items-center gap-4 mt-2">
                <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }} className="text-xs hover:text-[var(--red)]">
                  <Heart size={12} /> {reply.likesCount}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
