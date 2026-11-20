import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { sessao } from '../infra/servicos';
import { erroJson, simularApi, sucessoJson } from '../testes/apiFalsa';
import type { Requisicao } from '../testes/apiFalsa';
import { criarToken } from '../testes/token';

const PERFIL = { id: 1, nome: 'Maria Souza', email: 'maria@exemplo.com', cpf: '52998224725' };

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  );
}

const ehConta = (r: Requisicao, acao: string, metodo: string): boolean =>
  r.url.includes(`clientes.php?acao=${acao}`) && r.metodo === metodo;

function entrarComoMaria(): void {
  sessao.iniciar(criarToken(), 'Maria Souza');
}

beforeEach(() => {
  localStorage.clear();
  sessao.encerrar();
});

describe('Barra de conta na loja', () => {
  it('visitante vê Entrar e Cadastrar com links para as telas', async () => {
    simularApi();
    abrir('/');
    expect(await screen.findByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/cliente/login');
    expect(screen.getByRole('link', { name: 'Cadastrar' })).toHaveAttribute('href', '/cliente/cadastro');
  });

  it('cliente logado vê o primeiro nome e consegue sair', async () => {
    simularApi();
    entrarComoMaria();
    const usuario = userEvent.setup();
    abrir('/');

    expect(await screen.findByRole('link', { name: 'Olá, Maria' })).toHaveAttribute('href', '/cliente/perfil');
    await usuario.click(screen.getByRole('button', { name: 'Sair' }));
    expect(await screen.findByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(localStorage.getItem('bp_jwt_token')).toBeNull();
  });
});

describe('Login', () => {
  it('mostra os erros de cada campo sem chamar a API', async () => {
    const { requisicoes } = simularApi();
    const usuario = userEvent.setup();
    abrir('/cliente/login');

    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(requisicoes.some((r) => r.url.includes('clientes.php'))).toBe(false);

    // o erro some quando a pessoa volta a digitar naquele campo
    await usuario.type(screen.getByLabelText('E-mail'), 'a');
    expect(screen.queryByText('Informe seu e-mail.')).not.toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  });

  it('com senha errada mostra a mensagem amigável e continua na tela', async () => {
    simularApi({ extra: (r) => (ehConta(r, 'login', 'POST') ? erroJson(401, 'E-mail ou senha inválidos.') : undefined) });
    const usuario = userEvent.setup();
    abrir('/cliente/login');

    await usuario.type(screen.getByLabelText('E-mail'), 'maria@exemplo.com');
    await usuario.type(screen.getByLabelText('Senha'), 'errada');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos. Confira e tente de novo.');
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(sessao.estaLogado()).toBe(false);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('entra, guarda a sessão e volta para a loja', async () => {
    const { requisicoes } = simularApi({
      extra: (r) => (ehConta(r, 'login', 'POST') ? sucessoJson({ token: criarToken(), nome: 'Maria Souza' }) : undefined),
    });
    const usuario = userEvent.setup();
    abrir('/cliente/login');

    await usuario.type(screen.getByLabelText('E-mail'), '  Maria@Exemplo.com ');
    await usuario.type(screen.getByLabelText('Senha'), 'Abcdef1!');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('link', { name: 'Olá, Maria' })).toBeInTheDocument();
    expect(requisicoes.find((r) => ehConta(r, 'login', 'POST'))?.corpo).toEqual({
      email: 'maria@exemplo.com',
      senha: 'Abcdef1!',
    });
    expect(localStorage.getItem('bp_jwt_token')).not.toBeNull();
  });

  it('quem já está logado vai direto para a loja', async () => {
    simularApi();
    entrarComoMaria();
    abrir('/cliente/login');
    expect(await screen.findByRole('link', { name: 'Olá, Maria' })).toBeInTheDocument();
  });

  it('mostra o aviso de cadastro feito ou de sessão expirada vindo da URL', () => {
    simularApi();
    abrir('/cliente/login?cadastro=ok');
    expect(screen.getByRole('alert')).toHaveTextContent('Cadastro realizado com sucesso!');
  });

  it('o botão "olho" mostra e oculta a senha', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrir('/cliente/login');

    const campo = screen.getByLabelText('Senha');
    expect(campo).toHaveAttribute('type', 'password');
    await usuario.click(screen.getByRole('button', { name: 'Mostrar senha (Senha)' }));
    expect(campo).toHaveAttribute('type', 'text');
    await usuario.click(screen.getByRole('button', { name: 'Ocultar senha (Senha)' }));
    expect(campo).toHaveAttribute('type', 'password');
  });
});

describe('Cadastro', () => {
  it('formata o CPF enquanto digita e valida ao sair do campo', async () => {
    simularApi();
    const usuario = userEvent.setup();
    abrir('/cliente/cadastro');

    const cpf = screen.getByLabelText('CPF');
    await usuario.type(cpf, '52998224725');
    expect(cpf).toHaveValue('529.982.247-25');
    await usuario.tab();
    expect(screen.queryByText('CPF inválido. Confira os números.')).not.toBeInTheDocument();

    await usuario.clear(cpf);
    await usuario.type(cpf, '11111111111');
    await usuario.tab();
    expect(screen.getByText('CPF inválido. Confira os números.')).toBeInTheDocument();
  });

  it('recusa senha fraca e senhas diferentes antes de chamar a API', async () => {
    const { requisicoes } = simularApi();
    const usuario = userEvent.setup();
    abrir('/cliente/cadastro');

    await usuario.type(screen.getByLabelText('Nome completo'), 'Maria Souza');
    await usuario.type(screen.getByLabelText('E-mail'), 'maria@exemplo.com');
    await usuario.type(screen.getByLabelText('CPF'), '52998224725');
    await usuario.type(screen.getByLabelText('Crie sua senha'), 'fraca');
    await usuario.type(screen.getByLabelText('Confirme a senha'), 'outra');
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText(/A senha deve ter no mínimo 8 caracteres/)).toBeInTheDocument();
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(requisicoes.some((r) => r.url.includes('clientes.php'))).toBe(false);
  });

  it('sugere uma senha forte, mostra nas duas caixas e libera o botão de copiar', async () => {
    simularApi({
      extra: (r) => (ehConta(r, 'sugerir-senha', 'POST') ? sucessoJson({ senha: 'Xk7!mPq2#vLr9Zt' }) : undefined),
    });
    const usuario = userEvent.setup();
    abrir('/cliente/cadastro');

    expect(screen.queryByRole('button', { name: 'Copiar senha' })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Sugerir uma senha forte' }));

    const senha = await screen.findByLabelText('Crie sua senha');
    await waitFor(() => expect(senha).toHaveValue('Xk7!mPq2#vLr9Zt'));
    expect(senha).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirme a senha')).toHaveValue('Xk7!mPq2#vLr9Zt');
    expect(screen.getByRole('button', { name: 'Copiar senha' })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Senha sugerida preenchida');
  });

  it('cria a conta (CPF só com números) e leva para o login com o aviso de sucesso', async () => {
    const { requisicoes } = simularApi({
      extra: (r) => (ehConta(r, 'registrar', 'POST') ? sucessoJson(null) : undefined),
    });
    const usuario = userEvent.setup();
    abrir('/cliente/cadastro');

    await usuario.type(screen.getByLabelText('Nome completo'), ' Maria Souza ');
    await usuario.type(screen.getByLabelText('E-mail'), 'Maria@Exemplo.com');
    await usuario.type(screen.getByLabelText('CPF'), '52998224725');
    await usuario.type(screen.getByLabelText('Crie sua senha'), 'Abcdef1!');
    await usuario.type(screen.getByLabelText('Confirme a senha'), 'Abcdef1!');
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Cadastro realizado com sucesso!');
    expect(requisicoes.find((r) => ehConta(r, 'registrar', 'POST'))?.corpo).toEqual({
      nome: 'Maria Souza',
      email: 'maria@exemplo.com',
      cpf: '52998224725',
      senha: 'Abcdef1!',
    });
  });

  it('mostra a mensagem do servidor quando e-mail ou CPF já existem', async () => {
    simularApi({
      extra: (r) => (ehConta(r, 'registrar', 'POST') ? erroJson(409, 'E-mail ou CPF já cadastrado.') : undefined),
    });
    const usuario = userEvent.setup();
    abrir('/cliente/cadastro');

    await usuario.type(screen.getByLabelText('Nome completo'), 'Maria Souza');
    await usuario.type(screen.getByLabelText('E-mail'), 'maria@exemplo.com');
    await usuario.type(screen.getByLabelText('CPF'), '52998224725');
    await usuario.type(screen.getByLabelText('Crie sua senha'), 'Abcdef1!');
    await usuario.type(screen.getByLabelText('Confirme a senha'), 'Abcdef1!');
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou CPF já cadastrado.');
    expect(screen.getByRole('heading', { name: 'Cadastrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled();
  });
});

describe('Perfil', () => {
  const comPerfil = (r: Requisicao): Response | undefined => {
    if (ehConta(r, 'perfil', 'GET')) return sucessoJson(PERFIL);
    if (ehConta(r, 'perfil', 'PUT')) {
      const corpo = r.corpo as { nome: string };
      return sucessoJson({ ...PERFIL, nome: corpo.nome });
    }
    return undefined;
  };

  it('sem login volta para a tela de entrada avisando que a sessão expirou', async () => {
    simularApi();
    abrir('/cliente/perfil');
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Sua sessão expirou. Entre novamente.');
  });

  it('carrega os dados com CPF formatado e e-mail bloqueado', async () => {
    simularApi({ extra: comPerfil });
    entrarComoMaria();
    abrir('/cliente/perfil');

    expect(await screen.findByLabelText('Nome completo')).toHaveValue('Maria Souza');
    expect(screen.getByLabelText('E-mail')).toHaveValue('maria@exemplo.com');
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25');
    expect(screen.getByText('O e-mail não pode ser alterado.')).toBeInTheDocument();
  });

  it('salva só o que mudou: sem senha no envio, e atualiza o nome da sessão', async () => {
    const { requisicoes } = simularApi({ extra: comPerfil });
    entrarComoMaria();
    const usuario = userEvent.setup();
    abrir('/cliente/perfil');

    const nome = await screen.findByLabelText('Nome completo');
    await usuario.clear(nome);
    await usuario.type(nome, 'Maria S. Lima');
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Perfil atualizado com sucesso!');
    expect(requisicoes.find((r) => ehConta(r, 'perfil', 'PUT'))?.corpo).toEqual({
      nome: 'Maria S. Lima',
      email: 'maria@exemplo.com',
      cpf: '52998224725',
    });
    expect(sessao.nome).toBe('Maria S. Lima');
  });

  it('recusa nova senha fraca sem chamar a API', async () => {
    const { requisicoes } = simularApi({ extra: comPerfil });
    entrarComoMaria();
    const usuario = userEvent.setup();
    abrir('/cliente/perfil');

    await usuario.type(await screen.findByLabelText('Nova senha (opcional)'), 'fraca');
    await usuario.type(screen.getByLabelText('Confirme a nova senha'), 'fraca');
    await usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText(/A senha deve ter no mínimo 8 caracteres/)).toBeInTheDocument();
    expect(requisicoes.some((r) => ehConta(r, 'perfil', 'PUT'))).toBe(false);
  });

  it('se o servidor diz que o token venceu (401), volta ao login com o aviso', async () => {
    simularApi({ extra: (r) => (ehConta(r, 'perfil', 'GET') ? erroJson(401, 'Token expirado.') : undefined) });
    entrarComoMaria();
    abrir('/cliente/perfil');

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Sua sessão expirou. Entre novamente.');
    expect(sessao.estaLogado()).toBe(false);
  });

  it('"Sair da conta" encerra a sessão e volta para a loja', async () => {
    simularApi({ extra: comPerfil });
    entrarComoMaria();
    const usuario = userEvent.setup();
    abrir('/cliente/perfil');

    await usuario.click(await screen.findByRole('button', { name: 'Sair da conta' }));
    expect(await screen.findByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(localStorage.getItem('bp_jwt_token')).toBeNull();
  });
});
