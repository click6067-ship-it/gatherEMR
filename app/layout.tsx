import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Anti-slop type system: IBM Plex (technical, medical-serious — not Inter/Roboto).
// Latin+numerals carry the character (EMR text is number-heavy); Korean falls back
// to a quality system stack. Mono = the signature for all clinical/source data.
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'gatherEMR — 비식별 EMR 분과별 요약',
  description: '의대 교수를 위한 비식별 EMR 차트 분과별 요약. 26개 전문과목, 문장마다 원문 근거.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
