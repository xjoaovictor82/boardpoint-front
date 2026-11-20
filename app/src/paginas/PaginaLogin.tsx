import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { mensagemAmigavel } from '../dominio/utilitarios/mensagensErro';
import { errosLogin } from '../dominio/utilitarios/validacoesConta';
import { AlertaConta } from '../componentes/conta/AlertaConta';
import type { DadosAlerta } from '../componentes/conta/AlertaConta';
import { CampoSenha } from '../componentes/conta/CampoSenha';
import { CampoTexto } from '../componentes/conta/CampoTexto';
import { LayoutAuth } from '../componentes/conta/LayoutAuth';
import { useAlternar } from '../hooks/useAlternar';
import { useErrosCampos } from '../hooks/useErrosCampos';
import { useSessao } from '../hooks/useSessao';
import { servicoConta } from '../infra/servicos';

function alertaDaUrl(parametros: URLSearchParams): DadosAlerta | null {
  if (parametros.get('cadastro') === 'ok') {
    return { texto: 'Cadastro realizado com sucesso! Entre com seu e-mail e senha.', tipo: 'sucesso' };
  }
  if (parametros.get('expirou') === '1') {
    return { texto: 'Sua sessão expirou. Entre novamente.', tipo: 'erro' };
  }
  return null;
}

export function PaginaLogin() {
  const { logado } = useSessao();
  const [parametros] = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, alternarSenha] = useAlternar();
  const [alerta, setAlerta] = useState<DadosAlerta | null>(() => alertaDaUrl(parametros));
  const [enviando, setEnviando] = useState(false);
  const { erros, substituir, limpar } = useErrosCampos();

  // Quem já está logado não precisa ver a tela de login (também vale logo após entrar).
  if (logado) return <Navigate to="/" replace />;

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setAlerta(null);

    const emailLimpo = email.trim().toLowerCase();
    const encontrados = errosLogin(emailLimpo, senha);
    substituir(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await servicoConta.entrar(emailLimpo, senha);
    } catch (erro) {
      setAlerta({ texto: mensagemAmigavel(erro, 'login'), tipo: 'erro' });
      setEnviando(false);
    }
  };

  return (
    <LayoutAuth tituloAba="Entrar — Board Point" titulo="Entrar" subtitulo="Use o e-mail e a senha da sua conta.">
      <AlertaConta alerta={alerta} />

      <form id="formLogin" noValidate onSubmit={(evento) => void enviar(evento)}>
        <CampoTexto
          nome="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          maxLength={150}
          valor={email}
          aoMudar={(valor) => {
            setEmail(valor);
            limpar('email');
          }}
          erro={erros['email']}
        />
        <CampoSenha
          nome="senha"
          rotulo="Senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          valor={senha}
          aoMudar={(valor) => {
            setSenha(valor);
            limpar('senha');
          }}
          visivel={verSenha}
          aoAlternar={alternarSenha}
          erro={erros['senha']}
        />
        <button id="botaoEntrar" className="auth__botao" type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth__troca">
        Ainda não tem conta? <Link to="/cliente/cadastro">Cadastre-se</Link>
      </p>
    </LayoutAuth>
  );
}
