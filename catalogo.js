let adminLogado = false;

/* =====================================================
   CONFIGURAÇÃO
====================================================== */
const SENHA_ADMIN = "Ativ@2#26";
const VERSAO_PRODUTOS = "1.2"; // 🔴 ALTERE quando mudar o produtos.json

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
   CONVERTER IMAGEM PARA BASE64
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
   ADICIONAR PRODUTO NA TELA
====================================================== */
function adicionarProdutoNaTela(produto) {
    let grupo = document.querySelector(
        `.categoria-grupo[data-categoria="${produto.categoria}"]`
    );

    if (!grupo) {
        grupo = document.createElement("div");
        grupo.className = "categoria-grupo";
        grupo.dataset.categoria = produto.categoria;

        const tituloCategoria = document.createElement("h2");
        tituloCategoria.textContent = produto.categoria;
        grupo.appendChild(tituloCategoria);

        const containerProdutos = document.createElement("div");
        containerProdutos.className = "produtos-categoria";
        grupo.appendChild(containerProdutos);

        const totalGrupos = document.querySelectorAll(".categoria-grupo").length;
        grupo.classList.add(totalGrupos % 2 === 0 ? "fundo-azul" : "fundo-branco");

        produtosContainer.appendChild(grupo);
    }

    const containerProdutos = grupo.querySelector(".produtos-categoria");

    const produtoDiv = document.createElement("div");
    produtoDiv.className = "produto";
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
        btnDel.className = "btn-del";
        btnDel.onclick = () => deletarProduto(produto.id);
        produtoDiv.appendChild(btnDel);
    }

    containerProdutos.appendChild(produtoDiv);
}

/* =====================================================
   SALVAR PRODUTO NO LOCALSTORAGE
====================================================== */
function salvarProduto(titulo, imagemUrl, categoria) {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];

    const novo = {
        id: Date.now() + Math.random(), // evita colisão
        titulo,
        imagemUrl,
        categoria
    };

    lista.push(novo);
    localStorage.setItem("produtos", JSON.stringify(lista));

    return novo.id;
}

/* =====================================================
   CARREGAR PRODUTOS
====================================================== */
function carregarProdutos() {
    const versaoSalva = localStorage.getItem("versaoProdutos");
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];

    // 🔄 Se o JSON mudou, recarrega tudo
    if (versaoSalva !== VERSAO_PRODUTOS) {
        localStorage.removeItem("produtos");
        localStorage.setItem("versaoProdutos", VERSAO_PRODUTOS);
        produtosContainer.innerHTML = "";
        carregarProdutosDeJSON();
        return;
    }

    lista.forEach(p => adicionarProdutoNaTela(p));
}

/* =====================================================
   CARREGAR PRODUTOS DO JSON
====================================================== */
function carregarProdutosDeJSON() {
    fetch("produtos.json")
        .then(res => res.json())
        .then(lista => {
            lista.forEach(produto => {
                const id = salvarProduto(
                    produto.titulo,
                    produto.imagemUrl,
                    produto.categoria
                );
                adicionarProdutoNaTela({ ...produto, id });
            });
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));
}

/* =====================================================
   INICIALIZA
====================================================== */
carregarProdutos();

/* =====================================================
   FORM - ADICIONAR PRODUTO
====================================================== */
form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!imagemInput.files[0]) {
        alert("Selecione uma imagem!");
        return;
    }

    const imagemUrl = await imageToBase64(imagemInput.files[0]);

    const id = salvarProduto(
        tituloInput.value,
        imagemUrl,
        categoriaInput.value
    );

    adicionarProdutoNaTela({
        id,
        titulo: tituloInput.value,
        categoria: categoriaInput.value,
        imagemUrl
    });

    form.reset();
    alert("Produto adicionado!");
});

/* =====================================================
   DELETAR PRODUTO
====================================================== */
function deletarProduto(id) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    let lista = JSON.parse(localStorage.getItem("produtos")) || [];
    lista = lista.filter(p => p.id !== id);
    localStorage.setItem("produtos", JSON.stringify(lista));

    document.querySelector(`.produto[data-id="${id}"]`)?.remove();
}

/* =====================================================
   LOGIN ADMIN
====================================================== */
adminBtn.onclick = () => (adminLogin.style.display = "block");

loginBtn.onclick = () => {
    if (adminPass.value !== SENHA_ADMIN) {
        alert("Senha incorreta!");
        return;
    }

    adminLogado = true;
    adminLogin.style.display = "none";
    areaAdicionar.style.display = "block";

    produtosContainer.innerHTML = "";
    carregarProdutos();
};

/* =====================================================
   PESQUISA
====================================================== */
inputPesquisa.addEventListener("keyup", () => {
    const termo = inputPesquisa.value.toLowerCase();

    document.querySelectorAll(".categoria-grupo").forEach(grupo => {
        let visivel = false;

        grupo.querySelectorAll(".produto").forEach(produto => {
            const nome = produto.querySelector("h3").textContent.toLowerCase();
            const show = nome.includes(termo);
            produto.style.display = show ? "block" : "none";
            if (show) visivel = true;
        });

        grupo.style.display = visivel ? "block" : "none";
    });
});

/* =====================================================
   FILTRO POR CATEGORIA
====================================================== */
filtroCategoria.addEventListener("change", () => {
    const cat = filtroCategoria.value;

    document.querySelectorAll(".categoria-grupo").forEach(grupo => {
        grupo.style.display =
            cat === "todas" || grupo.dataset.categoria === cat
                ? "block"
                : "none";
    });
});
