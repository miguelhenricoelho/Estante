import { estado, atualizar, observar, categorias } from '../estado/estado.js';
import { esc, debounce, normalizar } from '../util/util.js';

const secao = document.getElementById('filtros');
const busca = document.getElementById('busca');
const ordem = document.getElementById('ordem');
const chips = document.getElementById('chips');

let assinatura = '';

function renderChips() {
  const lista = categorias();
  const ativa = normalizar(estado.categoria);
  const nova = `${ativa}#${lista.map((c) => `${c.nome}:${c.total}`).join('|')}#${estado.livros.length}`;
  if (nova === assinatura) return;
  assinatura = nova;

  const botao = (valor, nome, total) => {
    const selecionado = valor === 'todas' ? estado.categoria === 'todas' : normalizar(valor) === ativa;
    return `<button type="button" class="chip" data-categoria="${esc(valor)}" aria-pressed="${selecionado}">
      ${esc(nome)}<span>${total}</span>
    </button>`;
  };

  chips.innerHTML = [
    botao('todas', 'Todas', estado.livros.length),
    ...lista.map((c) => botao(c.nome, c.nome, c.total))
  ].join('');
}

function sincronizarCampos() {
  if (busca.value !== estado.busca) busca.value = estado.busca;
  if (ordem.value !== estado.ordem) ordem.value = estado.ordem;
  renderChips();
}

export function iniciarFiltros() {
  const aoDigitar = debounce(() => atualizar({ busca: busca.value, destaque: null }), 120);
  busca.addEventListener('input', aoDigitar);

  busca.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && busca.value) {
      e.stopPropagation();
      busca.value = '';
      atualizar({ busca: '' });
    }
  });

  ordem.addEventListener('change', () => atualizar({ ordem: ordem.value }));

  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    atualizar({ categoria: chip.dataset.categoria, destaque: null });
  });

  // Atalho "/" para focar a busca
  document.addEventListener('keydown', (e) => {
    const digitando = e.target.closest('input, textarea, select, [contenteditable]');
    if (e.key === '/' && !digitando && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      busca.focus();
      busca.select();
    }
  });

  // Sombra quando a barra gruda no topo
  const sentinela = document.createElement('div');
  sentinela.setAttribute('aria-hidden', 'true');
  secao.before(sentinela);
  new IntersectionObserver(([entrada]) => {
    secao.classList.toggle('filtros--fixo', !entrada.isIntersecting);
  }, { rootMargin: '-69px 0px 0px 0px' }).observe(sentinela);

  observar(sincronizarCampos);
  sincronizarCampos();
}
