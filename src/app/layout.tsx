import type { Metadata } from 'next';
import './globals.css';
import { ClientRoot } from '@/components/ClientRoot';

export const metadata: Metadata = {
  title: 'CodeChat – キーボードファーストなコーダー向けSNS',
  description: 'コーダーのための完全キーボード操作型SNS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full overflow-hidden">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
