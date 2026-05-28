'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useApp();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !username.trim() || !password) return;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('ユーザー名は英数字とアンダースコアのみ使えます');
      return;
    }
    setLoading(true);
    setError('');
    const err = await signUp(
      email.trim(),
      password,
      username.trim().toLowerCase(),
      displayName.trim() || username.trim(),
    );
    setLoading(false);
    if (err) { setError(err); return; }
    router.push('/home');
  };

  const fields = [
    { label: 'メールアドレス *', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
    { label: 'ユーザー名 * (英数字・_)', value: username, setter: setUsername, type: 'text', placeholder: 'your_username' },
    { label: '表示名 (省略可)', value: displayName, setter: setDisplayName, type: 'text', placeholder: 'Your Name' },
    { label: 'パスワード * (6文字以上)', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div className="text-center mb-8">
          <div style={{ margin: '0 auto 12px', width: 48, height: 48 }}>
            <Image src="/icon.png" alt="CodeChat" width={48} height={48} style={{ borderRadius: 12, objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'var(--text-primary)' }} className="font-bold text-xl">CodeChat</h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">コーダーのSNSに参加しよう</p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm mb-5">新規登録</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(field => (
              <div key={field.label}>
                <label style={{ color: 'var(--text-secondary)' }} className="block text-xs mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
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
              disabled={loading || !email.trim() || !username.trim() || !password}
              style={{ width: '100%', background: email.trim() && username.trim() && password ? 'var(--accent)' : 'var(--bg-tertiary)', color: email.trim() && username.trim() && password ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? '作成中...' : 'アカウントを作成'}
            </button>
          </form>
        </div>

        <p style={{ color: 'var(--text-muted)' }} className="text-center text-xs mt-4">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/signin" style={{ color: 'var(--accent)' }}>ログイン</Link>
        </p>
      </div>
    </div>
  );
}
