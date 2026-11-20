import { useEffect } from 'react';

/** Comportamento comum dos modais: trava a rolagem da página e (opcionalmente) fecha com Esc. */
export function useJanelaModal(aberto: boolean, aoFechar: () => void, fechaComEsc: boolean): void {
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape' && fechaComEsc) aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, aoFechar, fechaComEsc]);
}
