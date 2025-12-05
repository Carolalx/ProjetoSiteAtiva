// scripts.js — versão corrigida e mais segura

// segurança: esperar DOM carregado (útil se não usar <script defer>)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

function init() {
  const prevButton = document.getElementById('prev')
  const nextButton = document.getElementById('next')
  const items = document.querySelectorAll('.item')
  const dots = document.querySelectorAll('.dot')
  const numberIndicator = document.querySelector('.numbers')

  // validações básicas — evita erros se algum seletor não existir
  if (!items || items.length === 0) {
    console.error('Nenhum .item encontrado. Verifique o HTML.')
    return
  }
  if (!dots || dots.length !== items.length) {
    console.warn('Quantidade de .dot difere de .item — verifique se tem o mesmo número de indicadores.')
  }
  if (!numberIndicator) {
    console.warn('.numbers não encontrado — indicador numérico não será atualizado.')
  }

  let active = 0
  const total = items.length
  let timer = null

  function update(direction = 0) {
    const currentItem = document.querySelector('.item.active')
    const currentDot = document.querySelector('.dot.active')

    if (currentItem) currentItem.classList.remove('active')
    if (currentDot) currentDot.classList.remove('active')

    if (direction > 0) {
      active = active + 1
      if (active === total) active = 0
    } else if (direction < 0) {
      active = active - 1
      if (active < 0) active = total - 1
    }

    items[active].classList.add('active')
    if (dots[active]) dots[active].classList.add('active')

    if (numberIndicator) {
      numberIndicator.textContent = String(active + 1).padStart(2, '0')
    }
  }

  // limpar timer anterior (nota: clearInterval em minúsculas)
  if (timer) clearInterval(timer)
  timer = setInterval(() => update(1), 5000)

  // resetar timer quando usuário clicar (opcional — melhora UX)
  function restartTimer() {
    if (timer) clearInterval(timer)
    timer = setInterval(() => update(1), 5000)
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      update(-1)
      restartTimer()
    })
  } else {
    console.warn('#prev não encontrado no DOM.')
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      update(1)
      restartTimer()
    })
  } else {
    console.warn('#next não encontrado no DOM.')
  }
}

function mostrar(secao) {
    // Esconde todos os conteúdos
    document.querySelectorAll('.secao').forEach(div => {
        div.style.display = 'none';
    });

    // Mostra apenas o conteúdo clicado
    document.getElementById(secao).style.display = 'block';
}

const dropdown = document.querySelector('.dropdown > a');
const menu = document.querySelector('.dropdown-menu');

dropdown.addEventListener('click', function(e){
    e.preventDefault(); // impede de ir para "#"
    menu.classList.toggle('show');
});

// Fechar se clicar fora
document.addEventListener('click', function(e){
    if (!dropdown.contains(e.target)) {
        menu.classList.remove('show');
    }
});


