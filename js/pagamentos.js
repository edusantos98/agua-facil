const tabelaPagamentos = document.getElementById('tabelaPagamentos');
const historicoPagamentos = document.getElementById('historicoPagamentos');

// Carrega lista de clientes
function carregarClientes() {
  const dados = localStorage.getItem('clientes');
  return dados ? JSON.parse(dados) : [];
}

// Salva lista de clientes
function salvarClientes(clientes) {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Carrega histórico de pagamentos
function carregarHistorico() {
  const dados = localStorage.getItem('historicoPagamentos');
  return dados ? JSON.parse(dados) : [];
}

// Salva histórico de pagamentos
function salvarHistorico(lista) {
  localStorage.setItem('historicoPagamentos', JSON.stringify(lista));
}

// Exibe clientes com dívida e cria campo para abater valor
function atualizarTabelaPagamentos() {
  const clientes = carregarClientes();
  tabelaPagamentos.innerHTML = '';

  clientes.forEach((cliente, index) => {
    if ((cliente.divida || 0) > 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.bairro}</td>
        <td>R$ ${cliente.divida.toFixed(2)}</td>
        <td>
          <input type="number" id="abatimento-${index}" placeholder="R$" min="0" step="0.01">
        </td>
        <td>
          <button onclick="abaterDivida(${index})">Abater</button>
        </td>
      `;
      tabelaPagamentos.appendChild(tr);
    }
  });
}

// Atualiza tabela de histórico de pagamentos
function atualizarHistoricoPagamentos() {
  const historico = carregarHistorico();
  historicoPagamentos.innerHTML = '';

  // Mostra os pagamentos do mais recente para o mais antigo
  historico.slice().reverse().forEach((pagamento, indexReverso) => {
    const indexOriginal = historico.length - 1 - indexReverso;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pagamento.nome}</td>
      <td>R$ ${pagamento.valor.toFixed(2)}</td>
      <td>${pagamento.data}</td>
      <td>
        <button onclick="removerPagamento(${indexOriginal})">🗑️</button>
      </td>
    `;
    historicoPagamentos.appendChild(tr);
  });
}

// Função para remover pagamento e restaurar dívida do cliente
function removerPagamento(index) {
  const historico = carregarHistorico();
  const pagamento = historico[index];
  if (!pagamento) return;

  const confirmar = confirm(`Deseja remover o pagamento de R$ ${pagamento.valor.toFixed(2)} feito por ${pagamento.nome}?`);
  if (!confirmar) return;

  const clientes = carregarClientes();
  const cliente = clientes.find(c => c.nome === pagamento.nome);

  if (cliente) {
    cliente.divida += pagamento.valor;
    salvarClientes(clientes);
  }

  historico.splice(index, 1);
  salvarHistorico(historico);

  atualizarTabelaPagamentos();
  atualizarHistoricoPagamentos();
}

// Função para abater valor da dívida e registrar no histórico
function abaterDivida(index) {
  const input = document.getElementById(`abatimento-${index}`);
  const valor = parseFloat(input.value);

  if (isNaN(valor) || valor <= 0) {
    alert("Informe um valor válido para abater.");
    return;
  }

  const clientes = carregarClientes();
  const cliente = clientes[index];

  if (!cliente) {
    alert("Cliente não encontrado.");
    return;
  }

  if (valor > cliente.divida) {
    alert("O valor é maior que a dívida do cliente.");
    return;
  }

  cliente.divida -= valor;
  salvarClientes(clientes);

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR');

  const historico = carregarHistorico();
  historico.push({
  nome: cliente.nome,
  valor,
  data: dataFormatada,
  clienteIndex: index
});

  salvarHistorico(historico);

  atualizarTabelaPagamentos();
  atualizarHistoricoPagamentos();
}

// Inicializa as tabelas
atualizarTabelaPagamentos();
atualizarHistoricoPagamentos();
