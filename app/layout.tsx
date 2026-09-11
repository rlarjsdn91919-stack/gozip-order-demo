import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '고집(Go.zip) · 제휴 주문 체험',
  description:
    '웹 주문, 대학 제휴 연결, 앱 승인과 매장 POS 접수까지 직접 체험하는 데모.',
};

export const viewport: Viewport = {
  themeColor: '#1f1e1e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
