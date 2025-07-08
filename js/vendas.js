const formVenda = document.getElementById('formVenda');
const clienteSelect = document.getElementById('cliente');
const produtoSelect = document.getElementById('produto');
const tabelaVendas = document.getElementById('tabelaVendas');

// Carregar e salvar dados
function carregarClientes() {
  const dados = localStorage.getItem('clientes');
  if (!dados) return [];
  const clientes = JSON.parse(dados);
  return clientes.map(cliente => {
    if (cliente.divida === undefined) cliente.divida = 0;
    return cliente;
  });
}

function salvarClientes(clientes) {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

function carregarProdutos() {
  const dados = localStorage.getItem('produtos');
  return dados ? JSON.parse(dados) : [];
}

function salvarProdutos(produtos) {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function carregarVendas() {
  const dados = localStorage.getItem('vendas');
  return dados ? JSON.parse(dados) : [];
}

function salvarVendas(vendas) {
  localStorage.setItem('vendas', JSON.stringify(vendas));
}

// Atualizar dívida do cliente
function atualizarDividaCliente(clienteIndex, valor) {
  const clientes = carregarClientes();
  if (clientes[clienteIndex]) {
    clientes[clienteIndex].divida += valor;
    salvarClientes(clientes);
  }
}

// Popular selects
function popularClientes() {
  const clientes = carregarClientes();
  clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';

  clientes.forEach((cliente, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = cliente.nome;
    clienteSelect.appendChild(option);
  });
}

function popularProdutos() {
  const produtos = carregarProdutos();
  produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';

  produtos.forEach((produto, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${produto.nome} (Estoque: ${produto.quantidade})`;
    produtoSelect.appendChild(option);
  });
}

// Tabela de vendas
function atualizarTabelaVendas() {
  const vendas = carregarVendas();
  const clientes = carregarClientes();
  const produtos = carregarProdutos();

  tabelaVendas.innerHTML = '';

  vendas.forEach((venda, index) => {
    const cliente = clientes[venda.clienteIndex];
    const produto = produtos[venda.produtoIndex];

    const valorUnitario = produto ? produto.preco : 0;
    const valorTotal = valorUnitario * venda.quantidade;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
      <td>${produto ? produto.nome : 'Produto não encontrado'}</td>
      <td>${venda.quantidade}</td>
      <td>R$ ${valorTotal.toFixed(2)}</td>
      <td>${venda.status}</td>
      <td>${venda.data}</td>
    `;
    tabelaVendas.appendChild(tr);
  });
}

// Enviar venda
formVenda.addEventListener('submit', (e) => {
  e.preventDefault();

  const clienteIndex = parseInt(clienteSelect.value, 10);
  const produtoIndex = parseInt(produtoSelect.value, 10);
  const quantidade = parseInt(formVenda.quantidade.value, 10);
  const status = formVenda.status.value;
  let data = formVenda.data.value;

  if (isNaN(clienteIndex) || isNaN(produtoIndex) || isNaN(quantidade) || quantidade <= 0 || !status) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  if (!data) {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    data = `${yyyy}-${mm}-${dd}`;
  }

  const produtos = carregarProdutos();
  const produto = produtos[produtoIndex];

  if (!produto || produto.quantidade < quantidade) {
    alert('Produto inválido ou estoque insuficiente.');
    return;
  }

  // Atualizar estoque
  produto.quantidade -= quantidade;
  produtos[produtoIndex] = produto;
  salvarProdutos(produtos);

  const valorTotal = produto.preco * quantidade;

  // Atualizar dívida se for "em aberto"
  if (status === 'aberto') {
    atualizarDividaCliente(clienteIndex, valorTotal);
  }

  // Salvar venda
  const vendas = carregarVendas();
  vendas.push({
    clienteIndex,
    produtoIndex,
    quantidade,
    status,
    data,
  });
  salvarVendas(vendas);

  formVenda.reset();
  popularProdutos();
  popularClientes();
  atualizarTabelaVendas();
});

// Inicialização
popularClientes();
popularProdutos();
atualizarTabelaVendas();
