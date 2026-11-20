import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessaoAdmin } from '../../hooks/useSessaoAdmin';
import { servicoAdmin } from '../../infra/servicosAdmin';

interface Props {
  children: ReactNode;
}

/**
 * Envolve toda página interna do painel: exige login e confirma no servidor que o
 * token ainda vale (porta de nucleo/iniciarPaginaAdmin.ts, sem a parte de montar a
 * sidebar nem o botão sair — isso agora é LayoutAdmin/SidebarAdmin).
 */
export function RotaProtegidaAdmin({ children }: Props) {
  const { logado } = useSessaoAdmin();
  const [confirmando, setConfirmando] = useState(true);
  const confirmado = useRef(false);

  useEffect(() => {
    if (!logado || confirmado.current) {
      setConfirmando(false);
      return;
    }
    confirmado.current = true;
    void servicoAdmin.confirmarSessao().finally(() => setConfirmando(false));
  }, [logado]);

  if (!logado) return <Navigate to="/admin/login" replace />;
  if (confirmando) return null;

  return <>{children}</>;
}
