import { HeroNav } from './components/HeroNav';
import { HeroVideo } from './components/HeroVideo';
import { HeroCenter } from './components/HeroCenter';

export default function Landing() {
  return (
    <main className="landing" id="top">
      <section className="hero">
        <HeroVideo />
        <HeroNav />
        <HeroCenter />
      </section>
    </main>
  );
}
