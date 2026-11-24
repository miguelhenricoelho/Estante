import { criarConta, entrar } from '../api/api.js';
import { estado } from '../estado/estado.js';
import { criarCapa } from '../capas/capas.js';
import { mostrarToast } from '../toast/toast.js';
import { esc, prepararDialog, fecharDialog } from '../util/util.js';

const CHAVE = 'estante:usuario';
const ouvintes = new Set();

const dialog = document.getElementById('conta');
const form = document.getElementById('form-conta');
const titulo = document.getElementById('conta-titulo');
const rotulo = document.getElementById('conta-rotulo');
const aviso = document.getElementById('conta-aviso');
const erroGeral = document.getElementById('conta-erro');
const botao = document.getElementById('btn-conta');
const leque = document.getElementById('conta-leque');
const area = document.getElementById('area-usuario');
const forca = document.getElementById('senha-forca');

let usuario = lerSessao();
let modo = 'entrar';
let depoisDeEntrar = null;

// ---------- Sessão ----------
function lerSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE)); } catch { return null; }
}

function salvarSessao(novo) {
  usuario = novo;
  try {
    if (novo) localStorage.setItem(CHAVE, JSON.stringify(novo));
    else localStorage.removeItem(CHAVE);
  } catch { /* navegação privada */ }
  ouvintes.forEach((fn) => fn(usuario));
}

export const usuarioAtual = () => usuario;
export function aoMudarUsuario(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

// ---------- Cabeçalho ----------
function iniciais(nome) {
  const partes = String(nome || '?').trim().split(/\s+/);
  return (partes[0][0] + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

function renderArea() {
  if (!usuario) {
    area.innerHTML = '<button type="button" class="btn btn-fantasma" data-acao="entrar">Entrar</button>';
    return;
  }
  const primeiro = String(usuario.nome).trim().split(/\s+/)[0];
  area.innerHTML = `
    <details class="usuario-menu">
      <summary class="usuario-chip" aria-label="Menu da conta">
        <span class="usuario-avatar">${esc(iniciais(usuario.nome))}</span>
        <span class="usuario-nome">${esc(primeiro)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
      </summary>
      <div class="usuario-pop">
        <div class="usuario-pop-topo">
          <span class="usuario-avatar usuario-avatar--g">${esc(iniciais(usuario.nome))}</span>
          <div>
            <strong>${esc(usuario.nome)}</strong>
            <small>${esc(usuario.email)}</small>
          </div>
        </div>
        <button type="button" class="usuario-sair" data-acao="sair">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/></svg>
          Sair da conta
        </button>
      </div>
    </details>`;
}

// ---------- Modal ----------
function definirModo(novo) {
  modo = novo;
  const criando = modo === 'criar';
  dialog.dataset.modo = modo;
  titulo.textContent = criando ? 'Criar conta' : 'Entrar';
  rotulo.textContent = criando ? 'Novo por aqui' : 'Bem-vindo de volta';
  botao.querySelector('.btn-texto').textContent = criando ? 'Criar minha conta' : 'Entrar';
  form.elements.senha.autocomplete = criando ? 'new-password' : 'current-password';

  dialog.querySelectorAll('[data-modo]').forEach((aba) => {
    aba.setAttribute('aria-selected', String(aba.dataset.modo === modo));
  });
  form.querySelectorAll('[data-somente]').forEach((bloco) => {
    const ativo = bloco.dataset.somente === modo;
    bloco.hidden = !ativo;
    bloco.querySelectorAll('input').forEach((el) => { el.disabled = !ativo; });
  });

  limparErros();
}

function limparErros() {
  erroGeral.textContent = '';
  form.querySelectorAll('.campo--erro').forEach((c) => c.classList.remove('campo--erro'));
  form.querySelectorAll('.campo-erro').forEach((s) => { s.textContent = ''; });
}

function definirErro(nome, mensagem) {
  const campo = form.elements[nome]?.closest('.campo');
  if (!campo) return;
  campo.classList.toggle('campo--erro', Boolean(mensagem));
  campo.querySelector('.campo-erro').textContent = mensagem ?? '';
}

function validar(d) {
  const erros = {};
  if (modo === 'criar' && !d.nome) erros.nome = 'Como podemos te chamar?';
  if (!d.email) erros.email = 'Informe seu e-mail';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) erros.email = 'E-mail inválido';
  if (!d.senha) erros.senha = 'Informe sua senha';
  else if (modo === 'criar' && d.senha.length < 6) erros.senha = 'Mínimo de 6 caracteres';
  if (modo === 'criar' && d.senha && d.confirmar !== d.senha) erros.confirmar = 'As senhas não conferem';

  ['nome', 'email', 'senha', 'confirmar'].forEach((n) => definirErro(n, erros[n]));
  const primeiro = Object.keys(erros)[0];
  return primeiro ? form.elements[primeiro] : null;
}

function medirForca(senha) {
  let pontos = 0;
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) pontos++;
  const textos = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  forca.dataset.nivel = senha ? Math.max(pontos, 1) : 0;
  forca.querySelector('span').textContent = senha ? textos[Math.max(pontos, 1)] : '';
}

function montarLeque() {
  const livros = estado.livros.slice(0, 3);
  leque.replaceChildren(...livros.map((livro, i) => {
    const capa = criarCapa(livro, { tamanho: 'g' });
    capa.style.setProperty('--n', i);
    return capa;
  }));
}

function carregando(ativo) {
  botao.disabled = ativo;
  botao.classList.toggle('btn--carregando', ativo);
}

export function abrirConta({ modo: inicial = 'entrar', motivo = '', aoEntrar = null } = {}) {
  depoisDeEntrar = aoEntrar;
  form.reset();
  medirForca('');
  definirModo(inicial);
  aviso.hidden = !motivo;
  aviso.textContent = motivo;
  montarLeque();
  dialog.showModal();
  requestAnimationFrame(() => form.querySelector('input:not([disabled])').focus());
}

async function enviar(e) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  d.nome = String(d.nome ?? '').trim();
  d.email = String(d.email ?? '').trim();

  erroGeral.textContent = '';
  const invalido = validar(d);
  if (invalido) return invalido.focus();

  carregando(true);
  try {
    const conta = modo === 'criar'
      ? await criarConta({ nome: d.nome, email: d.email, senha: d.senha })
      : await entrar({ email: d.email, senha: d.senha });

    salvarSessao({ id: conta.id, nome: conta.nome, email: conta.email });
    fecharDialog(dialog);
    const primeiro = conta.nome.split(/\s+/)[0];
    mostrarToast(modo === 'criar' ? `Conta criada! Boas-vindas, ${primeiro}` : `Olá de novo, ${primeiro}`, 'sucesso');

    const proximo = depoisDeEntrar;
    depoisDeEntrar = null;
    if (proximo) setTimeout(proximo, 380);
  } catch (erro) {
    erroGeral.textContent = erro.message;
  } finally {
    carregando(false);
  }
}

