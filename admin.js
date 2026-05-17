/*
  ============================================================
  AUTOPRIME — Painel Administrativo
  Arquivo: admin.js
  Descrição: Toda a lógica do painel administrativo:
    1. Autenticação (CPF + Senha) com sessão em sessionStorage
    2. CRUD de veículos persistido em localStorage
    3. Renderização da tabela com filtro em tempo real
    4. Dashboard com estatísticas calculadas dinamicamente
    5. Sistema de notificações (toasts) e modal de confirmação
  ============================================================
*/

/* ============================================================
   1. CREDENCIAIS DE ACESSO
   Em um sistema real, isso JAMAIS ficaria no frontend.
   A validação seria feita pelo servidor (back-end) com
   banco de dados e criptografia (bcrypt/hash).
   Para este protótipo acadêmico, usamos credenciais fixas.
============================================================ */
const CREDENCIAIS = {
  cpf: "000.000.000-00",
  senha: "1234"
};

/*
  Chave usada para armazenar dados no localStorage.
  O localStorage é um banco de dados chave-valor no navegador
  que persiste mesmo após fechar e reabrir o browser.
  A chave "autoprime_veiculos" identifica nossos dados.
*/
const STORAGE_KEY = "autoprime_veiculos";

/*
  Chave para sessionStorage: guarda a sessão enquanto a aba
  estiver aberta. Ao fechar o navegador, a sessão é encerrada.
*/
const SESSION_KEY = "autoprime_admin_logado";

/* ID do veículo a ser excluído (guardado ao abrir confirmação) */
let idParaExcluir = null;

/* Modo atual do formulário: "novo" ou "editar" */
let modoFormulario = "novo";


