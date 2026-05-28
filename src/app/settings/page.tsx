'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/context/AppContext';
import { Sun, Moon, LogOut, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, theme, toggleTheme } = useApp();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div
        style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)', zIndex: 10 }}
        className="px-4 py-3"
      >
        <h1 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Profile section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              プロフィール
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label style={{ color: 'var(--text-secondary)' }} className="block text-xs mb-1">表示名</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--focus-ring)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)' }} className="block text-xs mb-1">ユーザー名</label>
              <input
                value={`@${user.username}`}
                readOnly
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)' }} className="block text-xs mb-1">自己紹介</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = 'var(--focus-ring)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <button
              onClick={handleSave}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {saved ? '保存しました ✓' : '変更を保存'}
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sun size={14} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              表示設定
            </h2>
          </div>
          <div
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}
          >
            <button
              onClick={toggleTheme}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span className="text-sm">{theme === 'dark' ? 'ダークテーマ' : 'ライトテーマ'}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">g t で切替</span>
            </button>
          </div>
        </section>

        {/* Account */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={14} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              アカウント
            </h2>
          </div>
          <div
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}
          >
            <button
              onClick={() => router.push('/')}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <LogOut size={14} />
              <span className="text-sm">ログアウト</span>
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
