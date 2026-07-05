import Link from 'next/link';
import { HeroNav } from './components/HeroNav';
import { HeroCenter } from './components/HeroCenter';
import { JourneySection } from './components/JourneySection';
import { FeaturesSection } from './components/FeaturesSection';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { CtaSection } from './components/CtaSection';
import { SiteFooter } from './components/SiteFooter';
import { MuxBg } from './components/MuxBg';
import { StartDrawer } from './components/StartDrawer';

// The Mux clip is the full-page background (hero included); content sits on top, dimmed
// for legibility. Start CTAs open the fullscreen <StartDrawer/>.
export default function Landing() {
  return (
    <main className="landing bg-page" id="top">
      <div className="muxbg muxbg-page" aria-hidden="true">
        <MuxBg className="muxbg-el" />
        <div className="muxbg-dim" />
      </div>

      <section className="hero">
        <HeroNav />
        <HeroCenter />
      </section>

      <hr className="scanline" />
      <JourneySection />
      <hr className="scanline" />
      <FeaturesSection />
      <hr className="scanline" />
      <SpecialtiesSection />
      <hr className="scanline" />
      <CtaSection />

      <section className="sec team-teaser">
        <div className="wrapx reveal">
          <p className="team-teaser-lead">현장·데이터·UX·AI가 한 팀. <b>골든타임 팀</b>이 만들었습니다.</p>
          <Link href="/about" className="btn-glass">팀원 소개 →</Link>
        </div>
      </section>

      <SiteFooter />

      <StartDrawer />
    </main>
  );
}
