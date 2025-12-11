let adminLogado = false; // indica se o admin está logado

/* =====================================================
   CONFIGURAÇÃO
====================================================== */
const SENHA_ADMIN = "Ativ@2#26";

/* =====================================================
   ELEMENTOS
====================================================== */
const produtosContainer = document.getElementById("produtos-container");

const form = document.getElementById("form-produto");
const tituloInput = document.getElementById("titulo");
const categoriaInput = document.getElementById("categoria");
const imagemInput = document.getElementById("imagem");

const adminBtn = document.getElementById("adminBtn");
const adminLogin = document.getElementById("adminLogin");
const adminPass = document.getElementById("adminPass");
const loginBtn = document.getElementById("loginBtn");

const areaAdicionar = document.getElementById("adicionar-produto");

const inputPesquisa = document.getElementById("pesquisa");
const filtroCategoria = document.getElementById("filtroCategoria");

/* =====================================================
   FUNÇÃO: CONVERTER IMAGEM PARA BASE64
====================================================== */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/* =====================================================
   FUNÇÃO: ADICIONAR PRODUTO NA TELA
====================================================== */
function adicionarProdutoNaTela(produto) {
    // Verifica se já existe grupo para essa categoria
    let grupo = document.querySelector(`.categoria-grupo[data-categoria="${produto.categoria}"]`);

    if (!grupo) {
        // Criar grupo de categoria
        grupo = document.createElement("div");
        grupo.classList.add("categoria-grupo");
        grupo.dataset.categoria = produto.categoria;

        const tituloCategoria = document.createElement("h2");
        tituloCategoria.textContent = produto.categoria;
        grupo.appendChild(tituloCategoria);

        const containerProdutos = document.createElement("div");
        containerProdutos.classList.add("produtos-categoria");
        grupo.appendChild(containerProdutos);

        // Alternar cor de fundo da categoria
        const totalGrupos = document.querySelectorAll(".categoria-grupo").length;
        grupo.classList.add(totalGrupos % 2 === 0 ? "fundo-azul" : "fundo-branco");

        produtosContainer.appendChild(grupo);
    }

    const containerProdutos = grupo.querySelector(".produtos-categoria");

    // Criar card do produto
    const produtoDiv = document.createElement("div");
    produtoDiv.classList.add("produto");
    produtoDiv.dataset.id = produto.id;

    const img = document.createElement("img");
    img.src = produto.imagemUrl;
    img.alt = produto.titulo;

    const nome = document.createElement("h3");
    nome.textContent = produto.titulo;

    produtoDiv.appendChild(img);
    produtoDiv.appendChild(nome);

    // Botão excluir apenas se admin logado
    if (adminLogado) {
        const btnDel = document.createElement("button");
        btnDel.textContent = "Excluir";
        btnDel.classList.add("btn-del");
        btnDel.addEventListener("click", () => deletarProduto(produto.id));
        produtoDiv.appendChild(btnDel);
    }

    containerProdutos.appendChild(produtoDiv);
}

/* =====================================================
   FUNÇÃO: SALVAR PRODUTO NO LOCALSTORAGE
====================================================== */
function salvarProduto(titulo, imagemUrl, categoria) {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];

    const novo = {
        id: Date.now(),
        titulo,
        imagemUrl,
        categoria
    };

    lista.push(novo);
    localStorage.setItem("produtos", JSON.stringify(lista));

    return novo.id;
}

/* =====================================================
   CARREGAR PRODUTOS AO ABRIR
====================================================== */
function carregarProdutos() {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];
    lista.forEach(p => adicionarProdutoNaTela(p));
}

carregarProdutos();

/* =====================================================
   FORM - ADICIONAR PRODUTO
====================================================== */
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titulo = tituloInput.value;
    const categoria = categoriaInput.value;

    if (!imagemInput.files[0]) {
        alert("Selecione uma imagem!");
        return;
    }

    // Converter imagem para Base64
    const imagemUrl = await imageToBase64(imagemInput.files[0]);

    const id = salvarProduto(titulo, imagemUrl, categoria);
    adicionarProdutoNaTela({ id, titulo, categoria, imagemUrl });

    alert("Produto adicionado!");
    form.reset();
});

/* =====================================================
   DELETAR PRODUTO
====================================================== */
function deletarProduto(id) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    let lista = JSON.parse(localStorage.getItem("produtos")) || [];
    lista = lista.filter(p => p.id !== id);
    localStorage.setItem("produtos", JSON.stringify(lista));

    // Remover do DOM
    const produtoDiv = document.querySelector(`.produto[data-id="${id}"]`);
    if (produtoDiv) produtoDiv.remove();

    alert("Produto deletado!");
}

/* =====================================================
   LOGIN DO ADMIN
====================================================== */
adminBtn.addEventListener("click", () => {
    adminLogin.style.display = "block";
});

loginBtn.addEventListener("click", () => {
    if (adminPass.value === SENHA_ADMIN) {
        alert("Acesso liberado!");
        adminLogin.style.display = "none";
        areaAdicionar.style.display = "block";
        adminLogado = true;

        // Re-renderizar produtos para mostrar botões de deletar
        produtosContainer.innerHTML = "";
        carregarProdutos();
    } else {
        alert("Senha incorreta!");
    }
});

/* =====================================================
   PESQUISA POR NOME
====================================================== */
inputPesquisa.addEventListener("keyup", function () {
    const termo = inputPesquisa.value.toLowerCase();
    const grupos = document.querySelectorAll(".categoria-grupo");

    grupos.forEach(grupo => {
        const produtos = grupo.querySelectorAll(".produto");
        let temProdutoVisivel = false;

        produtos.forEach(produto => {
            const nome = produto.querySelector("h3").textContent.toLowerCase();
            if (nome.includes(termo)) {
                produto.style.display = "block";
                temProdutoVisivel = true;
            } else {
                produto.style.display = "none";
            }
        });

        grupo.style.display = temProdutoVisivel ? "block" : "none";
    });
});

/* =====================================================
   FILTRO POR CATEGORIA
====================================================== */
filtroCategoria.addEventListener("change", function () {
    const categoriaSel = filtroCategoria.value;
    const grupos = document.querySelectorAll(".categoria-grupo");

    grupos.forEach(grupo => {
        if (categoriaSel === "todas" || grupo.dataset.categoria === categoriaSel) {
            grupo.style.display = "block";
        } else {
            grupo.style.display = "none";
        }
    });
});
