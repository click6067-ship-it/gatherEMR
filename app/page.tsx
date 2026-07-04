import { HeroNav } from './components/HeroNav';
import { HeroVideo } from './components/HeroVideo';
import { HeroCenter } from './components/HeroCenter';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { CtaSection } from './components/CtaSection';
import { SiteFooter } from './components/SiteFooter';

export default function Landing() {
  return (
    <main className="landing" id="top">
      <section className="hero">
        <HeroVideo />
        <HeroNav />
        <HeroCenter />
      </section>
      <hr className="scanline" />
      <SpecialtiesSection />
      <hr className="scanline" />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
