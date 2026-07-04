export function HeroVideo() {
  return (
    <div className="herovid" aria-hidden="true">
      <video className="herovid-el" autoPlay loop muted playsInline poster="/hero-flipscan-poster.jpg">
        <source src="/hero-flipscan.mp4" type="video/mp4" />
      </video>
      <div className="herovid-dim" />
    </div>
  );
}
