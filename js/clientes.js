const formCliente = document.getElementById('formCliente');
const tabelaClientes = document.getElementById('tabelaClientes');
const filtroBairro = document.getElementById('filtroBairro');

// --- Carregamento de dados do localStorage ---
function carregarClientes() {
  const dados = localStorage.getItem('clientes');
  return dados ? JSON.parse(dados) : [];
}

function salvarClientes(clientes) {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

function carregarVendas() {
  const dados = localStorage.getItem('vendas');
  return dados ? JSON.parse(dados) : [];
}

function carregarPagamentos() {
  const dados = localStorage.getItem('historicoPagamentos'); // <- nome certo
  return dados ? JSON.parse(dados) : [];
}


function salvarPagamentos(lista) {
  localStorage.setItem('historicoPagamentos', JSON.stringify(lista));
}


function carregarProdutos() {
  const dados = localStorage.getItem('produtos');
  return dados ? JSON.parse(dados) : [];
}
// --- Atualiza a lista de clientes com filtro por bairro ---
function atualizarTabelaClientes() {
  const clientes = carregarClientes();
  const filtro = filtroBairro.value;
  tabelaClientes.innerHTML = '';

  clientes.forEach((cliente, index) => {
    if (filtro !== 'todos' && cliente.bairro !== filtro) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.telefone || ''}</td>
      <td>${cliente.bairro || ''}</td>
      <td>R$ ${cliente.divida?.toFixed(2) || '0.00'}</td>
      <td>
        <button onclick="verHistoricoCliente(${index})">🕘 Ver histórico</button>
        <button onclick="editarCliente(${index})">✏️ Editar</button>
        <button onclick="excluirCliente(${index})">🗑️ Excluir</button>
      </td>
    `;
    tabelaClientes.appendChild(tr);
  });
}

// --- Cadastrar novo cliente ---
function cadastrarClienteFormulario() {
  const nome = formCliente.nome.value.trim();
  const telefone = formCliente.telefone.value.trim();
  const bairro = formCliente.bairro.value;

  if (!nome || !bairro) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const clientes = carregarClientes();
  clientes.push({ nome, telefone, bairro, divida: 0 });
  salvarClientes(clientes);
  atualizarTabelaClientes();
  alert("Cliente cadastrado!");
  formCliente.reset();
}

// --- Editar cliente ---
function editarCliente(index) {
  const clientes = carregarClientes();
  const cliente = clientes[index];

  document.getElementById('editIndex').value = index;
  document.getElementById('editNome').value = cliente.nome;
  document.getElementById('editTelefone').value = cliente.telefone || '';
  document.getElementById('editBairro').value = cliente.bairro || '';

  document.getElementById('formEdicao').style.display = 'block';
}

function salvarEdicaoCliente(event) {
  event.preventDefault();

  const index = parseInt(document.getElementById('editIndex').value);
  const nome = document.getElementById('editNome').value.trim();
  const telefone = document.getElementById('editTelefone').value.trim();
  const bairro = document.getElementById('editBairro').value;

  if (!nome || !bairro) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const clientes = carregarClientes();
  clientes[index] = { ...clientes[index], nome, telefone, bairro };
  salvarClientes(clientes);
  atualizarTabelaClientes();

  document.getElementById('formEdicao').style.display = 'none';
}

function cancelarEdicao() {
  document.getElementById('formEdicao').style.display = 'none';
}


// --- Excluir cliente ---
function excluirCliente(index) {
  const clientes = carregarClientes();
  const cliente = clientes[index];

  if (cliente.divida > 0) {
    alert("Este cliente possui uma dívida e não pode ser excluído.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

  clientes.splice(index, 1);
  salvarClientes(clientes);
  atualizarTabelaClientes();
}


// --- Ver histórico do cliente ---
function verHistoricoCliente(index) {
  const clientes = carregarClientes();
  const vendas = carregarVendas();
  const pagamentos = carregarPagamentos();
  const cliente = clientes[index];

  const listaCompras = document.getElementById('listaCompras');
  const listaPagamentos = document.getElementById('listaPagamentos');
  const nomeHistorico = document.getElementById('nomeHistorico');

  listaCompras.innerHTML = '';
  listaPagamentos.innerHTML = '';
  nomeHistorico.textContent = cliente.nome;

  const comprasDoCliente = vendas.filter(v => v.clienteIndex === index);
  if (comprasDoCliente.length > 0) {
    comprasDoCliente.forEach(venda => {
      const produto = carregarProdutos()[venda.produtoIndex]?.nome || 'Produto';
      const item = document.createElement('li');
      item.textContent = `${venda.quantidade}x ${produto} - ${venda.status.toUpperCase()} - ${venda.data}`;
      listaCompras.appendChild(item);
    });
  } else {
    listaCompras.innerHTML = '<li>Nenhuma compra registrada.</li>';
  }

  const pagamentosDoCliente = pagamentos.filter(p => p.clienteIndex === index);
  if (pagamentosDoCliente.length > 0) {
    pagamentosDoCliente.forEach(p => {
      const item = document.createElement('li');
      item.textContent = `R$ ${p.valor.toFixed(2)} - ${p.data}`;
      listaPagamentos.appendChild(item);
    });
  } else {
    listaPagamentos.innerHTML = '<li>Nenhum pagamento registrado.</li>';
  }

  document.querySelector('.historico-cliente').style.display = 'block';
}

function fecharHistorico() {
  document.querySelector('.historico-cliente').style.display = 'none';
}

// --- Eventos iniciais ---
formCliente.addEventListener('submit', (e) => {
  e.preventDefault();
  cadastrarClienteFormulario();
});

filtroBairro.addEventListener('change', atualizarTabelaClientes);

// --- Inicialização ---
atualizarTabelaClientes();
