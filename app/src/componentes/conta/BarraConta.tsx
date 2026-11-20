import { Link } from 'react-router-dom';
import { useSessao } from '../../hooks/useSessao';
import { servicoConta } from '../../infra/servicos';

/** Barra no topo da loja: "Entrar | Cadastrar" ou "Olá, Nome | Sair". */
export function BarraConta() {
  const { logado, nome } = useSessao();
  const primeiroNome = nome.trim().split(/\s+/)[0] ?? '';

  return (
    <div className="conta" id="barraConta" aria-label="Conta do cliente">
      {logado ? (
        <>
          <Link className="conta__botao" to="/cliente/perfil" title="Meu perfil">
            Olá, {primeiroNome || 'cliente'}
          </Link>
          <button type="button" className="conta__botao conta__botao--destaque" onClick={() => servicoConta.sair()}>
            Sair
          </button>
        </>
      ) : (
        <>
          <Link className="conta__botao" to="/cliente/login">
            Entrar
          </Link>
          <Link className="conta__botao conta__botao--destaque" to="/cliente/cadastro">
            Cadastrar
          </Link>
        </>
      )}
    </div>
  );
}
