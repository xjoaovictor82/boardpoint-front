/**
 * Vídeo de fundo do topo. Alguns navegadores de celular bloqueiam o autoplay mesmo com os
 * atributos certos: força o play() e tenta de novo no primeiro toque na tela.
 */
export class VideoHero {
  constructor(video: HTMLVideoElement | null) {
    if (!video) return;
    video.muted = true;
    video.playsInline = true;

    const tocar = (): void => {
      video.play()?.catch(() => {
        // Autoplay ainda bloqueado: tenta de novo no próximo toque/clique.
      });
    };

    tocar();
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tocar();
    });

    const destravar = (): void => {
      tocar();
      document.removeEventListener("touchstart", destravar);
      document.removeEventListener("click", destravar);
    };
    document.addEventListener("touchstart", destravar, { once: true, passive: true });
    document.addEventListener("click", destravar, { once: true });
  }
}
