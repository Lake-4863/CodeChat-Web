'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, Bookmark, User, Settings, MessageSquare, Hash } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockNotifications } from '@/lib/mockData';

const navItems = [
  { href: '/home', label: 'Home', icon: Home, key: 'h' },
  { href: '/explore', label: 'Explore', icon: Compass, key: 'e' },
  { href: '/notifications', label: 'Notifications', icon: Bell, key: 'n' },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark, key: 'b' },
  { href: '/thread', label: 'Forum', icon: Hash, key: 'f' },
  { href: '/dm', label: 'Chat', icon: MessageSquare, key: 'c' },
  { href: '/profile', label: 'Profile', icon: User, key: 'p' },
  { href: '/settings', label: 'Settings', icon: Settings, key: 's' },
];

export function SideNav() {
  const pathname = usePathname();
  const { user } = useApp();
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <nav
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-primary)' }}
      className="w-56 shrink-0 flex flex-col h-full py-4"
      aria-label="メインナビゲーション"
    >
      {/* Logo */}
      <div className="px-4 mb-6">
        <Link href="/home" className="flex items-center gap-2 no-underline">
          <Image
            src="/icon.png"
            alt="CodeChat"
            width={32}
            height={32}
            style={{ borderRadius: 6, objectFit: 'contain' }}
          />
          <span style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">CodeChat</span>
        </Link>
      </div>

      {/* Nav items */}
      <ul className="flex-1 px-2 space-y-1" role="list">
        {navItems.map(({ href, label, icon: Icon, key }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const showBadge = label === 'Notifications' && unreadCount > 0;
          return (
            <li key={href}>
              <Link
                href={href}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors relative group"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span
                    style={{ background: 'var(--red)', color: '#fff' }}
                    className="text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                  >
                    {unreadCount}
                  </span>
                )}
                <span className="kbd opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  g {key}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User */}
      <div className="px-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/profile"
          className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'ui-monospace, monospace' }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          >
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: 'var(--text-primary)' }} className="text-xs font-medium truncate">{user.displayName}</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-xs truncate">@{user.username}</div>
          </div>
        </Link>
      </div>
    </nav>
  );
}
