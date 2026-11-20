import { useEffect, useRef, useState } from 'react';

/** Devolve [ref, emVista]: vira true (e fica) quando o elemento entra na tela. */
export function useEmVista<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [emVista, setEmVista] = useState(() => !('IntersectionObserver' in window));

  useEffect(() => {
    const elemento = ref.current;
    if (emVista || elemento === null) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setEmVista(true);
          observador.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [emVista]);

  return [ref, emVista] as const;
}
