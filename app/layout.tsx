import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_KR, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { BrandHome } from './components/BrandHome';
import { ScrollReveal } from './components/ScrollReveal';
import { ThemeToggle } from './components/ThemeToggle';

// Set the saved theme before first paint (no flash). Default = dark.
const THEME_INIT = `try{if(localStorage.getItem('gemr-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`;

// Anti-slop type system: one cohesive IBM Plex family across scripts (technical,
// medical-serious — not Inter/Roboto, and not the default Pretendard/Noto every
// Korean site reaches for). Latin = IBM Plex Sans, Korean = IBM Plex Sans KR (the
// script's real EMR-text carrier, not a system fallback), Mono = clinical/source data.
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-sans' });
const sansKR = IBM_Plex_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-sans-kr', preload: false });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'gatherEMR — 비식별 EMR 분과별 요약',
  description: '의대 교수를 위한 비식별 EMR 차트 분과별 요약. 25개 전문과목, 문장마다 원문 근거.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${sans.variable} ${sansKR.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        {/* Liquid-glass refraction filter (Aave technique). Chromium reads it via
            backdrop-filter:url(); Safari/Firefox fall back to plain blur+saturate. */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" colorInterpolationFilters="sRGB">
          <filter id="lg-lens" x="0" y="0" width="100%" height="100%">
            <feImage href="/glass-map.png" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="26" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {/* no-JS / crash safety: never leave reveal elements hidden */}
        <noscript><style>{`.reveal{opacity:1!important;filter:none!important;transform:none!important}`}</style></noscript>
        <BrandHome />
        <ThemeToggle />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
