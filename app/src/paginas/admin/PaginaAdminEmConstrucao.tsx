import { LayoutAdmin } from '../../componentes/admin/LayoutAdmin';

interface Props {
  titulo: string;
}

/** Placeholder para telas do painel ainda não portadas (dashboard, categorias, produtos...). */
export function PaginaAdminEmConstrucao({ titulo }: Props) {
  return (
    <LayoutAdmin titulo={titulo}>
      <p>Tela ainda não migrada para React.</p>
    </LayoutAdmin>
  );
}
