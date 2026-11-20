import { useCallback, useEffect, useState } from 'react';
import type { Produto } from '../dominio/entidades/Produto';
import { ErroValidacao } from '../dominio/excecoes/ErroValidacao';
import type { FiltroCategoria } from '../dominio/tipos/Tipos';
import { BarraConta } from '../componentes/conta/BarraConta';
import { AvisoRapido } from '../componentes/loja/AvisoRapido';
import { BannerLoja } from '../componentes/loja/BannerLoja';
import { BarraBusca } from '../componentes/loja/BarraBusca';
import { BotaoCarrinho } from '../componentes/loja/BotaoCarrinho';
import { Hero } from '../componentes/loja/Hero';
import { Lightbox } from '../componentes/loja/Lightbox';
import { ModalCarrinho } from '../componentes/loja/ModalCarrinho';
import { ModalCheckout } from '../componentes/loja/ModalCheckout';
import { ModalContato } from '../componentes/loja/ModalContato';
import { RodapeLoja } from '../componentes/loja/RodapeLoja';
import { VitrineProdutos } from '../componentes/loja/VitrineProdutos';
import { useAtrasado } from '../hooks/useAtrasado';
import { useAviso } from '../hooks/useAviso';
import { useCarrinho } from '../hooks/useCarrinho';
import { useCategorias } from '../hooks/useCategorias';
import { useProdutos } from '../hooks/useProdutos';

const ATRASO_BUSCA_MS = 300;

type Janela = 'carrinho' | 'checkout' | 'contato' | null;

/** Página inicial: vitrine com busca, filtros por categoria, detalhe do produto e carrinho. */
export function PaginaLoja() {
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState<FiltroCategoria>('todos');
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const [aberto, setAberto] = useState(false);
  const [abertura, setAbertura] = useState(0);
  const [janela, setJanela] = useState<Janela>(null);
  // Muda a cada abertura: o formulário de cada modal recomeça do zero.
  const [aberturaCheckout, setAberturaCheckout] = useState(0);
  const [aberturaContato, setAberturaContato] = useState(0);

  // Cada busca é uma chamada à API: espera o cliente parar de digitar (limpar é imediato).
  const termoAtrasado = useAtrasado(termo, ATRASO_BUSCA_MS);
  const busca = termo === '' ? '' : termoAtrasado;

  const categorias = useCategorias();
  const { produtos, erro, carregando, carregado } = useProdutos(busca, categoria);
  const { servico, totalUnidades } = useCarrinho();
  const aviso = useAviso();

  useEffect(() => {
    document.title = 'Board Point — Street & Skate Shop';
  }, []);

  const selecionar = useCallback((produto: Produto) => {
    setSelecionado(produto);
    setAbertura((n) => n + 1);
    setAberto(true);
  }, []);

  const fechar = useCallback(() => setAberto(false), []);
  const fecharJanela = useCallback(() => setJanela(null), []);

  const abrirCheckout = (): void => {
    setAberturaCheckout((n) => n + 1);
    setJanela('checkout');
  };

  const abrirContato = (): void => {
    setAberturaContato((n) => n + 1);
    setJanela('contato');
  };

  const contatoEnviado = (): void => {
    setJanela(null);
    aviso.mostrar('Mensagem enviada! Em breve entraremos em contato.');
  };

  const adicionar = (produto: Produto, quantidade: number): void => {
    try {
      servico.adicionar(produto, quantidade);
      setAberto(false);
      aviso.mostrar('Adicionado ao carrinho ✓');
    } catch (erroAdicionar) {
      if (!(erroAdicionar instanceof ErroValidacao)) throw erroAdicionar;
      aviso.mostrar(erroAdicionar.message);
    }
  };

  const contagem = !carregado || erro !== null ? '' : produtos.length === 1 ? '1 produto' : `${produtos.length} produtos`;

  return (
    <>
      <BarraConta />
      <Hero />

      <BarraBusca
        termo={termo}
        aoMudarTermo={setTermo}
        categorias={categorias}
        categoriaAtiva={categoria}
        aoSelecionarCategoria={setCategoria}
      />

      <main className="catalogo container-fluid">
        <div className="catalogo__cabecalho">
          <h2>Vitrine</h2>
          <span className="catalogo__contagem">{contagem}</span>
        </div>
        <VitrineProdutos
          produtos={produtos}
          categoria={categoria}
          carregando={carregando}
          carregado={carregado}
          erro={erro}
          aoSelecionar={selecionar}
        />
      </main>

      <BannerLoja />

      <Lightbox produto={selecionado} abertura={abertura} aberto={aberto} aoFechar={fechar} aoAdicionar={adicionar} />
      <BotaoCarrinho totalUnidades={totalUnidades} aoClicar={() => setJanela('carrinho')} />
      <ModalCarrinho aberto={janela === 'carrinho'} aoFechar={fecharJanela} aoFinalizar={abrirCheckout} />
      <ModalCheckout key={`checkout-${aberturaCheckout}`} aberto={janela === 'checkout'} aoFechar={fecharJanela} />
      <ModalContato
        key={`contato-${aberturaContato}`}
        aberto={janela === 'contato'}
        aoFechar={fecharJanela}
        aoEnviar={contatoEnviado}
      />
      <AvisoRapido mensagem={aviso.mensagem} visivel={aviso.visivel} />

      <RodapeLoja aoAbrirContato={abrirContato} />
    </>
  );
}
