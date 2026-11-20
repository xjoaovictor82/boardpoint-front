import { useCallback, useState } from 'react';

/** Liga/desliga um valor (ex.: mostrar ou ocultar a senha). */
export function useAlternar(inicial = false) {
  const [valor, setValor] = useState(inicial);
  const alternar = useCallback(() => setValor((atual) => !atual), []);
  return [valor, alternar, setValor] as const;
}
