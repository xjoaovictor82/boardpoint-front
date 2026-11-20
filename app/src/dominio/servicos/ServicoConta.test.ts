import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErroValidacao } from '../excecoes/ErroValidacao';
import type { ClienteHttp } from '../tipos/Tipos';
import { criarToken } from '../../testes/token';
import { ServicoConta } from './ServicoConta';
import { SessaoUsuario } from './SessaoUsuario';

function criarHttp(respostas: Partial<ClienteHttp> = {}): ClienteHttp {
  const naoUsado = () => Promise.reject(new Error('não deveria chamar'));
  return {
    obter: naoUsado,
    enviarJson: naoUsado,
    atualizarJson: naoUsado,
    excluir: naoUsado,
    enviarFormulario: naoUsado,
    ...respostas,
  } as ClienteHttp;
}

beforeEach(() => {
  localStorage.clear();
});

describe('SessaoUsuario', () => {
  it('guarda token e nome, avisa os ouvintes e permite cancelar', () => {
    const sessao = new SessaoUsuario();
    const ouvinte = vi.fn();
    const cancelar = sessao.observar(ouvinte);

    sessao.iniciar(criarToken(), 'Maria');
    expect(sessao.estaLogado()).toBe(true);
    expect(sessao.nome).toBe('Maria');
    expect(localStorage.getItem('bp_jwt_token')).not.toBeNull();
    expect(ouvinte).toHaveBeenCalledTimes(1);

    cancelar();
    sessao.encerrar();
    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(sessao.estaLogado()).toBe(false);
    expect(localStorage.getItem('bp_jwt_token')).toBeNull();
    expect(sessao.versao).toBe(2);
  });

  it('trata token vencido como deslogado e limpa o armazenamento', () => {
    localStorage.setItem('bp_jwt_token', criarToken(-60));
    localStorage.setItem('bp_cliente_nome', 'Maria');
    const sessao = new SessaoUsuario();
    expect(sessao.estaLogado()).toBe(false);
    expect(sessao.token).toBeNull();
    expect(localStorage.getItem('bp_jwt_token')).toBeNull();
  });

  it('restaura a sessão salva ao abrir o site', () => {
    localStorage.setItem('bp_jwt_token', criarToken());
    localStorage.setItem('bp_cliente_nome', 'Maria');
    const sessao = new SessaoUsuario();
    expect(sessao.estaLogado()).toBe(true);
    expect(sessao.nome).toBe('Maria');
  });
});

describe('ServicoConta', () => {
  it('não chama a API quando a validação local falha', async () => {
    const http = criarHttp();
    const servico = new ServicoConta(http, new SessaoUsuario());
    await expect(servico.entrar('', '')).rejects.toBeInstanceOf(ErroValidacao);
    await expect(
      servico.cadastrar({ nome: 'M', email: 'x', cpf: '1', senha: 'a', confirmarSenha: 'b' }),
    ).rejects.toBeInstanceOf(ErroValidacao);
  });

  it('entrar guarda a sessão devolvida pela API', async () => {
    const token = criarToken();
    const enviarJson = vi.fn().mockResolvedValue({ token, nome: 'Maria Souza' });
    const sessao = new SessaoUsuario();
    await new ServicoConta(criarHttp({ enviarJson }), sessao).entrar('maria@x.com', 'Abcdef1!');

    expect(enviarJson).toHaveBeenCalledWith('clientes.php?acao=login', { email: 'maria@x.com', senha: 'Abcdef1!' });
    expect(sessao.estaLogado()).toBe(true);
    expect(sessao.nome).toBe('Maria Souza');
  });

  it('cadastrar envia o CPF só com dígitos e não loga a pessoa', async () => {
    const enviarJson = vi.fn().mockResolvedValue(null);
    const sessao = new SessaoUsuario();
    await new ServicoConta(criarHttp({ enviarJson }), sessao).cadastrar({
      nome: 'Maria Souza', email: 'maria@x.com', cpf: '529.982.247-25', senha: 'Abcdef1!', confirmarSenha: 'Abcdef1!',
    });
    expect(enviarJson).toHaveBeenCalledWith('clientes.php?acao=registrar', {
      nome: 'Maria Souza', email: 'maria@x.com', cpf: '52998224725', senha: 'Abcdef1!',
    });
    expect(sessao.estaLogado()).toBe(false);
  });

  it('atualizarPerfil não manda senha em branco, manda o e-mail atual e atualiza o nome da sessão', async () => {
    const atualizarJson = vi.fn().mockResolvedValue({ id: 1, nome: 'Maria Nova', email: 'maria@x.com', cpf: '52998224725' });
    const sessao = new SessaoUsuario();
    sessao.iniciar(criarToken(), 'Maria Souza');
    const perfil = await new ServicoConta(criarHttp({ atualizarJson }), sessao).atualizarPerfil('maria@x.com', {
      nome: 'Maria Nova', email: '', cpf: '529.982.247-25', senha: '', confirmarSenha: '',
    });

    expect(atualizarJson).toHaveBeenCalledWith('clientes.php?acao=perfil', {
      nome: 'Maria Nova', email: 'maria@x.com', cpf: '52998224725',
    });
    expect(perfil.nome).toBe('Maria Nova');
    expect(sessao.nome).toBe('Maria Nova');
  });

  it('sugerirSenha devolve a senha do servidor', async () => {
    const enviarJson = vi.fn().mockResolvedValue({ senha: 'Abc123!xyz456' });
    const senha = await new ServicoConta(criarHttp({ enviarJson }), new SessaoUsuario()).sugerirSenha();
    expect(senha).toBe('Abc123!xyz456');
    expect(enviarJson).toHaveBeenCalledWith('clientes.php?acao=sugerir-senha', {});
  });
});
