import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type TipoToast = 'sucesso' | 'erro';

interface EstadoToast {
  mensagem: string;
  tipo: TipoToast;
  chave: number;
}

type MostrarToast = (mensagem: string, tipo?: TipoToast) => void;

const ContextoToast = createContext<MostrarToast | null>(null);

const DURACAO_MS = 3200;

/**
 * Provedor do aviso rápido no canto da tela (porta de nucleo/Toast.ts).
 * Envolve todo o painel admin; qualquer tela chama `useToast()` para avisar.
 */
export function ProvedorToastAdmin({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoToast | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const mostrarToast = useCallback<MostrarToast>((mensagem, tipo = 'sucesso') => {
    window.clearTimeout(temporizador.current);
    setEstado({ mensagem, tipo, chave: Date.now() });
    temporizador.current = window.setTimeout(() => setEstado(null), DURACAO_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  return (
    <ContextoToast.Provider value={mostrarToast}>
      {children}
      <div
        id="toastGlobal"
        className={estado ? `toast mostrar${estado.tipo === 'erro' ? ' erro' : ''}` : 'toast'}
        role="status"
        aria-live="polite"
      >
        {estado?.mensagem}
      </div>
    </ContextoToast.Provider>
  );
}

/** Devolve a função para mostrar um toast. Precisa estar dentro de <ProvedorToastAdmin>. */
export function useToast(): MostrarToast {
  const mostrar = useContext(ContextoToast);
  if (mostrar === null) throw new Error('useToast precisa estar dentro de <ProvedorToastAdmin>.');
  return mostrar;
}
