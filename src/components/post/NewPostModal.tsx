'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Code, Send, Paperclip } from 'lucide-react';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type Attachment = { url: string; type: 'image' | 'video'; name: string };
import { useApp } from '@/context/AppContext';
import { Post, PostType } from '@/lib/types';

const postTypes: { value: PostType; label: string }[] = [
  { value: 'post', label: '投稿' },
  { value: 'question', label: '質問' },
  { value: 'info', label: '情報' },
  { value: 'article', label: '記事' },
];

export function NewPostModal() {
  const { setNewPostModalOpen, addPost, user } = useApp();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('post');
  const [tags, setTags] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachError, setAttachError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const close = () => setNewPostModalOpen(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachError('');
    const next: Attachment[] = [];
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const limitLabel = isVideo ? '50MB' : '10MB';
      if (file.size > limit) {
        setAttachError(`${file.name} はサイズ制限（${limitLabel}）を超えています`);
        continue;
      }
      next.push({ url: URL.createObjectURL(file), type: isVideo ? 'video' : 'image', name: file.name });
    }
    setAttachments(prev => [...prev, ...next]);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;
    const tagList = tags.split(/[\s,]+/).filter(t => t.startsWith('#') ? t.slice(1) : t).map(t => t.replace(/^#/, '')).filter(Boolean);
    const newPost: Post = {
      id: `p${Date.now()}`,
      author: user,
      content: content.trim(),
      type: postType,
      tags: tagList,
      likesCount: 0,
      repliesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isBookmarked: false,
      mediaUrls: attachments.map(a => a.url),
      mediaTypes: attachments.map(a => a.type),
    };
    await addPost(newPost);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSubmit(); return; }
    if (e.key.toLowerCase() === 'k' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const pos = ta.selectionStart;
      const insert = '\n```\n\n```\n';
      setContent(c => c.slice(0, pos) + insert + c.slice(pos));
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = pos + 5;
        ta.focus();
      }, 0);
    }
  };

  const charCount = content.length;
  const maxChars = 2000;
  const remaining = maxChars - charCount;

  return (
    <div className="overlay-backdrop" onClick={close} role="dialog" aria-modal="true" aria-label="新規投稿">
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border)' }} className="flex items-center justify-between px-4 py-3">
          <h2 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">新規投稿</h2>
          <button onClick={close} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Post type */}
          <div className="flex gap-2">
            {postTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setPostType(t.value)}
                style={{
                  background: postType === t.value ? 'var(--bg-hover)' : 'none',
                  border: `1px solid ${postType === t.value ? 'var(--focus-ring)' : 'var(--border)'}`,
                  color: postType === t.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: postType === t.value ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <div
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem' }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0"
            >
              {user.username[0].toUpperCase()}
            </div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">@{user.username}</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="何か書く... (Markdown対応、Ctrl+Shift+Kでコードブロック)"
            rows={6}
            maxLength={maxChars}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '12px',
              fontSize: '0.875rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--focus-ring)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {attachments.map((a, i) => (
                <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                  {a.type === 'video' ? (
                    <video src={a.url} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: '50%', width: 16, height: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 0, color: 'var(--text-muted)',
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachError && (
            <p style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{attachError}</p>
          )}

          {/* Tags */}
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="#TypeScript #React タグをスペース区切りで"
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              fontSize: '0.8rem',
              outline: 'none',
              fontFamily: 'ui-monospace, monospace',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--focus-ring)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />

          {/* Footer */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const pos = textareaRef.current?.selectionStart ?? content.length;
                  const insert = '\n```\n\n```\n';
                  setContent(c => c.slice(0, pos) + insert + c.slice(pos));
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                className="text-xs hover:text-[var(--text-primary)]"
                title="コードブロックを挿入 (Ctrl+Shift+K)"
              >
                <Code size={14} /> コード
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                className="text-xs hover:text-[var(--text-primary)]"
                title="画像・動画を添付（画像 10MB / 動画 50MB）"
              >
                <Paperclip size={14} /> メディア
              </button>
              <span style={{ color: remaining < 100 ? 'var(--red)' : 'var(--text-muted)' }} className="text-xs">
                {remaining}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || remaining < 0}
              style={{
                background: content.trim() && remaining >= 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: content.trim() && remaining >= 0 ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: content.trim() && remaining >= 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              title="投稿 (Ctrl+Enter)"
            >
              <Send size={13} /> 投稿
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs text-right">
            <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> で送信
          </p>
        </div>
      </div>
    </div>
  );
}
