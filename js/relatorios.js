function carregarVendas() {
  const dados = localStorage.getItem('vendas');
  return dados ? JSON.parse(dados) : [];
}

function carregarProdutos() {
  const dados = localStorage.getItem('produtos');
  return dados ? JSON.parse(dados) : [];
}

function carregarClientes() {
  const dados = localStorage.getItem('clientes');
  return dados ? JSON.parse(dados) : [];
}

function dataHojeFormatada() {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Agrupa vendas por produto e status para facilitar relatório
function agruparVendasPorProdutoEVenda(vendas, produtos, dataFiltro) {
  // Vai retornar array com {produtoNome, categoria, quantidade, valorTotal, status}
  const agrupado = [];

  vendas.forEach(venda => {
    if (venda.data !== dataFiltro) return;

    const produto = produtos[venda.produtoIndex];
    if (!produto) return;

    const valor = venda.quantidade * produto.preco;

    // Verifica se já existe agrupado esse produto com status igual
    let item = agrupado.find(i => i.produtoNome === produto.nome && i.status === venda.status);
    if (!item) {
      item = {
        produtoNome: produto.nome,
        categoria: produto.categoria,
        quantidade: 0,
        valorTotal: 0,
        status: venda.status
      };
      agrupado.push(item);
    }

    item.quantidade += venda.quantidade;
    item.valorTotal += valor;
  });

  return agrupado;
}

function preencherTabelaRelatorio(agrupadas) {
  const tbody = document.getElementById('tabelaRelatorio');
  tbody.innerHTML = '';

  // Vamos agrupar por produto, somar vendidos totais e status
  // Para facilitar, vamos fazer um mapa para juntar status
  const mapProdutos = {};

  agrupadas.forEach(item => {
    if (!mapProdutos[item.produtoNome]) {
      mapProdutos[item.produtoNome] = {
        fardos: 0,
        galoes: 0,
        total: 0,
        pagos: 0,
        emAberto: 0,
      };
    }

    if (item.categoria === 'Fardo') {
      mapProdutos[item.produtoNome].fardos += item.quantidade;
    } else if (item.categoria === 'Galao') {
      mapProdutos[item.produtoNome].galoes += item.quantidade;
    }

    mapProdutos[item.produtoNome].total += item.valorTotal;
    if (item.status === 'pago') {
      mapProdutos[item.produtoNome].pagos += item.valorTotal;
    } else {
      mapProdutos[item.produtoNome].emAberto += item.valorTotal;
    }
  });

  // Agora monta linhas para cada produto
  for (const produtoNome in mapProdutos) {
    const dados = mapProdutos[produtoNome];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${produtoNome}</td>
      <td>${dados.fardos}</td>
      <td>${dados.galoes}</td>
      <td>R$ ${dados.total.toFixed(2)}</td>
      <td>R$ ${dados.pagos.toFixed(2)}</td>
      <td>R$ ${dados.emAberto.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function calcularRelatorioDiario() {
  const vendas = carregarVendas();
  const produtos = carregarProdutos();
  const clientes = carregarClientes();
  const hoje = dataHojeFormatada();

  const agrupadas = agruparVendasPorProdutoEVenda(vendas, produtos, hoje);

  let galoesVendidos = 0;
  let fardosVendidos = 0;
  let valorTotal = 0;
  let valorPago = 0;
  let valorAberto = 0;
  let clientesQueCompraram = new Set();
  let vendasAbertasAtrasadas = 0;
  let vendasHojeCount = 0;

  const quantidadePorProduto = {};

  agrupadas.forEach(item => {
    if (item.categoria === 'Galao') galoesVendidos += item.quantidade;
    if (item.categoria === 'Fardo') fardosVendidos += item.quantidade;

    valorTotal += item.valorTotal;
    if (item.status === 'pago') valorPago += item.valorTotal;
    else valorAberto += item.valorTotal;

    quantidadePorProduto[item.produtoNome] = (quantidadePorProduto[item.produtoNome] || 0) + item.quantidade;
  });

  vendas.forEach(v => {
    if (v.data === hoje) {
      clientesQueCompraram.add(v.clienteIndex);
      vendasHojeCount++;
      if (v.status !== 'pago') {
        const dataVenda = new Date(v.data);
        const hojeData = new Date(hoje);
        if (dataVenda < hojeData) vendasAbertasAtrasadas++;
      }
    }
  });

  const clientesComDividaCount = clientes.filter(c => c.divida && c.divida > 0).length;

  const valorMedioVenda = vendasHojeCount > 0 ? valorTotal / vendasHojeCount : 0;
  const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;

  let produtoMaisVendido = '-';
  let maiorQtd = 0;
  for (const produto in quantidadePorProduto) {
    if (quantidadePorProduto[produto] > maiorQtd) {
      maiorQtd = quantidadePorProduto[produto];
      produtoMaisVendido = produto;
    }
  }

  preencherTabelaRelatorio(agrupadas);

  document.getElementById('clientesAtivosHoje').textContent = clientesQueCompraram.size;
  document.getElementById('clientesComDivida').textContent = clientesComDividaCount;
  document.getElementById('galoesVendidos').textContent = galoesVendidos;
  document.getElementById('fardosVendidos').textContent = fardosVendidos;
  document.getElementById('valorTotal').textContent = `R$ ${valorTotal.toFixed(2)}`;
  document.getElementById('valorMedioVenda').textContent = `R$ ${valorMedioVenda.toFixed(2)}`;
  document.getElementById('valorPago').textContent = `R$ ${valorPago.toFixed(2)}`;
  document.getElementById('percentualPago').textContent = `${percentualPago.toFixed(1)}%`;
  document.getElementById('valorAberto').textContent = `R$ ${valorAberto.toFixed(2)}`;
  document.getElementById('vendasAtrasadas').textContent = vendasAbertasAtrasadas;
  document.getElementById('produtoMaisVendido').textContent = produtoMaisVendido;
  document.getElementById('dividaAtiva').textContent = `R$ ${clientes.reduce((acc, c) => acc + (c.divida || 0), 0).toFixed(2)}`;
}

function limparRelatorio() {
  const vendas = carregarVendas();
  const hoje = dataHojeFormatada();

  const vendasDoDia = vendas.filter(v => v.data === hoje);
  const outrasVendas = vendas.filter(v => v.data !== hoje);

  if (vendasDoDia.length === 0) {
    alert("Nenhum relatório de hoje para limpar.");
    return;
  }

  const confirmar = confirm("Deseja limpar os relatórios de vendas de hoje?");
  if (!confirmar) return;

  localStorage.setItem('vendas_backup', JSON.stringify(vendasDoDia));
  localStorage.setItem('vendas', JSON.stringify(outrasVendas));

  alert("Relatórios de hoje foram limpos.");
  calcularRelatorioDiario();
}

function desfazerLimpeza() {
  const backup = localStorage.getItem('vendas_backup');
  if (!backup) {
    alert("Nenhum backup encontrado.");
    return;
  }

  const vendasBackup = JSON.parse(backup);
  const vendasAtuais = carregarVendas();

  const novasVendas = [...vendasAtuais, ...vendasBackup];
  localStorage.setItem('vendas', JSON.stringify(novasVendas));
  localStorage.removeItem('vendas_backup');

  alert("Relatórios restaurados.");
  calcularRelatorioDiario();
}

// Inicializa o relatório quando a página carrega
calcularRelatorioDiario();
