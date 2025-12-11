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
    let grupo = document.querySelector(`.categoria-grupo[data-categoria="${produto.categoria}"]`);

    if (!grupo) {
        grupo = document.createElement("div");
        grupo.classList.add("categoria-grupo");
        grupo.dataset.categoria = produto.categoria;

        const tituloCategoria = document.createElement("h2");
        tituloCategoria.textContent = produto.categoria;
        grupo.appendChild(tituloCategoria);

        const containerProdutos = document.createElement("div");
        containerProdutos.classList.add("produtos-categoria");
        grupo.appendChild(containerProdutos);

        const totalGrupos = document.querySelectorAll(".categoria-grupo").length;
        grupo.classList.add(totalGrupos % 2 === 0 ? "fundo-azul" : "fundo-branco");

        produtosContainer.appendChild(grupo);
    }

    const containerProdutos = grupo.querySelector(".produtos-categoria");

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
   CARREGAR PRODUTOS DO LOCALSTORAGE
====================================================== */
function carregarProdutos() {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];
    lista.forEach(p => adicionarProdutoNaTela(p));

    // Se não tiver produtos no localStorage, carregar do JSON
    if (lista.length === 0) {
        carregarProdutosDeJSON();
    }
}

/* =====================================================
   CARREGAR PRODUTOS DE UM JSON
====================================================== */
function carregarProdutosDeJSON() {
    fetch("produtos.json")
        .then(res => res.json())
        .then(lista => {
            lista.forEach(produto => {
                salvarProduto(produto.titulo, produto.imagemUrl, produto.categoria);
                adicionarProdutoNaTela(produto);
            });
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));
}

// Inicializa produtos
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
