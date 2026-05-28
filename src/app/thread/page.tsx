'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, Send, Settings, Paperclip, X } from 'lucide-react';
import Image from 'next/image';
import { Channel, Message } from '@/lib/types';
import { useGPrefix } from '@/hooks/useKeyboard';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  fetchChannels,
  fetchChannelMessages,
  insertChannelMessage,
  fetchOneChannelMessage,
} from '@/lib/api/forum';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type Attachment = { url: string; type: 'image' | 'video'; name: string };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export default function ForumPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useApp();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'list' | 'open'>('list');
  const [hoveredId, setHoveredId] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachError, setAttachError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useGPrefix({
    h: () => router.push('/home'),
    e: () => router.push('/explore'),
    p: () => router.push('/profile'),
    n: () => router.push('/notifications'),
    b: () => router.push('/bookmarks'),
    s: () => router.push('/settings'),
    c: () => router.push('/dm'),
  });

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels().then(chs => {
      setChannels(chs);
      if (chs.length > 0) {
        setActiveId(chs[0].id);
        setHoveredId(chs[0].id);
      }
    });
  }, []);

  // Fetch messages + realtime subscription when active channel changes
  useEffect(() => {
    if (!activeId) return;
    fetchChannelMessages(activeId).then(setMessages);

    const sub = supabase
      .channel(`forum:${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'channel_messages', filter: `channel_id=eq.${activeId}` },
        async (payload) => {
          const newId = (payload.new as { id: string }).id;
          const msg = await fetchOneChannelMessage(newId);
          if (msg) {
            setMessages(prev => prev.some(m => m.id === newId) ? prev : [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [activeId]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = tag === 'TEXTAREA' || tag === 'INPUT' || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape' && mode === 'open') {
        e.preventDefault();
        setMode('list');
        setHoveredId(activeId);
        (document.activeElement as HTMLElement)?.blur();
        return;
      }

      if (isEditable) return;

      if (mode === 'open') {
        if (e.key === '/') {
          e.preventDefault();
          inputRef.current?.focus();
          return;
        }
      }

      if (mode === 'list') {
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          const hIdx = channels.findIndex(c => c.id === hoveredId);
          if (hIdx < channels.length - 1) setHoveredId(channels[hIdx + 1].id);
        } else if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          const hIdx = channels.findIndex(c => c.id === hoveredId);
          if (hIdx > 0) setHoveredId(channels[hIdx - 1].id);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (hoveredId) { setActiveId(hoveredId); setMode('open'); }
        }
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [mode, activeId, hoveredId, channels]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  const activeChannel = channels.find(c => c.id === activeId);

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

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!isAuthenticated || !activeId) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      author: user,
      content: input.trim(),
      channelId: activeId,
      createdAt: new Date().toISOString(),
      mediaUrls: attachments.length > 0 ? attachments.map(a => a.url) : undefined,
      mediaTypes: attachments.length > 0 ? attachments.map(a => a.type) : undefined,
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setAttachments([]);

    const realId = await insertChannelMessage({
      channelId: activeId,
      authorId: user.id,
      content: optimistic.content,
    });

    if (realId) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: realId } : m));
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)' }} className="flex h-full">
      {/* Sidebar */}
      <nav
        style={{ width: 220, borderRight: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}
        aria-label="フォーラムナビゲーション"
      >
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }} className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="CodeChat"
            width={28}
            height={28}
            style={{ borderRadius: 6, cursor: 'pointer', objectFit: 'contain' }}
            onClick={() => router.push('/home')}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>Forum</span>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-3 mb-1">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              フォーラム
            </span>
          </div>
          {channels.map(ch => {
            const isActive = ch.id === activeId;
            const isCursor = mode === 'list' && ch.id === hoveredId;
            return (
              <div
                key={ch.id}
                tabIndex={0}
                onClick={() => { setActiveId(ch.id); setHoveredId(ch.id); setMode('open'); }}
                style={{
                  padding: '5px 12px',
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-tertiary)' : isCursor ? 'var(--bg-secondary)' : 'none',
                  color: isActive || isCursor ? 'var(--text-primary)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  borderLeft: isActive ? '2px solid var(--focus-ring)' : isCursor ? '2px solid var(--text-muted)' : '2px solid transparent',
                  fontSize: '0.875rem',
                }}
                className="hover:bg-[var(--bg-hover)] transition-colors"
                aria-selected={isActive}
              >
                <Hash size={13} style={{ flexShrink: 0 }} />
                <span className="flex-1 truncate">{ch.name}</span>
                {ch.unreadCount > 0 && (
                  <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: '0.65rem' }}>
                    {ch.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }} className="flex items-center gap-2">
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem', width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }}
            className="flex items-center justify-center font-bold"
          >
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }} className="truncate">{user.displayName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }} className="truncate">@{user.username}</div>
          </div>
          <button
            onClick={() => router.push('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', flexShrink: 0 }}
            title="設定"
          >
            <Settings size={13} />
          </button>
        </div>
      </nav>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', flexShrink: 0 }} className="flex items-center gap-2">
          <Hash size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{activeChannel?.name}</span>
          {activeChannel?.description && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>— {activeChannel.description}</span>
          )}
          <div className="ml-auto flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            <span className="kbd">g h</span><span>Home</span>
            <span style={{ marginLeft: 8 }} className="kbd">g c</span><span>Chat</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" tabIndex={0} style={{ outline: 'none' }}>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">まだメッセージはありません</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.author.id === user.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div
                  style={{
                    background: 'var(--accent)', color: '#fff',
                    fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginTop: 2,
                  }}
                >
                  {msg.author.username[0].toUpperCase()}
                </div>
                <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>{msg.author.displayName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{formatTime(msg.createdAt)}</span>
                  </div>
                  {(msg.content || (msg.mediaUrls && msg.mediaUrls.length > 0)) && (
                    <div
                      style={{
                        background: isMe ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        borderRadius: 10, padding: '8px 12px', fontSize: '0.875rem',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content && <span>{msg.content}</span>}
                      {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                        <div style={{ marginTop: msg.content ? 8 : 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {msg.mediaUrls.map((url, i) =>
                            msg.mediaTypes?.[i] === 'video' ? (
                              <video key={i} src={url} controls style={{ maxWidth: 240, borderRadius: 6 }} />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url} alt="添付画像" style={{ maxWidth: 240, borderRadius: 6, display: 'block' }} />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', flexShrink: 0 }}>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {attachments.map((a, i) => (
                <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                  {a.type === 'video' ? (
                    <video src={a.url} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
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
            <p style={{ color: 'var(--red)', fontSize: '0.7rem', marginBottom: 4 }}>{attachError}</p>
          )}
          <div
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10 }}
            className="flex items-end gap-2 px-3 py-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
              title="画像・動画を添付（画像 10MB / 動画 50MB）"
            >
              <Paperclip size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`#${activeChannel?.name ?? '...'} にメッセージを送る... (Ctrl+Enter で送信)`}
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.875rem',
                resize: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
            <button
              onClick={handleSend}
              style={{ color: (input.trim() || attachments.length > 0) ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: (input.trim() || attachments.length > 0) ? 'pointer' : 'default', padding: '2px' }}
              title="送信 (Ctrl+Enter)"
            >
              <Send size={16} />
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4 }}>
            <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> 送信 &nbsp;
            <span className="kbd">/</span> 入力欄へ &nbsp;
            <span className="kbd">j</span>/<span className="kbd">k</span> フォーラム選択 &nbsp;
            <span className="kbd">Enter</span> 開く &nbsp;
            <span className="kbd">Esc</span> リストに戻る &nbsp;
            <span className="kbd">g h</span> Home へ
          </p>
        </div>
      </div>
    </div>
  );
}
