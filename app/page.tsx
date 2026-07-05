import { HeroNav } from './components/HeroNav';
import { HeroCenter } from './components/HeroCenter';
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
      <SpecialtiesSection />
      <hr className="scanline" />
      <CtaSection />
      <SiteFooter />

      <StartDrawer />
    </main>
  );
}
