// Começar a trilha
function startTrilha() {
    verificarMobile()

    if (!localStorage.getItem("Session")) {
        localStorage.setItem('Session', true)
        location.reload(true)

    } else {
        const pagInicial = document.getElementById("pagInicial");
        const pagPrincipal = document.getElementById("pagPrincipal");

        pagInicial.style.display = "none";
        pagPrincipal.style.display = "flex";
    }
}

function backPagInicial() {
    const pagInicial = document.getElementById("pagInicial");
    const pagPrincipal = document.getElementById("pagPrincipal");

    pagInicial.style.display = "block";
    pagPrincipal.style.display = "none";
}

function verificarMobile() {
    if (window.matchMedia("(max-width: 768px)").matches) {
        toggleMenuList(1);
    }
}


// Menu List
function toggleMenuList(i = 0) {
    const paginaPrincipal = document.getElementById("pagPrincipal");
    const menuLateral = paginaPrincipal.querySelector(".menuLateral");
    const mainPrincipal = document.querySelector(".mainPrincipal");
    const capituloSections = mainPrincipal.querySelectorAll(".secCapitulo");
    const btnList = document.querySelector("button.btnList");

    const menuAberto = getComputedStyle(menuLateral).left === "0px";


    if (i == 1) {
        menuLateral.style.left = "-100%";
        menuLateral.style.minWidth = "0px"; // Oculta o menu suavemente
        mainPrincipal.style.left = "0";
        btnList.style.left = "8px";

        capituloSections.forEach(section => {
            section.style.width = "100vw";
        });

        return
    }

    if (menuAberto) {
        menuLateral.style.left = "-100%";
        menuLateral.style.minWidth = "0px"; // Oculta o menu suavemente
        mainPrincipal.style.left = "0";
        btnList.style.left = "8px";

        capituloSections.forEach(section => {
            section.style.width = "100vw";
        });
    } else {
        menuLateral.style.left = "0";
        menuLateral.style.minWidth = "300px"; // Garante que o menu tenha largura ao abrir
        mainPrincipal.style.left = "300px";
        btnList.style.left = "308px";

        capituloSections.forEach(section => {
            section.style.width = "calc(100vw - 300px)";
        });
    }




    ajusteImagem();
}



// Ajuste de imagens no menu List
function ajusteImagem() {
    const tabelas = document.querySelectorAll("table.Basic-Table");

    const paginaPrincipal = document.getElementById("pagPrincipal");
    const menuLateral = paginaPrincipal.querySelector(".menuLateral");

    const largura = menuLateral.style.minWidth === "300px" ? "calc(100vw - 25% - 10%)" : "100vw";

    tabelas.forEach(tabela => {
        if (tabela.querySelector("img.responsive-img")) {
            tabela.style.width = largura;
        }
    });
}



// Barra de progresso geral
function calcularProgressoGeral() {
    // Selecionar todas as .barra-progresso
    const barrasProgresso = document.querySelectorAll('.menuLateral .listProgresso .barra-progresso');

    // Inicializar soma e contar quantidade
    let somaProgresso = 0;
    let quantidade = 0;

    // Iterar pelas barras de progresso
    barrasProgresso.forEach(barra => {
        // Obter o valor de --progresso-valor
        const progressoValor = parseFloat(getComputedStyle(barra).getPropertyValue('--progresso-valor'));

        // Somar o valor e incrementar a quantidade
        if (!isNaN(progressoValor)) {
            somaProgresso += progressoValor;
            quantidade++;
        }
    });

    // Calcular a porcentagem geral
    const porcentagemGeral = quantidade > 0 ? Math.round(somaProgresso / quantidade) : 0;
    const COMPLETO = localStorage.getItem('Completo');
    // Atualizar o valor no span dentro de .barraProgressoTrilha
    const barraProgressoTrilha = document.querySelector('.barraProgressoTrilha');
    if (barraProgressoTrilha) {
        const spanProgresso = barraProgressoTrilha.querySelector('span');
        if (spanProgresso) {
            spanProgresso.textContent = `${porcentagemGeral}%  ${COMPLETO}`;
        }

        // Atualizar o valor em --progresso-trilha
        barraProgressoTrilha.style.setProperty('--progresso-trilha', porcentagemGeral);
    }
}

