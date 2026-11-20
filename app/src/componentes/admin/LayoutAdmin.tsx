import type { ReactNode } from 'react';
import { SidebarAdmin } from './SidebarAdmin';

interface Props {
  titulo: string;
  children: ReactNode;
}

/** Moldura de toda página interna do painel: sidebar fixa + cabeçalho com título. */
export function LayoutAdmin({ titulo, children }: Props) {
  return (
    <div className="admin-layout">
      <SidebarAdmin />
      <main className="admin-main">
        <div className="admin-header">
          <h1>{titulo}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
