import { useEffect, useRef } from 'react';

/**
 * Topo da loja com vídeo de fundo. Alguns celulares bloqueiam o autoplay mesmo com os
 * atributos certos: força o play() e tenta de novo no primeiro toque na tela.
 */
export function Hero() {
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const elemento = video.current;
    if (!elemento) return;
    elemento.muted = true;
    elemento.playsInline = true;

    const tocar = (): void => {
      elemento.play()?.catch(() => {
        // autoplay ainda bloqueado: tenta de novo no próximo toque/clique
      });
    };

    const aoMudarVisibilidade = (): void => {
      if (!document.hidden) tocar();
    };
    const destravar = (): void => {
      tocar();
      document.removeEventListener('touchstart', destravar);
      document.removeEventListener('click', destravar);
    };

    tocar();
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    document.addEventListener('touchstart', destravar, { once: true, passive: true });
    document.addEventListener('click', destravar, { once: true });

    return () => {
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      document.removeEventListener('touchstart', destravar);
      document.removeEventListener('click', destravar);
    };
  }, []);

  return (
    <header className="hero">
      <video
        ref={video}
        className="hero__video"
        src="/assets/video/hero.mp4"
        poster="/assets/img/banner.jpg"
        preload="auto"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero__overlay" />

      <div className="hero__conteudo">
        <div className="hero__selo">
          <img src="/assets/img/logo.jpg" alt="Logo Board Point" />
        </div>
        <h1 className="hero__nome">
          Board <span>Point</span>
        </h1>
        <p className="hero__slogan">Street &amp; Skate Shop</p>
      </div>

      <div className="hero__scroll">
        <span>role a página</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </header>
  );
}
