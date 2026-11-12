/* BOARD POINT — Admin: script compartilhado entre as páginas internas.
   Autenticação por JWT: o token fica no localStorage e vai em
   "Authorization: Bearer ..." em toda requisição. */

const API_BASE = '../api/';
const CHAVE_TOKEN_ADMIN = 'bp_admin_token';

function lerTokenAdmin() {
  try { return localStorage.getItem(CHAVE_TOKEN_ADMIN); } catch { return null; }
}

function apagarTokenAdmin() {
  try { localStorage.removeItem(CHAVE_TOKEN_ADMIN); } catch { /* ignora */ }
}

function irParaLogin() {
  apagarTokenAdmin();
  window.location.href = '../login.html';
}

async function apiFetch(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});
  const token = lerTokenAdmin();
  if (token) headers.set('Authorization', 'Bearer ' + token);

  const resp = await fetch(API_BASE + caminho, { ...opcoes, headers });
  const data = await resp.json();
  if (!data.sucesso && resp.status === 401) {
    irParaLogin();
    throw new Error('Não autenticado');
  }
  return data;
}

function mostrarToast(mensagem, tipo = 'sucesso') {
  let toast = document.getElementById('toastGlobal');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastGlobal';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  toast.className = 'toast mostrar' + (tipo === 'erro' ? ' erro' : '');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('mostrar'), 3200);
}

async function protegerPagina() {
  if (!lerTokenAdmin()) {
    irParaLogin();
    return null;
  }
  try {
    const data = await apiFetch('auth.php?acao=status');
    if (!data.dados || !data.dados.autenticado) {
      irParaLogin();
      return null;
    }
    const elUsuario = document.getElementById('usuarioLogado');
    if (elUsuario) elUsuario.textContent = data.dados.usuario;
    return data.dados.usuario;
  } catch (e) {
    irParaLogin();
    return null;
  }
}

function configurarBotaoSair() {
  const botao = document.getElementById('botaoSair');
  if (!botao) return;
  botao.addEventListener('click', async () => {
    try { await apiFetch('auth.php?acao=logout', { method: 'POST' }); } catch { /* sai mesmo assim */ }
    irParaLogin();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  protegerPagina();
  configurarBotaoSair();
});