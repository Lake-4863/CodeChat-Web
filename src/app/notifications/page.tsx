'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { mockNotifications } from '@/lib/mockData';
import { Notification } from '@/lib/types';
import { Heart, MessageCircle, UserPlus, AtSign, CheckCheck } from 'lucide-react';
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

const notifIcon: Record<Notification['type'], React.ReactNode> = {
  like: <Heart size={14} style={{ color: 'var(--red)' }} />,
  reply: <MessageCircle size={14} style={{ color: 'var(--accent)' }} />,
  follow: <UserPlus size={14} style={{ color: 'var(--green)' }} />,
  mention: <AtSign size={14} style={{ color: 'var(--purple)' }} />,
};

const notifText: Record<Notification['type'], string> = {
  like: 'があなたの投稿をいいねしました',
  reply: 'があなたの投稿にリプライしました',
  follow: 'があなたをフォローしました',
  mention: 'があなたをメンションしました',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useGlobalKey('j', () => setFocusedIdx(i => Math.min(notifications.length - 1, i === -1 ? 0 : i + 1)));
  useGlobalKey('ArrowDown', () => setFocusedIdx(i => Math.min(notifications.length - 1, i === -1 ? 0 : i + 1)));
  useGlobalKey('k', () => setFocusedIdx(i => Math.max(0, i === -1 ? notifications.length - 1 : i - 1)));
  useGlobalKey('ArrowUp', () => setFocusedIdx(i => Math.max(0, i === -1 ? notifications.length - 1 : i - 1)));
  useGlobalKey('m', markAllRead);
  useGlobalKey('Enter', () => {
    const notif = notifications[focusedIdx];
    if (!notif) return;
    if (notif.post) router.push(`/post/${notif.post.id}`);
    else if (notif.type === 'follow') router.push(`/profile/${notif.from.username}`);
  });

  useEffect(() => {
    if (focusedIdx >= 0) {
      itemRefs.current[focusedIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIdx]);

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">Notifications</h1>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--red)', color: '#fff' }} className="text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            className="text-xs"
            title="全て既読 (m)"
          >
            <CheckCheck size={14} /> 全て既読
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">通知はありません</p>
        </div>
      ) : (
        <>
          <ul>
            {notifications.map((notif, idx) => {
              const isFocused = idx === focusedIdx;
              return (
                <li
                  key={notif.id}
                  ref={el => { itemRefs.current[idx] = el; }}
                  tabIndex={0}
                  onFocus={() => setFocusedIdx(idx)}
                  onClick={() => {
                    setFocusedIdx(idx);
                    if (notif.post) router.push(`/post/${notif.post.id}`);
                    else if (notif.type === 'follow') router.push(`/profile/${notif.from.username}`);
                  }}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isFocused ? 'var(--bg-hover)' : notif.read ? 'none' : 'rgba(88, 166, 255, 0.04)',
                    borderLeft: isFocused ? '2px solid var(--focus-ring)' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  className="px-4 py-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{notifIcon[notif.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'var(--text-primary)' }} className="text-sm">
                        <Link href={`/profile/${notif.from.username}`} onClick={e => e.stopPropagation()} className="font-semibold">
                          @{notif.from.username}
                        </Link>
                        {' '}{notifText[notif.type]}
                      </p>
                      {notif.post && (
                        <p style={{ color: 'var(--text-muted)' }} className="text-xs truncate mt-1">
                          {notif.post.content.slice(0, 60)}...
                        </p>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs shrink-0">{formatDate(notif.createdAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="py-4 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-xs">
              <span className="kbd">j</span>/<span className="kbd">k</span> 移動 &nbsp;
              <span className="kbd">Enter</span> 開く &nbsp;
              <span className="kbd">m</span> 全て既読
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}
