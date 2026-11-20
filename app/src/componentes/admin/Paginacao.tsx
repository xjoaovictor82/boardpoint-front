interface Props {
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  aoMudar: (pagina: number) => void;
}

/** Controles "Anterior / Página X de Y / Próxima" (porta de nucleo/Paginacao.ts). */
export function Paginacao({ pagina, totalPaginas, totalRegistros, aoMudar }: Props) {
  if (totalRegistros === 0) return null;

  return (
    <div className="paginacao">
      <button
        type="button"
        className="botao-secundario"
        disabled={pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
      >
        ← Anterior
      </button>
      <span className="paginacao-info">
        Página {pagina} de {totalPaginas} · {totalRegistros} registro(s)
      </span>
      <button
        type="button"
        className="botao-secundario"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
      >
        Próxima →
      </button>
    </div>
  );
}