/* ============================================================
   2. BANCO DE DADOS INICIAL (SEED)
   Os mesmos veículos do script.js do site principal.
   Quando o admin.js carrega pela primeira vez, verifica se
   já há dados no localStorage. Se não houver, insere estes
   dados como ponto de partida (seed = "semente inicial").
============================================================ */
const veiculosSeed = [
  { id: 1, marca: "Volkswagen", modelo: "Passat 2.0 TSI Highline",  ano: 2021, quilometragem: 38000,  preco: 148900, imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", descricao: "Sedã premium com motorização turbo flex, bancos em couro, painel digital e tecnologia de assistência ao condutor. Revisões em dia na concessionária autorizada." },
  { id: 2, marca: "Toyota",     modelo: "Corolla XEi 2.0",          ano: 2022, quilometragem: 22000,  preco: 139900, imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80", descricao: "Um dos sedãs mais confiáveis do mercado. Câmbio automático CVT, multimídia com Android Auto e Apple CarPlay, sensor de estacionamento traseiro e câmera de ré." },
  { id: 3, marca: "Honda",      modelo: "Civic Touring Turbo",       ano: 2023, quilometragem: 11500,  preco: 165000, imagem: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80", descricao: "Honda Sensing completo com frenagem automática de emergência, controle de cruzeiro adaptativo e alerta de colisão frontal. Teto solar panorâmico." },
  { id: 4, marca: "Chevrolet",  modelo: "Onix Plus Premier",         ano: 2022, quilometragem: 31000,  preco: 94900,  imagem: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", descricao: "Sedã compacto com câmbio automático de 6 velocidades, multimídia Mylink de 8 polegadas, sistema de som premium Bose e ar-condicionado automático bizona." },
  { id: 5, marca: "Jeep",       modelo: "Compass Limited T270",      ano: 2021, quilometragem: 47000,  preco: 159900, imagem: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80", descricao: "SUV 5 lugares com tração 4x4 inteligente, suspensão traseira multilink, bancos em couro com ajuste elétrico e teto solar panorâmico." },
  { id: 6, marca: "Hyundai",    modelo: "HB20S Platinum Plus",       ano: 2023, quilometragem: 9800,   preco: 87500,  imagem: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80", descricao: "Sedã compacto 1.6 automático com novo design externo, câmera de ré e multimídia 10.25 polegadas com espelhamento sem fio." },
  { id: 7, marca: "Ford",       modelo: "Territory Titanium",        ano: 2022, quilometragem: 28500,  preco: 142000, imagem: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80", descricao: "SUV médio com transmissão automática CVT, SYNC 3 com tela sensível ao toque de 8 polegadas e assistente de frenagem de emergência." },
  { id: 8, marca: "Volkswagen", modelo: "T-Cross Highline 1.4",      ano: 2023, quilometragem: 15300,  preco: 128900, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80", descricao: "SUV compacto com motor 1.4 turbo de 150cv, painel digital Active Info Display e câmera de ré 180°." }
];


/* ============================================================
   3. FUNÇÕES DE PERSISTÊNCIA (localStorage)
   Encapsulam leitura e escrita no localStorage para que o
   resto do código não precise saber dos detalhes.
============================================================ */

/**
 * Lê o array de veículos do localStorage.
 * JSON.parse() converte a string armazenada de volta para objeto JS.
 * Se não houver dados ainda, retorna o seed inicial e o salva.
 * @returns {Array} - Array de objetos veículo.
 */
function lerVeiculos() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    return JSON.parse(dados);
  }
  // Primeira vez: inicializa com o seed
  salvarVeiculos(veiculosSeed);
  return veiculosSeed;
}

/**
 * Salva o array completo de veículos no localStorage.
 * JSON.stringify() converte o objeto JS para string (JSON).
 * @param {Array} lista - Array de objetos veículo.
 */
function salvarVeiculos(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

/**
 * Gera um ID único incremental para novos veículos.
 * Pega o maior ID existente e soma 1.
 * @param {Array} lista - Lista atual de veículos.
 * @returns {number} - Novo ID único.
 */
function gerarNovoId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map(v => v.id)) + 1;
}


/* ============================================================
   4. FUNÇÕES AUXILIARES DE FORMATAÇÃO
   (Mesmas do script.js do site para consistência)
============================================================ */

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0
  });
}

function formatarKm(km) {
  return Number(km).toLocaleString("pt-BR") + " km";
}


/* ============================================================
   5. SISTEMA DE AUTENTICAÇÃO
   Verifica CPF e senha. Usa sessionStorage para manter
   a sessão enquanto a aba do navegador estiver aberta.
============================================================ */

/**
 * Aplica máscara de CPF ao digitar.
 * Transforma "00000000000" → "000.000.000-00" em tempo real.
 * @param {string} valor - Valor bruto digitado.
 * @returns {string} - Valor formatado com máscara.
 */
function formatarCPF(valor) {
  // Remove tudo que não é dígito
  const digitos = valor.replace(/\D/g, "").substring(0, 11);

  if (digitos.length <= 3)  return digitos;
  if (digitos.length <= 6)  return digitos.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digitos.length <= 9)  return digitos.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

/**
 * Valida as credenciais e inicia a sessão.
 * Chamada ao clicar em "Entrar" ou pressionar Enter.
 */
function tentarLogin() {
  const cpf   = document.getElementById("inputCPF").value.trim();
  const senha = document.getElementById("inputSenha").value;

  if (cpf === CREDENCIAIS.cpf && senha === CREDENCIAIS.senha) {
    // Credenciais corretas: marca sessão e exibe o painel
    sessionStorage.setItem(SESSION_KEY, "true");
    exibirPainel();
  } else {
    // Credenciais incorretas: exibe mensagem de erro
    const erroEl = document.getElementById("erroLogin");
    erroEl.classList.add("visivel");

    // Limpa a mensagem de erro após 3 segundos
    setTimeout(() => erroEl.classList.remove("visivel"), 3000);
  }
}

/**
 * Oculta a tela de login e exibe o painel administrativo.
 * Inicializa todos os componentes do painel.
 */
function exibirPainel() {
  document.getElementById("telaLogin").style.display  = "none";
  document.getElementById("painelAdmin").style.display = "block";
  atualizarDashboard();
  renderizarTabela(lerVeiculos());
}

/**
 * Encerra a sessão e volta para a tela de login.
 */
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById("painelAdmin").style.display = "none";
  document.getElementById("telaLogin").style.display  = "flex";
  // Limpa os campos
  document.getElementById("inputCPF").value   = "";
  document.getElementById("inputSenha").value = "";
}


/* ============================================================
   6. NAVEGAÇÃO ENTRE ABAS
   Controla qual aba está visível sem usar âncoras ou reload.
============================================================ */

/**
 * Ativa uma aba específica do painel.
 * @param {string} nomeTab - "dashboard" ou "veiculos".
 */
function ativarAba(nomeTab) {
  // Oculta todos os painéis de aba
  document.querySelectorAll(".tab-pane-admin").forEach(el => el.classList.remove("ativo"));

  // Remove "ativo" de todos os links da sidebar
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(el => el.classList.remove("ativo"));

  // Exibe o painel correto
  document.getElementById("tab-" + nomeTab).classList.add("ativo");

  // Marca o link da sidebar como ativo
  const linkAtivo = document.querySelector(`.sidebar-link[data-tab="${nomeTab}"]`);
  if (linkAtivo) linkAtivo.classList.add("ativo");

  // Atualiza o título na topbar
  const titulos = { dashboard: "Dashboard", veiculos: "Gerenciar Veículos" };
  document.getElementById("topbarTitulo").textContent = titulos[nomeTab] || nomeTab;

  // Fecha a sidebar no mobile após navegar
  document.getElementById("sidebar").classList.remove("aberta");
}


/* ============================================================
   7. DASHBOARD — ESTATÍSTICAS
   Calcula métricas do estoque e as exibe na tela.
============================================================ */
function atualizarDashboard() {
  const lista = lerVeiculos();

  // Total de veículos
  document.getElementById("statTotal").textContent = lista.length;

  // Preço médio: soma todos os preços e divide pela quantidade
  if (lista.length > 0) {
    const somaPrecos = lista.reduce((acc, v) => acc + Number(v.preco), 0);
    const media = somaPrecos / lista.length;
    document.getElementById("statMedia").textContent = formatarMoeda(media);

    const somaKm = lista.reduce((acc, v) => acc + Number(v.quilometragem), 0);
    const mediaKm = somaKm / lista.length;
    document.getElementById("statKmMedio").textContent = formatarKm(Math.round(mediaKm));
  } else {
    document.getElementById("statMedia").textContent  = "—";
    document.getElementById("statKmMedio").textContent = "—";
  }

  // Últimos 5 cadastros: pega os últimos 5 itens do array (mais recentes ao final)
  const ultimos = [...lista].slice(-5).reverse();
  const container = document.getElementById("resumoUltimos");

  if (ultimos.length === 0) {
    container.innerHTML = `<p style="color:var(--color-text-muted); font-size:0.85rem; padding:1rem 0;">Nenhum veículo cadastrado ainda.</p>`;
    return;
  }

  container.innerHTML = ultimos.map(v => `
    <div style="
      display:flex; align-items:center; gap:1rem; padding:0.75rem 0;
      border-bottom:1px solid var(--color-border);
    ">
      <img src="${v.imagem}" alt="${v.modelo}" style="
        width:56px; height:40px; object-fit:cover; border-radius:6px;
        border:1px solid var(--color-border); flex-shrink:0;
      " onerror="this.src='https://placehold.co/56x40/1e2130/555e78?text=foto'" />
      <div style="flex:1; min-width:0;">
        <div style="font-family:var(--font-display); font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${v.marca} ${v.modelo}
        </div>
        <div style="font-size:0.78rem; color:var(--color-text-muted);">${v.ano} &bull; ${formatarKm(v.quilometragem)}</div>
      </div>
      <div style="font-family:var(--font-display); font-size:1.05rem; font-weight:800; color:var(--color-gold); white-space:nowrap;">
        ${formatarMoeda(v.preco)}
      </div>
    </div>
  `).join("");
}


/* ============================================================
   8. TABELA DE VEÍCULOS
   Renderiza todas as linhas da tabela a partir da lista.
   Suporta filtragem em tempo real pelo campo buscaTabela.
============================================================ */

/**
 * Renderiza as linhas da tabela com a lista fornecida.
 * @param {Array} lista - Array de veículos a exibir.
 */
function renderizarTabela(lista) {
  const tbody      = document.getElementById("tabelaCorpo");
  const semDados   = document.getElementById("tabelaVazia");

  if (lista.length === 0) {
    tbody.innerHTML = "";
    semDados.classList.remove("d-none");
    return;
  }

  semDados.classList.add("d-none");

  // Gera uma linha <tr> para cada veículo
  tbody.innerHTML = lista.map(v => `
    <tr>
      <!-- Miniatura da imagem -->
      <td>
        <img
          src="${v.imagem}"
          alt="${v.modelo}"
          class="table-thumb"
          onerror="this.src='https://placehold.co/56x40/1e2130/555e78?text=sem+foto'"
        />
      </td>

      <!-- Marca + Modelo -->
      <td>
        <span class="table-marca-badge">${v.marca}</span><br />
        <span class="table-modelo">${v.modelo}</span>
      </td>

      <td>${v.ano}</td>
      <td>${formatarKm(v.quilometragem)}</td>
      <td style="color:var(--color-gold); font-family:var(--font-display); font-weight:700;">${formatarMoeda(v.preco)}</td>

      <!-- Botões de ação: Editar e Excluir -->
      <td>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <!--
            onclick="editarVeiculo(${v.id})" — chama a função de edição
            passando o ID do veículo como argumento.
          -->
          <button class="btn-acao btn-editar" onclick="editarVeiculo(${v.id})">
            <i class="bi bi-pencil-fill"></i> Editar
          </button>
          <button class="btn-acao btn-excluir" onclick="confirmarExclusao(${v.id}, '${v.marca} ${v.modelo.replace(/'/g, "\\'")}')">
            <i class="bi bi-trash3-fill"></i> Excluir
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

/**
 * Filtra a tabela com base no texto digitado.
 * Reutiliza o mesmo padrão de normalização do site principal.
 */
function filtrarTabela() {
  const termo = document.getElementById("buscaTabela").value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  const lista = lerVeiculos().filter(v => {
    const campos = [v.marca, v.modelo, String(v.ano), String(v.preco)].join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    return campos.includes(termo);
  });

  renderizarTabela(lista);
}


/* ============================================================
   9. CRUD DE VEÍCULOS
   Create (adicionar), Read (tabela), Update (editar), Delete (excluir)
============================================================ */

/**
 * Valida e salva um veículo novo ou editado.
 * Lida com ambos os modos (novo / editar) verificando campoId.
 */
function salvarVeiculo() {
  // ---- Leitura e sanitização dos campos ----
  const id         = document.getElementById("campoId").value;
  const marca      = document.getElementById("campoMarca").value.trim();
  const modelo     = document.getElementById("campoModelo").value.trim();
  const ano        = parseInt(document.getElementById("campoAno").value, 10);
  const km         = parseInt(document.getElementById("campoKm").value, 10);
  const preco      = parseFloat(document.getElementById("campoPreco").value);
  const imagem     = document.getElementById("campoImagem").value.trim();
  const descricao  = document.getElementById("campoDescricao").value.trim();

  // ---- Validação de campos obrigatórios ----
  if (!marca || !modelo || !ano || isNaN(km) || isNaN(preco) || !imagem || !descricao) {
    mostrarToast("Preencha todos os campos obrigatórios (*) antes de salvar.", "aviso");
    return;
  }

  if (ano < 1990 || ano > 2030) {
    mostrarToast("Ano inválido. Informe entre 1990 e 2030.", "aviso");
    return;
  }

  if (preco <= 0 || km < 0) {
    mostrarToast("Preço e quilometragem devem ser valores positivos.", "aviso");
    return;
  }

  // ---- Monta o objeto veículo ----
  const veiculo = { marca, modelo, ano, quilometragem: km, preco, imagem, descricao };

  const lista = lerVeiculos();

  if (modoFormulario === "editar" && id) {
    // MODO EDITAR: encontra o índice do veículo e substitui
    const index = lista.findIndex(v => v.id === parseInt(id, 10));
    if (index !== -1) {
      veiculo.id = parseInt(id, 10); // mantém o ID original
      lista[index] = veiculo;
      salvarVeiculos(lista);
      mostrarToast(`${marca} ${modelo} atualizado com sucesso!`, "sucesso");
    }
  } else {
    // MODO NOVO: gera um novo ID e adiciona ao final do array
    veiculo.id = gerarNovoId(lista);
    lista.push(veiculo);
    salvarVeiculos(lista);
    mostrarToast(`${marca} ${modelo} adicionado ao estoque!`, "sucesso");
  }

  // Limpa o formulário e volta ao modo "novo"
  limparFormulario();

  // Atualiza a tabela e o dashboard
  renderizarTabela(lerVeiculos());
  atualizarDashboard();
}

/**
 * Preenche o formulário com os dados do veículo para edição.
 * Muda o modo do formulário para "editar".
 * @param {number} id - ID do veículo a editar.
 */
function editarVeiculo(id) {
  const lista   = lerVeiculos();
  const veiculo = lista.find(v => v.id === id);
  if (!veiculo) return;

  // Muda modo para edição
  modoFormulario = "editar";

  // Preenche os campos com os dados do veículo
  document.getElementById("campoId").value        = veiculo.id;
  document.getElementById("campoMarca").value     = veiculo.marca;
  document.getElementById("campoModelo").value    = veiculo.modelo;
  document.getElementById("campoAno").value       = veiculo.ano;
  document.getElementById("campoKm").value        = veiculo.quilometragem;
  document.getElementById("campoPreco").value     = veiculo.preco;
  document.getElementById("campoImagem").value    = veiculo.imagem;
  document.getElementById("campoDescricao").value = veiculo.descricao;

  // Atualiza o preview da imagem
  atualizarPreview(veiculo.imagem);

  // Atualiza o contador de caracteres da descrição
  document.getElementById("contadorDescricao").textContent = veiculo.descricao.length;

  // Atualiza os textos do formulário para indicar modo de edição
  document.getElementById("formTitulo").textContent   = "Editar Veículo";
  document.getElementById("formModoBadge").textContent = "EDIÇÃO";
  document.getElementById("formModoBadge").style.background = "rgba(126,179,245,0.1)";
  document.getElementById("formModoBadge").style.color = "#7eb3f5";
  document.getElementById("formModoBadge").style.borderColor = "rgba(126,179,245,0.3)";
  document.getElementById("btnSalvar").innerHTML = '<i class="bi bi-floppy-fill"></i> Atualizar Veículo';

  // Exibe o botão cancelar edição
  document.getElementById("btnCancelarEdicao").classList.add("visivel");

  // Navega para a aba de veículos e rola até o formulário
  ativarAba("veiculos");
  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Abre o modal de confirmação antes de excluir.
 * Só exclui de fato se o usuário confirmar.
 * @param {number} id - ID do veículo a excluir.
 * @param {string} nome - Nome do veículo para exibir na mensagem.
 */
function confirmarExclusao(id, nome) {
  idParaExcluir = id;
  document.getElementById("confirmMsg").textContent =
    `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`;
  document.getElementById("confirmOverlay").classList.add("visivel");
}

/**
 * Executa a exclusão após confirmação do usuário.
 */
function excluirVeiculo() {
  if (idParaExcluir === null) return;

  const lista    = lerVeiculos();
  const novaLista = lista.filter(v => v.id !== idParaExcluir);
  salvarVeiculos(novaLista);

  mostrarToast("Veículo removido do estoque.", "erro");
  fecharConfirmacao();
  renderizarTabela(lerVeiculos());
  atualizarDashboard();

  idParaExcluir = null;
}

/** Fecha o modal de confirmação sem excluir. */
function fecharConfirmacao() {
  document.getElementById("confirmOverlay").classList.remove("visivel");
  idParaExcluir = null;
}

/**
 * Limpa todos os campos do formulário e restaura modo "novo".
 */
function limparFormulario() {
  modoFormulario = "novo";

  document.getElementById("campoId").value        = "";
  document.getElementById("campoMarca").value     = "";
  document.getElementById("campoModelo").value    = "";
  document.getElementById("campoAno").value       = "";
  document.getElementById("campoKm").value        = "";
  document.getElementById("campoPreco").value     = "";
  document.getElementById("campoImagem").value    = "";
  document.getElementById("campoDescricao").value = "";
  document.getElementById("contadorDescricao").textContent = "0";

  // Restaura textos do formulário
  document.getElementById("formTitulo").textContent    = "Adicionar Novo Veículo";
  document.getElementById("formModoBadge").textContent  = "NOVO";
  document.getElementById("formModoBadge").style.background  = "";
  document.getElementById("formModoBadge").style.color       = "";
  document.getElementById("formModoBadge").style.borderColor = "";
  document.getElementById("btnSalvar").innerHTML = '<i class="bi bi-floppy-fill"></i> Salvar Veículo';

  // Oculta botão cancelar
  document.getElementById("btnCancelarEdicao").classList.remove("visivel");

  // Limpa preview
  atualizarPreview("");
}


/* ============================================================
   10. PREVIEW DE IMAGEM
   Tenta carregar a URL digitada como uma imagem.
   Se carregar com sucesso, exibe; se falhar, esconde.
============================================================ */

/**
 * Atualiza a pré-visualização da imagem.
 * @param {string} url - URL da imagem.
 */
function atualizarPreview(url) {
  const img         = document.getElementById("previewImagem");
  const placeholder = document.getElementById("previewPlaceholder");
  const wrapper     = document.getElementById("previewWrapper");

  if (!url) {
    img.classList.remove("visivel");
    img.src = "";
    placeholder.style.display = "flex";
    wrapper.classList.remove("tem-imagem");
    return;
  }

  // Cria uma imagem temporária para testar o carregamento
  const tempImg = new Image();
  tempImg.onload = function () {
    img.src = url;
    img.classList.add("visivel");
    placeholder.style.display = "none";
    wrapper.classList.add("tem-imagem");
  };
  tempImg.onerror = function () {
    img.classList.remove("visivel");
    placeholder.style.display = "flex";
    wrapper.classList.remove("tem-imagem");
  };
  tempImg.src = url;
}


/* ============================================================
   11. SISTEMA DE NOTIFICAÇÕES (TOASTS)
   Exibe mensagens de feedback flutuantes no canto inferior direito.
   Cada toast desaparece automaticamente após 3.5 segundos.
============================================================ */

/**
 * Exibe uma notificação toast.
 * @param {string} mensagem - Texto a exibir.
 * @param {string} tipo     - "sucesso" | "erro" | "aviso"
 */
function mostrarToast(mensagem, tipo = "sucesso") {
  const icones = { sucesso: "bi-check-circle-fill", erro: "bi-x-circle-fill", aviso: "bi-exclamation-triangle-fill" };

  const toast = document.createElement("div");
  toast.className = `toast-custom ${tipo}`;
  toast.innerHTML = `
    <i class="bi ${icones[tipo]} toast-icon"></i>
    <span>${mensagem}</span>
  `;

  document.getElementById("toastContainer").appendChild(toast);

  // Remove o toast após 3.5 segundos com transição de saída
  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease";
    toast.style.opacity    = "0";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}


/* ============================================================
   12. INICIALIZAÇÃO — DOMContentLoaded
   Registra todos os event listeners após o DOM estar pronto.
   Verifica se há sessão ativa para não exigir login novamente.
============================================================ */
document.addEventListener("DOMContentLoaded", function () {

  /* ---- 12a. Verificar sessão ativa ---- */
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    // Sessão válida: vai direto para o painel
    exibirPainel();
  }

  /* ---- 12b. Máscara do CPF ao digitar ---- */
  document.getElementById("inputCPF").addEventListener("input", function () {
    this.value = formatarCPF(this.value);
  });

  /* ---- 12c. Login ao clicar no botão ---- */
  document.getElementById("btnEntrar").addEventListener("click", tentarLogin);

  /* ---- 12d. Login ao pressionar Enter nos campos ---- */
  ["inputCPF", "inputSenha"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", function (e) {
      if (e.key === "Enter") tentarLogin();
    });
  });

  /* ---- 12e. Mostrar/ocultar senha ---- */
  document.getElementById("toggleSenha").addEventListener("click", function () {
    const input  = document.getElementById("inputSenha");
    const icone  = document.getElementById("iconeSenha");
    const visivel = input.type === "password";
    input.type   = visivel ? "text" : "password";
    icone.className = visivel ? "bi bi-eye-slash" : "bi bi-eye";
  });

  /* ---- 12f. Navegação entre abas da sidebar ---- */
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(btn => {
    btn.addEventListener("click", function () {
      ativarAba(this.dataset.tab);
    });
  });

  /* ---- 12g. Botão hambúrguer mobile ---- */
  document.getElementById("btnMenuMobile").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("aberta");
  });

  /* ---- 12h. Logout ---- */
  document.getElementById("btnLogout").addEventListener("click", logout);

  /* ---- 12i. Salvar veículo ---- */
  document.getElementById("btnSalvar").addEventListener("click", salvarVeiculo);

  /* ---- 12j. Cancelar edição ---- */
  document.getElementById("btnCancelarEdicao").addEventListener("click", limparFormulario);

  /* ---- 12k. Preview de imagem em tempo real ---- */
  let timerPreview; // Debounce: só atualiza 600ms após parar de digitar
  document.getElementById("campoImagem").addEventListener("input", function () {
    clearTimeout(timerPreview);
    timerPreview = setTimeout(() => atualizarPreview(this.value.trim()), 600);
  });

  /* ---- 12l. Contador de caracteres da descrição ---- */
  document.getElementById("campoDescricao").addEventListener("input", function () {
    document.getElementById("contadorDescricao").textContent = this.value.length;
  });

  /* ---- 12m. Filtro da tabela ---- */
  document.getElementById("buscaTabela").addEventListener("input", filtrarTabela);

  /* ---- 12n. Modal de confirmação de exclusão ---- */
  document.getElementById("btnConfirmExcluir").addEventListener("click", excluirVeiculo);
  document.getElementById("btnConfirmCancelar").addEventListener("click", fecharConfirmacao);

  // Fecha o modal ao clicar no overlay (fora do card)
  document.getElementById("confirmOverlay").addEventListener("click", function (e) {
    if (e.target === this) fecharConfirmacao();
  });

  /* ---- 12o. Fechar sidebar mobile ao clicar fora dela ---- */
  document.addEventListener("click", function (e) {
    const sidebar = document.getElementById("sidebar");
    const btnMenu = document.getElementById("btnMenuMobile");
    if (
      sidebar.classList.contains("aberta") &&
      !sidebar.contains(e.target) &&
      e.target !== btnMenu
    ) {
      sidebar.classList.remove("aberta");
    }
  });

  console.log("✅ Admin AutoPrime inicializado.");
});

/*
  ============================================================
  INTEGRAÇÃO COM O SITE PRINCIPAL (index.html + script.js)
  
  Os dados são compartilhados via localStorage com a chave
  "autoprime_veiculos". Para fazer o index.html ler os dados
  do admin em vez do array fixo, o script.js do site deve
  ser atualizado para usar:

    function lerVeiculosDoStorage() {
      const dados = localStorage.getItem("autoprime_veiculos");
      return dados ? JSON.parse(dados) : veiculos; // fallback para o array fixo
    }

  E substituir todas as referências ao array "veiculos" por
  "lerVeiculosDoStorage()".
  ============================================================
*/