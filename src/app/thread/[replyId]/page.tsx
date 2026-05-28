'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Bookmark, Send, ChevronDown, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PostContent } from '@/components/feed/PostContent';
import { mockPosts, mockReplies, mockThreadReplies, currentUser } from '@/lib/mockData';
import { Post } from '@/lib/types';
import { useGlobalKey } from '@/hooks/useKeyboard';

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h前`;
  return `${Math.floor(hours / 24)}d前`;
}

function highlightMentions(text: string) {
  return text.replace(/@(\w+)/g, '<span style="color:var(--accent)">@$1</span>');
}

function Avatar({ username, size = 7 }: { username: string; size?: number }) {
  return (
    <div
      style={{
        background: 'var(--accent)', color: '#fff',
        fontFamily: 'ui-monospace, monospace',
        fontSize: size <= 6 ? '0.6rem' : '0.7rem',
        width: `${size * 4}px`, height: `${size * 4}px`,
        borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
      }}
    >
      {username[0].toUpperCase()}
    </div>
  );
}

export default function ThreadPage({ params }: { params: Promise<{ replyId: string }> }) {
  const { replyId } = use(params);
  const router = useRouter();

  // root = the reply that is the thread starter
  const allReplies = [...mockReplies, ...mockThreadReplies];
  const root = allReplies.find(r => r.id === replyId);
  // parent post of the root reply
  const parentPost = root ? mockPosts.find(p => p.id === root.parentId) : null;

  const [parentCollapsed, setParentCollapsed] = useState(false);
  const [rootLiked, setRootLiked] = useState(root?.isLiked ?? false);
  const [rootLikes, setRootLikes] = useState(root?.likesCount ?? 0);
  const [threadReplies, setThreadReplies] = useState<Post[]>(
    mockThreadReplies.filter(t => t.parentId === replyId)
  );
  const [replyContent, setReplyContent] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useGlobalKey('u', () => {
    if (parentPost) router.push(`/post/${parentPost.id}`);
    else router.back();
  });
  useGlobalKey('r', () => {
    setShowReplyBox(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  });
  useGlobalKey('j', () => setFocusedIdx(i => Math.min(threadReplies.length - 1, i + 1)));
  useGlobalKey('k', () => setFocusedIdx(i => Math.max(0, i - 1)));
  useGlobalKey('l', () => {
    if (focusedIdx === -1) {
      setRootLiked(v => !v);
      setRootLikes(n => rootLiked ? n - 1 : n + 1);
    }
  });
  useGlobalKey('Escape', () => setShowReplyBox(false));

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    const mention = root ? `@${root.author.username} ` : '';
    const newReply: Post = {
      id: `tr${Date.now()}`,
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
      parentId: replyId,
    };
    setThreadReplies(prev => [...prev, newReply]);
    setReplyContent('');
    setShowReplyBox(false);
  };

  if (!root) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p>スレッドが見つかりません</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center gap-3 px-4 py-3"
      >
        <button
          onClick={() => parentPost ? router.push(`/post/${parentPost.id}`) : router.back()}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
          title="元の投稿へ (u)"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">スレッド</h1>
        <div className="ml-auto flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          <span className="kbd">u</span><span>元の投稿</span>
          <span style={{ marginLeft: 8 }} className="kbd">r</span><span>返信</span>
        </div>
      </div>

      {/* Parent post (collapsible) */}
      {parentPost && (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setParentCollapsed(v => !v)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}
            className="hover:bg-[var(--bg-hover)] transition-colors"
          >
            {parentCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            <Avatar username={parentPost.author.username} size={5} />
            <span className="font-medium">{parentPost.author.displayName}</span>
            <span style={{ color: 'var(--text-muted)' }}>の投稿</span>
            {parentCollapsed && (
              <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                — {parentPost.content.slice(0, 40)}...
              </span>
            )}
          </button>

          {!parentCollapsed && (
            <div className="px-4 pb-4">
              <div className="flex gap-3">
                <Avatar username={parentPost.author.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{parentPost.author.displayName}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">@{parentPost.author.username}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">{formatDate(parentPost.createdAt)}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className="line-clamp-3">
                    {parentPost.content.slice(0, 120)}{parentPost.content.length > 120 ? '...' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thread root (the reply that started this thread) */}
      <article className="px-4 py-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <Avatar username={root.author.username} />
            {threadReplies.length > 0 && (
              <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 6 }} />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{root.author.displayName}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">@{root.author.username}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">{formatDate(root.createdAt)}</span>
            </div>
            <PostContent content={root.content} />
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => { setRootLiked(v => !v); setRootLikes(n => rootLiked ? n - 1 : n + 1); }}
                style={{ color: rootLiked ? 'var(--red)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                className="text-sm"
                title="いいね [l]"
              >
                <Heart size={15} fill={rootLiked ? 'var(--red)' : 'none'} /> {rootLikes}
              </button>
              <button
                onClick={() => { setShowReplyBox(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                className="text-sm hover:text-[var(--accent)]"
                title="返信 [r]"
              >
                <Send size={13} /> 返信
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Thread replies */}
      <div>
        {threadReplies.map((reply, idx) => {
          const isFocused = idx === focusedIdx;
          return (
            <div
              key={reply.id}
              className={`post-card px-4 py-4${isFocused ? ' focused' : ''}`}
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
              onFocus={() => setFocusedIdx(idx)}
              tabIndex={0}
            >
              <div className="flex gap-3">
                <Avatar username={reply.author.username} size={6} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">{reply.author.displayName}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">@{reply.author.username}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">·</span>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">{formatDate(reply.createdAt)}</span>
                  </div>
                  <PostContent content={reply.content} />
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      style={{ color: reply.isLiked ? 'var(--red)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                      className="text-xs hover:text-[var(--red)]"
                    >
                      <Heart size={12} fill={reply.isLiked ? 'var(--red)' : 'none'} /> {reply.likesCount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Reply box */}
        {showReplyBox ? (
          <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-3">
              <Avatar username={currentUser.username} />
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder={`@${root.author.username} へのスレッド返信... (Markdown・コードブロック対応)`}
                  rows={4}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSubmitReply(); }
                    if (e.key === 'Escape') setShowReplyBox(false);
                  }}
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--focus-ring)', borderRadius: '8px', color: 'var(--text-primary)', padding: '10px', fontSize: '0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
                />
                <div className="flex items-center justify-between mt-2">
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs">
                    <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> 送信 &nbsp;
                    <span className="kbd">Esc</span> キャンセル
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReplyBox(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>キャンセル</button>
                    <button
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim()}
                      style={{ background: replyContent.trim() ? 'var(--accent)' : 'var(--bg-tertiary)', color: replyContent.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: replyContent.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Send size={12} /> 返信する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            <button
              onClick={() => { setShowReplyBox(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', padding: '12px', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left' }}
              className="hover:border-[var(--focus-ring)] hover:text-[var(--text-secondary)] transition-colors"
              title="返信を書く [r]"
            >
              スレッドに返信する... <span className="kbd" style={{ float: 'right' }}>r</span>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="py-4 text-center" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-xs">
          <span className="kbd">j</span>/<span className="kbd">k</span> 移動 &nbsp;
          <span className="kbd">l</span> いいね &nbsp;
          <span className="kbd">r</span> 返信 &nbsp;
          <span className="kbd">u</span> 元の投稿へ
        </p>
      </div>
    </AppShell>
  );
}
