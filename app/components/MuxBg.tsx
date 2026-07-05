'use client';
import { useEffect, useRef } from 'react';

// Mux HLS background video. Safari/iOS play .m3u8 natively; other browsers attach it
// via hls.js (dynamically imported so it only loads where this component mounts).
const PLAYBACK_ID = '4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc';
const SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?width=1280`;

export function MuxBg({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Native HLS (Safari / iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = SRC;
      return;
    }

    let hls: { destroy: () => void } | undefined;
    let cancelled = false;
    import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !ref.current) return;
      if (Hls.isSupported()) {
        const inst = new Hls({ startLevel: -1 });
        inst.loadSource(SRC);
        inst.attachMedia(ref.current);
        hls = inst;
      }
    });
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, []);

  return (
    <video ref={ref} className={className} autoPlay loop muted playsInline poster={POSTER} aria-hidden="true" />
  );
}
