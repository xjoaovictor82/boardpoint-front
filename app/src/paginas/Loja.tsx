import { useEffect, useState } from "react";
import { api } from "../api/cliente";
import type { CategoriaDto, ProdutoDto, RespostaProdutos } from "../tipos";
import BarraBusca from "../componentes/loja/BarraBusca";
import FiltrosCategoria from "../componentes/loja/FiltrosCategoria";
import Hero from "../componentes/loja/Hero";
import Vitrine from "../componentes/loja/Vitrine";

const ATRASO_BUSCA_MS = 300;

export default function Loja() {
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [produtos, setProdutos] = useState<ProdutoDto[]>([]);
  const [categoria, setCategoria] = useState("todos");
  const [termo, setTermo] = useState(""); // o que a pessoa digita
  const [busca, setBusca] = useState(""); // o termo já com atraso (vai para a API)
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Categorias: carrega uma vez. Se a API falhar, o site continua sem filtros.
  useEffect(() => {
    api
      .obter<CategoriaDto[]>("/publico/categorias")
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  // Debounce: cada busca é uma chamada à API, então espera a pessoa parar de digitar.
  useEffect(() => {
    const temporizador = setTimeout(() => setBusca(termo), ATRASO_BUSCA_MS);
    return () => clearTimeout(temporizador);
  }, [termo]);

  // Produtos: recarrega quando a busca ou a categoria mudam.
  useEffect(() => {
    let cancelado = false;
    setCarregando(true);

    const params = new URLSearchParams({ busca, categoria, por_pagina: "200" });
    api
      .obter<RespostaProdutos>(`/publico/produtos?${params.toString()}`)
      .then((dados) => {
        if (cancelado) return;
        setProdutos(dados.produtos);
        setErro(null);
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setErro(e instanceof Error ? e.message : "Tente recarregar a página em instantes.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true; // ignora respostas antigas (a pessoa já mudou o filtro)
    };
  }, [busca, categoria]);

  const contagem = produtos.length === 1 ? "1 produto" : `${produtos.length} produtos`;

  return (
    <>
      <Hero />

      <nav className="barra" aria-label="Busca e filtro de produtos">
        <BarraBusca valor={termo} aoMudar={setTermo} />
        <FiltrosCategoria categorias={categorias} ativa={categoria} aoMudar={setCategoria} />
      </nav>

      <main className="catalogo container-fluid">
        <div className="catalogo__cabecalho">
          <h2>Vitrine</h2>
          <span className="catalogo__contagem">{erro === null ? contagem : ""}</span>
        </div>
        <Vitrine produtos={produtos} categoria={categoria} carregando={carregando} erro={erro} />
      </main>

      <section className="banner container-fluid">
        <div className="banner__texto">
          <p className="eyebrow">Board Point</p>
          <h2>
            Estilo de quem
            <br />
            anda de skate
          </h2>
        </div>
      </section>
    </>
  );
}