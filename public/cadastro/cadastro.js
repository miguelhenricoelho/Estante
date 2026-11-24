import { estado, atualizar, categorias, autores } from '../estado/estado.js';
import { cadastrarLivro } from '../api/api.js';
import { criarCapa } from '../capas/capas.js';
import { mostrarToast } from '../toast/toast.js';
import { esc, debounce, prepararDialog, fecharDialog } from '../util/util.js';
import { usuarioAtual, abrirConta } from '../conta/conta.js';

const dialog = document.getElementById('cadastro');
const form = document.getElementById('form-cadastro');
const previa = document.getElementById('previa-capa');
const botaoSalvar = document.getElementById('btn-salvar');
const contador = document.getElementById('contador-descricao');
const listaCategorias = document.getElementById('lista-categorias');
const listaAutores = document.getElementById('lista-autores');

const REGRAS = {
  nome: (v) => (!v ? 'Informe o título do livro' : null),
  autor: (v) => (!v ? 'Informe o autor' : null),
  data_publicacao: (v) => {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) return 'Data inválida';
    if (d > new Date()) return 'A data não pode estar no futuro';
    return null;
  },
  imagem: (v) => (v && !/^https?:\/\/\S+$/i.test(v) ? 'Use um link começando com http:// ou https://' : null)
};

function lerDados() {
  const dados = Object.fromEntries(new FormData(form));
  for (const chave in dados) dados[chave] = String(dados[chave]).trim();
  return dados;
}

function definirErro(nome, mensagem) {
  const campo = form.elements[nome]?.closest('.campo');
  if (!campo) return;
  campo.classList.toggle('campo--erro', Boolean(mensagem));
  campo.querySelector('.campo-erro').textContent = mensagem ?? '';
  form.elements[nome].setAttribute('aria-invalid', mensagem ? 'true' : 'false');
}

function validar(dados, apenas) {
  let primeiroInvalido = null;
  for (const [nome, regra] of Object.entries(REGRAS)) {
    if (apenas && apenas !== nome) continue;
    const erro = regra(dados[nome]);
    definirErro(nome, erro);
    if (erro && !primeiroInvalido) primeiroInvalido = form.elements[nome];
  }
  return primeiroInvalido;
}

const atualizarPrevia = debounce(() => {
  const dados = lerDados();
  previa.replaceChildren(criarCapa({
    nome: dados.nome || 'Título do livro',
    autor: dados.autor || 'Nome do autor',
    categoria: dados.categoria || 'Categoria',
    imagem: dados.imagem
  }, { tamanho: 'g' }));
}, 90);

function preencherSugestoes() {
  listaCategorias.innerHTML = categorias().map((c) => `<option value="${esc(c.nome)}"></option>`).join('');
  listaAutores.innerHTML = autores().map((a) => `<option value="${esc(a)}"></option>`).join('');
}

function carregando(ativo) {
  botaoSalvar.disabled = ativo;
  botaoSalvar.classList.toggle('btn--carregando', ativo);
  form.querySelectorAll('input, textarea').forEach((el) => { el.readOnly = ativo; });
}

// Só quem está logado cadastra livros
function pedirCadastro() {
  if (usuarioAtual()) return abrirCadastro();
  abrirConta({ motivo: 'Entre na sua conta para cadastrar livros.', aoEntrar: abrirCadastro });
}

export function abrirCadastro() {
  form.reset();
  Object.keys(REGRAS).forEach((n) => definirErro(n, null));
  contador.textContent = '0/600';
  preencherSugestoes();
  atualizarPrevia();
  dialog.showModal();
  requestAnimationFrame(() => form.elements.nome.focus());
}

async function enviar(e) {
  e.preventDefault();
  const dados = lerDados();
  const invalido = validar(dados);
  if (invalido) {
    invalido.focus();
    return;
  }

  carregando(true);
  try {
    const livro = await cadastrarLivro(dados);
    atualizar({
      livros: [livro, ...estado.livros],
      busca: '',
      categoria: 'todas',
      ordem: 'recentes',
      destaque: livro.id
    });
    fecharDialog(dialog);
    mostrarToast(`“${livro.nome}” foi adicionado ao acervo`, 'sucesso');
    document.querySelector('.catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (erro) {
    mostrarToast(erro.message || 'Não foi possível salvar o livro', 'erro');
  } finally {
    carregando(false);
  }
}

export function iniciarCadastro() {
  prepararDialog(dialog);
  document.getElementById('btn-novo').addEventListener('click', pedirCadastro);

  form.addEventListener('input', (e) => {
    const { name } = e.target;
    if (name === 'descricao') contador.textContent = `${e.target.value.length}/600`;
    if (e.target.closest('.campo--erro')) validar(lerDados(), name);
    if (['nome', 'autor', 'categoria', 'imagem'].includes(name)) atualizarPrevia();
  });

  form.addEventListener('focusout', (e) => {
    const { name } = e.target;
    if (name in REGRAS && e.target.value) validar(lerDados(), name);
  });

  form.addEventListener('submit', enviar);

  // Atalho: N abre o cadastro
  document.addEventListener('keydown', (e) => {
    const digitando = e.target.closest('input, textarea, select, [contenteditable]');
    if (e.key.toLowerCase() === 'n' && !digitando && !e.metaKey && !e.ctrlKey && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      pedirCadastro();
    }
  });
}
