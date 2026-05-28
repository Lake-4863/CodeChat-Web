'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push('/home');
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div className="text-center mb-8">
          <div style={{ margin: '0 auto 12px', width: 48, height: 48 }}>
            <Image src="/icon.png" alt="CodeChat" width={48} height={48} style={{ borderRadius: 12, objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'var(--text-primary)' }} className="font-bold text-xl">CodeChat</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">キーボードファーストなコーダー向けSNS</p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm mb-5">ログイン</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { label: 'メールアドレス', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'パスワード', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.label}>
                <label style={{ color: 'var(--text-secondary)' }} className="block text-xs mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--focus-ring)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}

            {error && (
              <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              style={{ width: '100%', background: email.trim() && password ? 'var(--accent)' : 'var(--bg-tertiary)', color: email.trim() && password ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <p style={{ color: 'var(--text-muted)' }} className="text-center text-xs mt-4">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" style={{ color: 'var(--accent)' }}>新規登録</Link>
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-center text-xs mt-2">
          <span className="kbd">Enter</span> でログイン
        </p>
      </div>
    </div>
  );
}