// Chamar a função para atualizar o progresso geral ao carregar a página
calcularProgressoGeral();


function verificarProgresso() {
    // Selecionar todas as divs .listProgresso
    const listasProgresso = document.querySelectorAll('.listProgresso');

    listasProgresso.forEach(lista => {
        // Obter a barra de progresso dentro da lista
        const barraProgresso = lista.querySelector('.barra-progresso');
        const iconeCheck = lista.querySelector('i.ph-fill.ph-check-circle');
        const divPorcentagem = lista.querySelector('.porcentagem');

        if (barraProgresso) {
            // Obter o valor diretamente do atributo style
            let progressoValor = barraProgresso.getAttribute("style");
            let match = progressoValor.match(/--progresso-valor:\s*(\d+)/); // Extrai o número do CSS inline

            progressoValor = match ? parseFloat(match[1]) : 0; // Se encontrou, usa o valor, senão 0

            if (!isNaN(progressoValor)) {
                if (progressoValor >= 100) { // Quando atingir 100%
                    if (iconeCheck) {
                        iconeCheck.style.display = 'flex'; // Mostrar o ícone
                    }
                    if (barraProgresso) {
                        barraProgresso.style.display = 'none'; // Esconder a barra de progresso
                    }
                } else {
                    if (iconeCheck) {
                        iconeCheck.style.display = 'none'; // Esconder o ícone
                    }
                    if (barraProgresso) {
                        barraProgresso.style.display = 'flex'; // Mostrar a barra de progresso
                    }
                }
            }
        }
    });
    calcularProgressoGeral();
}

// Chamar a função para verificar o progresso ao carregar a página
document.addEventListener("DOMContentLoaded", verificarProgresso);


// Chamar a função para verificar o progresso ao carregar a página
verificarProgresso();

// document.onreadystatechange = function () {
//     if (document.readyState === "complete") {
//         const btn = document.getElementById("btnTopo");
//         const mainConteudo = document.querySelector(".secCapitulo");

//         if (window.innerWidth < 900) {
//             if (mainConteudo) {
//                 mainConteudo.onscroll = function () {
//                     const scrollPercent = (mainConteudo.scrollTop / (mainConteudo.scrollHeight - mainConteudo.clientHeight)) * 100;

//                     if (scrollPercent >= 90) {
//                         btn.style.display = "block";
//                     } else {
//                         btn.style.display = "none";
//                     }
//                 };
//             }
//         } else {
//             btn.style.display = "none";
//         }
//     }
// };

document.addEventListener("DOMContentLoaded", function () {
    var btnTranslate = document.querySelector(".btnTranslate");
    var blcTranslateContent = document.querySelector(".blcTranslateContent");

    function openLanguage() {
        if (btnTranslate.style.right === "-120%") {
            btnTranslate.style.right = "0";
            blcTranslateContent.style.right = "-120%";
        } else {
            btnTranslate.style.right = "-120%";
            blcTranslateContent.style.right = "0%";
        }
    }

    window.openLanguage = openLanguage;

    document.addEventListener("click", function (event) {
        var isClickInside = btnTranslate.contains(event.target) || blcTranslateContent.contains(event.target);



        if (!isClickInside && blcTranslateContent.style.right === "0%") {
            btnTranslate.style.right = "0";
            blcTranslateContent.style.right = "-120%";
        }
    });
});

function toggleLanguage(button, lang) {
    var imgLanguage = document.querySelector(".btnTranslate .imgLanguage");
    var selectedImg = button.querySelector(".imgLanguage");


    if (imgLanguage && selectedImg) {
        imgLanguage.src = selectedImg.src;
        imgLanguage.alt = selectedImg.alt;
    }

    // Remover a classe 'active' de todos os botões
    document.querySelectorAll(".btnLanguage").forEach(btn => {
        btn.classList.remove("active");
    });

    // Adicionar ou atualizar o parâmetro 'lang' na URL
    var url = new URL(window.location.href);
    url.searchParams.set("lang", lang.toLowerCase()); // Define ou substitui o valor de 'lang'

    // Recarregar a página com a nova URL
    window.location.href = url.toString();


    // Adicionar a classe 'active' ao botão clicado
    button.classList.add("active");
    openLanguage()
}

