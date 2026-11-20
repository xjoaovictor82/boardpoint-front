import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { mensagemAmigavel } from '../../dominio/utilitarios/mensagensErro';
import { errosLogin } from '../../dominio/utilitarios/validacoesConta';
import { AlertaConta } from '../../componentes/conta/AlertaConta';
import type { DadosAlerta } from '../../componentes/conta/AlertaConta';
import { CampoSenha } from '../../componentes/conta/CampoSenha';
import { CampoTexto } from '../../componentes/conta/CampoTexto';
import { LayoutAuth } from '../../componentes/conta/LayoutAuth';
import { useAlternar } from '../../hooks/useAlternar';
import { useErrosCampos } from '../../hooks/useErrosCampos';
import { useSessaoAdmin } from '../../hooks/useSessaoAdmin';
import { servicoAdmin } from '../../infra/servicosAdmin';

/** Tela de login do painel (porta de paginaLoginAdmin.ts + login.html). */
export function PaginaLoginAdmin() {
  const { logado } = useSessaoAdmin();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, alternarSenha] = useAlternar();
  const [alerta, setAlerta] = useState<DadosAlerta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { erros, substituir, limpar } = useErrosCampos();

  // Quem já está logado no painel não precisa ver a tela de login.
  if (logado) return <Navigate to="/admin" replace />;

  const enviar = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();
    setAlerta(null);

    const emailLimpo = email.trim().toLowerCase();
    const encontrados = errosLogin(emailLimpo, senha);
    substituir(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await servicoAdmin.entrar(emailLimpo, senha);
    } catch (erro) {
      setAlerta({ texto: mensagemAmigavel(erro, 'admin'), tipo: 'erro' });
      setEnviando(false);
    }
  };

  return (
    <LayoutAuth
      tituloAba="Login — Board Point Admin"
      titulo="Painel administrativo"
      subtitulo="Entre com seu e-mail e senha de administrador."
    >
      <AlertaConta alerta={alerta} />

      <form id="formLoginAdmin" noValidate onSubmit={(evento) => void enviar(evento)}>
        <CampoTexto
          nome="email-admin"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="admin@boardpoint.com"
          maxLength={150}
          valor={email}
          aoMudar={(valor) => {
            setEmail(valor);
            limpar('email');
          }}
          erro={erros['email']}
        />
        <CampoSenha
          nome="senha-admin"
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
    </LayoutAuth>
  );
}
