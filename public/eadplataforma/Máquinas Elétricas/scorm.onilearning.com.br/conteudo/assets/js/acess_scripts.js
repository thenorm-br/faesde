function loadVariaveisAcess(){
    acessExpand = document.querySelector(".acess-expand");

    console.log("Informações carregadas com sucesso!")
    return;
}

function openCloseAcessBar(event) {
    loadVariaveisAcess();

    const btnAcess = event.querySelector(".btn-acess");
    const acessExpand = document.querySelector(".acess-expand");

    // Verifica se o menu está visível
    const isOpen = acessExpand.style.display === "flex";

    if (isOpen) {
        // Se estiver aberto, fecha
        acessExpand.style.height = "0";
        acessExpand.style.display = "none";
        document.removeEventListener("click", clickOutsideAcessBar);
    } else {
        // Se estiver fechado, abre
        acessExpand.style.height = "100%";
        acessExpand.style.display = "flex";
        setTimeout(() => {
            document.addEventListener("click", clickOutsideAcessBar);
        });
    }
}

function clickOutsideAcessBar(event) {
    const btnAcess = document.querySelector(".btn-acess");
    const acessExpand = document.querySelector(".acess-expand");

    // Verifica se o clique foi fora do menu de acessibilidade
    if (!btnAcess.contains(event.target) && !acessExpand.contains(event.target)) {
        acessExpand.style.height = "0";
        acessExpand.style.display = "none";
        document.removeEventListener("click", clickOutsideAcessBar);
    }
}


//Funções de Acessibilidade:
// Salva os valores originais de fonte em um objeto
var valoresOriginais = {};

// Inicializa os valores originais e esvazia a sessão ao recarregar
function inicializarValoresOriginais() {
    sessionStorage.clear(); // Esvazia a sessão ao recarregar a página
    var elementos = document.querySelectorAll('*');

    elementos.forEach((elemento, index) => {
        const fontSize = parseFloat(window.getComputedStyle(elemento).getPropertyValue('font-size'));
        valoresOriginais[index] = fontSize; // Salva no objeto local
        sessionStorage.setItem(`font-${index}`, fontSize); // Salva na sessão
    });
}

// Chama a função ao carregar a página
window.onload = inicializarValoresOriginais;

// Função para Aumentar tamanho de texto:
function fontUp() {
    var elementos = document.querySelectorAll('*:not(.btn-acess *)');

    elementos.forEach((elemento, index) => {
        var tamanhoFonteAtual = parseFloat(window.getComputedStyle(elemento).getPropertyValue('font-size'));
        var novoTamanhoFonte = tamanhoFonteAtual * 1.1;
        elemento.style.fontSize = novoTamanhoFonte + 'px';
        sessionStorage.setItem(`font-${index}`, novoTamanhoFonte); // Atualiza na sessão
    });
}

// Função para Diminuir tamanho de texto:
function fontDown() {
    var elementos = document.querySelectorAll('*:not(.btn-acess *)');

    elementos.forEach((elemento, index) => {
        var tamanhoFonteAtual = parseFloat(window.getComputedStyle(elemento).getPropertyValue('font-size'));
        var novoTamanhoFonte = tamanhoFonteAtual * 0.9;
        elemento.style.fontSize = novoTamanhoFonte + 'px';
        sessionStorage.setItem(`font-${index}`, novoTamanhoFonte); // Atualiza na sessão
    });
}

// Função para Redefinir tamanho de texto:
function fontRestart() {
    var elementos = document.querySelectorAll('*');

    elementos.forEach((elemento, index) => {
        var tamanhoOriginal = valoresOriginais[index]; // Recupera o tamanho original
        if (tamanhoOriginal) {
            elemento.style.fontSize = tamanhoOriginal + 'px';
            sessionStorage.setItem(`font-${index}`, tamanhoOriginal); // Atualiza na sessão
        }
    });
}



//Função de alto contraste:
function highContrast() {
    const elements = document.querySelectorAll('*');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        if (element.classList.contains("protanopia")) {
            element.classList.remove("protanopia");
        }

        elements[i].classList.toggle("contrast");
    }
}

//Função de Daltonismo Protanopia:
function daltonism() {
    const elements = document.querySelectorAll('*');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        if (element.classList.contains("contrast")) {
            element.classList.remove("contrast");
        }

        
        element.classList.toggle("protanopia");
    }
}

// Função para alternar o tema
function toggleTheme() {
    const toggleButton = document.querySelector("[onclick='toggleTheme()']");
    const toggleIcone = toggleButton.querySelector("i");

    // Alterna a classe "dark" no <html>
    const isDark = document.documentElement.classList.toggle("dark");

    if (isDark) {
        toggleIcone.classList.remove("ph-moon");
        toggleIcone.classList.add("ph-sun");
        localStorage.setItem("theme", "dark");
    } else {
        toggleIcone.classList.remove("ph-sun");
        toggleIcone.classList.add("ph-moon");
        localStorage.setItem("theme", "light");
    }
}

// Aplica o tema salvo ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        
        // Atualiza o ícone corretamente
        const toggleButton = document.querySelector("[onclick='toggleTheme()']");
        if (toggleButton) {
            const toggleIcone = toggleButton.querySelector("i");
            toggleIcone.classList.remove("ph-moon");
            toggleIcone.classList.add("ph-sun");
        }
    }
});
