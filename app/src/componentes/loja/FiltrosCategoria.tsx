import type { CategoriaDto } from "../../tipos";

interface Props {
  categorias: CategoriaDto[];
  ativa: string; // "todos" ou o slug de uma categoria
  aoMudar: (slug: string) => void;
}

export default function FiltrosCategoria({ categorias, ativa, aoMudar }: Props) {
  return (
    <div className="filtros" role="tablist" aria-label="Categorias">
      {categorias.map((categoria) => {
        const selecionada = ativa === categoria.slug;
        return (
          <button
            key={categoria.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            className={`pilula${selecionada ? " ativa" : ""}`}
            onClick={() => aoMudar(selecionada ? "todos" : categoria.slug)}
          >
            {categoria.nome}
          </button>
        );
      })}
    </div>
  );
}