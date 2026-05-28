'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { trendingTags } from '@/lib/mockData';

export function RightPanel() {
  return (
    <div className="space-y-6">
      {/* Trending tags */}
      <div
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px' }}
        className="overflow-hidden"
      >
        <div style={{ borderBottom: '1px solid var(--border)' }} className="flex items-center gap-2 px-4 py-3">
          <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">トレンドタグ</h2>
        </div>
        <ul className="py-2">
          {trendingTags.map((tag, i) => (
            <li key={tag.name}>
              <Link
                href={`/explore/tag/${tag.name.toLowerCase()}`}
                style={{ color: 'var(--text-primary)' }}
                className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>#{i + 1} · タグ</div>
                  <div className="text-sm font-medium">#{tag.name}</div>
                </div>
                <span style={{ color: 'var(--text-muted)' }} className="text-xs">{tag.count} 件</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Keyboard tip */}
      <div
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}
      >
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }} className="mb-3">
          キーボードTips
        </h3>
        <div className="space-y-2">
          {[
            ['j / k', '投稿を移動'],
            ['Enter', '投稿を開く'],
            ['l', 'いいね'],
            ['b', 'ブックマーク'],
            ['n', '新規投稿'],
            ['Ctrl+K', 'コマンドパレット'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="kbd">{key}</span>
              <span style={{ color: 'var(--text-secondary)' }} className="text-xs">{desc}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
          style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginTop: '12px' }}
        >
          全ショートカットを見る →
        </button>
      </div>
    </div>
  );
}
