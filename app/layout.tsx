import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'gatherEMR — 비식별 EMR 분과별 요약',
  description: '의대교수용 비식별 EMR 차트 응급의학과 요약 (v1)',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
