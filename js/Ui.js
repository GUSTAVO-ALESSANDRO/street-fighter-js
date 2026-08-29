// Objeto que lista o que existe nas pastas
const CATALOGO_DE_ASSETS = {
    personagens: ["Ruy", "Ken"],
    cenarios: ["China", "Havai", "Japao", "Macedônia", "Venezuela"]
};

class UI {
    // instancia as referencias para os componentes do HTML e estruturas de dados
    constructor() {
        this.menu = document.getElementById("tela-menu");
        this.escolhaModo = document.getElementById("seletor-modo");
        this.escolhaP1 = document.getElementById("seletor-p1");
        this.escolhaP2 = document.getElementById("seletor-p2");
        this.escolhaCenario = document.getElementById("seletor-cenario");
        this.botaoStart = document.getElementById("botao-iniciar");

        // Objeto vazio que vai guardar as opções do jogo
        this.configuracaoJogo = {
            modo: "pvc",
            p1: "Ruy",
            p2: null,
            cenario: "China"
        };
    }

    // popula com todos os personagens existentes a escolha
    popularPersonagens(id) {
        CATALOGO_DE_ASSETS.personagens.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;

            let escolhaPlayer = document.getElementById(id);
            escolhaPlayer.appendChild(opcao);
        });
    }

    // popula com todas as escolhas de cenarios possíveis
    popularCenarios() {
        CATALOGO_DE_ASSETS.cenarios.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;
            this.escolhaCenario.appendChild(opcao);
        });
    }

    escutarEventos() {
        this.botaoStart.addEventListener("click", () => {
            this.configuracaoJogo.modo = this.escolhaModo.value;
            this.configuracaoJogo.p1 = this.escolhaP1.value;
            this.configuracaoJogo.p2 = this.escolhaP2.value;
            this.configuracaoJogo.cenario = this.escolhaCenario.value;

            this.esconderMenu();
        });
    }

    mostrarMenu() {
        this.menu.style.display = "flex";
    }

    esconderMenu() {
        this.menu.style.display = "none";
    }
}

// Instancia a interface
const ui = new UI();

// Popula os seletores usando os métodos que você criou
ui.popularPersonagens("seletor-p1");
ui.popularPersonagens("seletor-p2");
ui.popularCenarios();

// Fica aguardando o clique do jogador
ui.escutarEventos();