export function iniciarConta() {
  prepararDialog(dialog, () => { depoisDeEntrar = null; });

  dialog.querySelectorAll('[data-modo]').forEach((aba) => {
    aba.addEventListener('click', () => {
      definirModo(aba.dataset.modo);
      form.querySelector('input:not([disabled])').focus();
    });
  });

  form.addEventListener('input', (e) => {
    if (e.target.name === 'senha' && modo === 'criar') medirForca(e.target.value);
    if (e.target.closest('.campo--erro')) definirErro(e.target.name, null);
    erroGeral.textContent = '';
  });

  // Mostrar / ocultar senha
  form.addEventListener('click', (e) => {
    const olho = e.target.closest('[data-olho]');
    if (!olho) return;
    const campo = olho.parentElement.querySelector('input');
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    olho.setAttribute('aria-pressed', String(mostrar));
    olho.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
  });

  form.addEventListener('submit', enviar);

  area.addEventListener('click', (e) => {
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'entrar') abrirConta();
    if (acao === 'sair') {
      salvarSessao(null);
      mostrarToast('Você saiu da conta', 'info');
    }
  });

  // Fecha o menu ao clicar fora
  document.addEventListener('click', (e) => {
    const menu = area.querySelector('.usuario-menu[open]');
    if (menu && !menu.contains(e.target)) menu.open = false;
  });

  aoMudarUsuario(renderArea);
  renderArea();
}
