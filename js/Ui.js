// Objeto que lista o que existe nas pastas
const CATALOGO_DE_ASSETS = {
    personagens: ["Ruy", "Ken"],
    cenarios: ["Suzaku-JPN", "Ruinas-THA", "Genbugahara-JPN", "Cachoeira-VNZ", "Blanka-BRA", "Beco-JPN", "Bay-Area-EUA", "Amazonia-BRA"]
};

class UI {
    // Instancia as referencias para os componentes do HTML e estruturas de dados
    constructor() {
        this.menu = document.getElementById("tela-menu");
        this.escolhaModo = document.getElementById("seletor-modo");
        this.escolhaP1 = document.getElementById("seletor-p1");
        this.escolhaP2 = document.getElementById("seletor-p2");
        this.escolhaCenario = document.getElementById("seletor-cenario");
        this.botaoStart = document.getElementById("botao-iniciar");
        this.nomeP1 = document.getElementById("nome-p1");
        this.nomeP2 = document.getElementById("nome-p2");
        this.canvas = document.getElementById("canvasJogo");

        // Objeto vazio que vai guardar as opções do jogo
        this.configuracaoJogo = {
            modo: "pvc",
            p1: "Ruy",
            p2: null,
            cenario: "China"
        };
    }

    // Popula com todos os personagens existentes a escolha
    popularPersonagens(id) {
        CATALOGO_DE_ASSETS.personagens.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;

            let escolhaPlayer = document.getElementById(id);
            escolhaPlayer.appendChild(opcao);
        });
    }

    // Popula com todas as escolhas de cenarios possíveis
    popularCenarios() {
        CATALOGO_DE_ASSETS.cenarios.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;
            this.escolhaCenario.appendChild(opcao);
        });
    }

    escutarEventos() {
        // Detecta quando o usuário troca a opção no select de modo
        this.escolhaModo.addEventListener("change", () => {
            const containerP2 = this.escolhaP2.parentElement;
            if (this.escolhaModo.value === "pvc") {
                // Se for contra o PC, esconde a escolha do P2
                containerP2.style.display = "none";
                
                // Sortear P2 caso troque para PVC
                const indiceAleatorio = Math.floor(Math.random() * CATALOGO_DE_ASSETS.personagens.length);
                this.escolhaP2.value = CATALOGO_DE_ASSETS.personagens[indiceAleatorio];
            } else {
                // Se for PvP, mostra a caixa de seleção do P2 novamente
                containerP2.style.display = "block";
            }
        });

        this.botaoStart.addEventListener("click", () => {
            this.configuracaoJogo.modo = this.escolhaModo.value;
            this.configuracaoJogo.p1 = this.escolhaP1.value;
            
            // Garante um valor para o P2 se estiver em modo PvC e o select estiver oculto
            if (this.configuracaoJogo.modo === "pvc" && !this.escolhaP2.value) {
                const indiceAleatorio = Math.floor(Math.random() * CATALOGO_DE_ASSETS.personagens.length);
                this.escolhaP2.value = CATALOGO_DE_ASSETS.personagens[indiceAleatorio];
            }

            this.configuracaoJogo.p2 = this.escolhaP2.value;
            this.configuracaoJogo.cenario = this.escolhaCenario.value.toLowerCase();

            this.esconderMenu();
        });
    }

    mostrarMenu() {
        this.menu.style.display = "flex";
    }

    esconderMenu() {
        this.menu.style.display = "none";

        // Atualiza os nomes no HUD (em maiúsculas de forma dinâmica)
        this.nomeP1.textContent = `P1: ${this.configuracaoJogo.p1.toUpperCase()}`;
        this.nomeP2.textContent = `${this.configuracaoJogo.p2.toUpperCase()} :P2`;

        // Correção principal: uso do 'this.canvas' no lugar de 'canvas'
        const ctx = this.canvas.getContext("2d");
        const imagemCenario = new Image();

        // Certifique-se da extensão das suas imagens (.png ou .webp) e caminho relativo (assets/...)
        imagemCenario.src = `assets/cenario/${this.configuracaoJogo.cenario}.png`;

        // Desenha no Canvas ao carregar a imagem
        imagemCenario.onload = () => {
            ctx.drawImage(imagemCenario, 0, 0, this.canvas.width, this.canvas.height);
        };
    }
}

// Execução inicial simples para o commit atual
const ui = new UI();
ui.popularPersonagens("seletor-p1");
ui.popularPersonagens("seletor-p2");
ui.popularCenarios();
ui.escutarEventos();