//Função para reconhecer o idioma na URL e tornar ativo
function setActiveLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langMatch = window.location.href.match(/[&?]lang=([^&.&#]*)/);
    const lang = localStorage.getItem('lang') || 'pt-br';
  
    console.warn(lang); // Verifica o valor de lang
    
    const btnTranslateImg = document.querySelector('.blcTranslate .btnTranslate .imgLanguage');

    if(lang === "pt-br") {
        btnTranslateImg.src = "assets/img/lang_BR.svg"; // Corrigido para string literal
    }
    if(lang === "en") {
        btnTranslateImg.src = "assets/img/lang_US.svg"; // Corrigido para string literal
    }
    if(lang === "es") {
        btnTranslateImg.src = "assets/img/lang_ES.svg"; // Corrigido para string literal
    }
    if(lang === "fr") {
        btnTranslateImg.src = "assets/img/lang_FR.svg"; // Corrigido para string literal
    }
}
    
// Garante que a função seja chamada após 10ms do carregamento completo da página
// setTimeout(setActiveLanguage, 10);


// Função para voltar ao topo suavemente dentro da div específica
function voltarAoTopo() {

    var divAtual = localStorage.getItem('LocalizacaoAtual');
    var scroll = 0
    scrollToDiv(divAtual, scroll)

}



function Margem() {
    document.querySelectorAll("p.legendas").forEach(p => {
        if (p.textContent.trim().startsWith("Fonte:")) {
            p.style.marginBottom = "36px";
        }
    });

    document.querySelectorAll("p.legendas").forEach(p => {
        if (p.textContent.trim().startsWith("Figura")) {
            p.style.marginTop = "36px";
        }
        if (p.textContent.trim().startsWith("Quadro")) {
            p.style.marginTop = "36px";
        }
    });
}

const observer = new MutationObserver(Margem);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", Margem);
Margem();

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function togglePlay(button) {
    const player = button.closest('.audio-player');
    const audio = player.querySelector('audio');
    const progress = player.querySelector('.progress');
    const timeDisplay = player.querySelector('.time-display');

    if (audio.paused) {
        audio.play();
        button.innerHTML = '<i class="ph-fill ph-pause"></i>'; // Altera o conteúdo do botão para o ícone de pause
    } else {
        audio.pause();
        button.innerHTML = '<i class="ph-fill ph-play"></i>'; // Altera o conteúdo do botão para o ícone de play
    }

    // Atualiza a barra de progresso e o contador regressivo em tempo real
    audio.addEventListener('timeupdate', () => {
        // Atualiza o valor da barra de progresso (range) com base no tempo atual do áudio
        progress.value = (audio.currentTime / audio.duration) * 100;
        // Atualiza o tempo restante no display
        timeDisplay.textContent = formatTime(audio.duration - audio.currentTime);
    });

    // Atualiza o tempo do áudio e sincroniza o contador quando o usuário move o range
    progress.addEventListener('input', () => {
        // Atualiza o tempo atual do áudio com base na posição do range
        audio.currentTime = (progress.value / 100) * audio.duration;
        // Atualiza o tempo restante no display
        timeDisplay.textContent = formatTime(audio.duration - audio.currentTime);
    });

    // Define o valor máximo da barra de progresso após carregar os metadados
    audio.addEventListener('loadedmetadata', () => {
        progress.max = 100;  // A barra de progresso agora vai de 0 a 100
        // Exibe a duração total do áudio no display
        timeDisplay.textContent = formatTime(audio.duration);
    });
}

function removerListaTabela(){
  document.querySelectorAll('td.Tabela.Corpo_box').forEach(td => {
    const span = td.querySelector('span');
    if (span && span.textContent.trim() === '•') {
      td.classList.add('sem-borda');
    }
  });
}

removerListaTabela()