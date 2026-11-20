import { useEffect, useState } from 'react';

/** Devolve o valor só depois de `atrasoMs` sem mudanças (debounce). */
export function useAtrasado<T>(valor: T, atrasoMs: number): T {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setAtrasado(valor), atrasoMs);
    return () => clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return atrasado;
}
