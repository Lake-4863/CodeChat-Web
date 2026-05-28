'use client';

import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const sections = [
  {
    title: 'グローバル',
    shortcuts: [
      { keys: ['?'], desc: 'このヘルプを表示' },
      { keys: ['Ctrl', 'K'], desc: 'コマンドパレットを開く' },
      { keys: ['n'], desc: '新規投稿' },
      { keys: ['/'], desc: '検索ページへ' },
      { keys: ['Esc'], desc: 'モーダルを閉じる' },
    ],
  },
  {
    title: 'ページ移動 (g + キー)',
    shortcuts: [
      { keys: ['g', 'h'], desc: 'Home' },
      { keys: ['g', 'e'], desc: 'Explore' },
      { keys: ['g', 'p'], desc: 'Profile' },
      { keys: ['g', 'n'], desc: 'Notifications' },
      { keys: ['g', 'b'], desc: 'Bookmarks' },
      { keys: ['g', 's'], desc: 'Settings' },
      { keys: ['g', 'f'], desc: 'Forum' },
      { keys: ['g', 'c'], desc: 'Chat' },
      { keys: ['g', 't'], desc: 'テーマ切替' },
    ],
  },
  {
    title: 'フィード内',
    shortcuts: [
      { keys: ['j', '↓'], desc: '次の投稿' },
      { keys: ['k', '↑'], desc: '前の投稿' },
      { keys: ['Enter', 'o'], desc: '投稿を開く' },
      { keys: ['r'], desc: 'リプライ' },
      { keys: ['l'], desc: 'いいね' },
      { keys: ['b'], desc: 'ブックマーク' },
      { keys: ['s'], desc: 'URLをコピー' },
    ],
  },
  {
    title: '投稿詳細',
    shortcuts: [
      { keys: ['u'], desc: 'フィードに戻る' },
      { keys: ['r'], desc: 'リプライを書く' },
      { keys: ['l'], desc: 'いいね' },
      { keys: ['b'], desc: 'ブックマーク' },
      { keys: ['s'], desc: 'URLをコピー' },
    ],
  },
  {
    title: 'フォーラム / Chat',
    shortcuts: [
      { keys: ['j', '↓'], desc: '次の項目を選択' },
      { keys: ['k', '↑'], desc: '前の項目を選択' },
      { keys: ['Enter'], desc: '選択して開く' },
      { keys: ['/'], desc: '入力欄にフォーカス' },
      { keys: ['Esc'], desc: '一覧に戻る' },
    ],
  },
  {
    title: '通知',
    shortcuts: [
      { keys: ['j', '↓'], desc: '次の通知' },
      { keys: ['k', '↑'], desc: '前の通知' },
      { keys: ['Enter'], desc: '投稿/プロフィールを開く' },
      { keys: ['m'], desc: '全て既読にする' },
    ],
  },
  {
    title: '投稿入力',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], desc: '投稿する' },
      { keys: ['Ctrl', 'Shift', 'K'], desc: 'コードブロック挿入' },
      { keys: ['Esc'], desc: 'キャンセル' },
    ],
  },
];

export function ShortcutHelp() {
  const { setShortcutHelpOpen } = useApp();

  return (
    <div className="overlay-backdrop" onClick={() => setShortcutHelpOpen(false)} role="dialog" aria-modal="true" aria-label="ショートカットヘルプ">
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{ borderBottom: '1px solid var(--border)' }}
          className="flex items-center justify-between px-6 py-4"
        >
          <h2 style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">キーボードショートカット</h2>
          <button
            onClick={() => setShortcutHelpOpen(false)}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            className="hover:text-[var(--text-primary)]"
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 grid grid-cols-2 gap-6">
          {sections.map(section => (
            <div key={section.title}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }} className="mb-3">
                {section.title}
              </h3>
              <dl className="space-y-2">
                {section.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <span key={ki} className="kbd">{k}</span>
                      ))}
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-xs flex-1">{s.desc}</span>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
