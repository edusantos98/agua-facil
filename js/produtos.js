// =============================
// VARIÁVEIS E ELEMENTOS INICIAIS
// =============================
const formProduto = document.getElementById('formProduto');
const tabelaProdutos = document.getElementById('tabelaProdutos');
const categoriaSelect = document.getElementById('categoria');
const produtoSelect = document.getElementById('produto');

const opcoesGalao = [
  "Galão 20L - Soledade",
  "Galão 10L - Soledade"
];

const opcoesFardo = [
  "Fardo sem Gás 500ml - Soledade",
  "Fardo com Gás 500ml - Soledade",
  "Fardo com Gás 500ml - Raposo",
  "Fardo sem Gás 500ml - Raposo",
  "Fardo com Gás 1,5l - Soledade",
  "Fardo sem Gás 1,5l - Soledade",
  "Fardo sem Gás 1,5l - Raposo",
  "Fardo com Gás 1,5l - Raposo",
  "Fardo Carbônica Gasosa 500ml - Raposo"
];

// =============================
// FUNÇÕES DE LOCALSTORAGE
// =============================

// Carrega produtos do localStorage
function carregarProdutos() {
  const dados = localStorage.getItem('produtos');
  return dados ? JSON.parse(dados) : [];
}

// Salva produtos no localStorage
function salvarProdutos(produtos) {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

// Carrega histórico
function carregarHistorico() {
  const dados = localStorage.getItem('historicoProdutos');
  return dados ? JSON.parse(dados) : [];
}

// Salva histórico
function salvarHistorico(historico) {
  localStorage.setItem('historicoProdutos', JSON.stringify(historico));
}

// Registra uma ação no histórico (cadastrar ou editar)
function registrarHistorico(acao, produtoNome) {
  const historico = carregarHistorico();
  const data = new Date().toLocaleString('pt-BR');

  historico.unshift({
    acao,
    produto: produtoNome,
    data
  });

  if (historico.length > 30) historico.pop(); // mantém no máximo 30 registros

  salvarHistorico(historico);
  atualizarHistorico();
}

// =============================
// FUNÇÕES DE INTERFACE (TABELAS / EXIBIÇÃO)
// =============================

// Atualiza a lista de produtos na tabela
function atualizarTabela() {
  const produtos = carregarProdutos();
  tabelaProdutos.innerHTML = '';

  produtos.forEach((produto, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${produto.nome}</td>
      <td>${produto.categoria}</td>
      <td>${produto.quantidade}</td>
      <td>R$ ${produto.preco.toFixed(2)}</td>
      <td>
        <button onclick="editarProduto(${index})">Editar</button>
        <button onclick="excluirProduto(${index})">Excluir</button>
      </td>
    `;

    tabelaProdutos.appendChild(tr);
  });
}

// Atualiza o histórico de ações na tela
function atualizarHistorico() {
  const lista = document.getElementById('listaHistorico');
  if (!lista) return;

  const historico = carregarHistorico();
  lista.innerHTML = '';

  historico.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `[${item.data}] ${item.acao} - ${item.produto}`;
    lista.appendChild(li);
  });
}

// Preenche os produtos conforme a categoria selecionada
function preencherProdutosPorCategoria(categoria) {
  let opcoes = [];

  if (categoria === 'Galao') opcoes = opcoesGalao;
  else if (categoria === 'Fardo') opcoes = opcoesFardo;

  produtoSelect.innerHTML = `<option value="">Selecione um produto</option>`;
  opcoes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    produtoSelect.appendChild(opt);
  });
}

// =============================
// EVENTOS
// =============================

// Quando muda a categoria, carrega os produtos dela
categoriaSelect.addEventListener('change', () => {
  const categoria = categoriaSelect.value;
  preencherProdutosPorCategoria(categoria);
});

// Quando o formulário é enviado (cadastrar novo produto)
formProduto.addEventListener('submit', (e) => {
  e.preventDefault();

  const categoria = categoriaSelect.value;
  const nome = produtoSelect.value;
  const quantidade = parseInt(formProduto.quantidade.value, 10);
  const preco = parseFloat(formProduto.preco.value);

  if (!nome || isNaN(quantidade) || isNaN(preco)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const produtos = carregarProdutos();

  const jaExiste = produtos.some(p => p.nome === nome);
  if (jaExiste) {
    alert('Produto já cadastrado!');
    return;
  }

  produtos.push({ nome, categoria, quantidade, preco });
  salvarProdutos(produtos);
  registrarHistorico('Produto cadastrado', nome);

  formProduto.reset();
  produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
  atualizarTabela();
});

// =============================
// AÇÕES DE BOTÕES
// =============================

// Excluir produto da lista
function excluirProduto(index) {
  const produtos = carregarProdutos();
  const produto = produtos[index];

  if (!produto) return;

  if ((produto.quantidade || 0) > 0) {

    alert(`Não é possível excluir o produto "${produto.nome}" porque ainda tem estoque.`);
    return; // Impede continuar a exclusão
  }

  const confirmar = confirm(`Deseja realmente excluir o produto "${produto.nome}"?`);
  if (!confirmar) return;

  produtos.splice(index, 1);
  salvarProdutos(produtos);
  atualizarTabela();
}


// Editar produto (quantidade e preço)
function editarProduto(index) {
  const produtos = carregarProdutos();
  const produto = produtos[index];

  if (!produto) return;

  const novoPreco = prompt(`Novo preço para ${produto.nome}:`, produto.preco);
  const novaQtd = prompt(`Nova quantidade para ${produto.nome}:`, produto.quantidade);

  if (novoPreco !== null && novaQtd !== null) {
    produto.preco = parseFloat(novoPreco);
    produto.quantidade = parseInt(novaQtd, 10);
    produtos[index] = produto;
    salvarProdutos(produtos);
    registrarHistorico('Produto editado', produto.nome);
    atualizarTabela();
  }
}

// =============================
// INICIALIZA A PÁGINA
// =============================
atualizarTabela();
atualizarHistorico(); // se a lista estiver na página
