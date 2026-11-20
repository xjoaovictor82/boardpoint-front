import { useCallback, useEffect, useRef, useState } from 'react';

const DURACAO_MS = 2200;

/** Mensagem rápida (toast) que some sozinha. */
export function useAviso() {
  const [mensagem, setMensagem] = useState('');
  const [visivel, setVisivel] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mostrar = useCallback((texto: string) => {
    clearTimeout(temporizador.current);
    setMensagem(texto);
    setVisivel(true);
    temporizador.current = setTimeout(() => setVisivel(false), DURACAO_MS);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return { mensagem, visivel, mostrar };
}
