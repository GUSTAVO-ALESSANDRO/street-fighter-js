// Objeto que lista o que existe nas pastas
const CATALOGO_DE_ASSETS = {
    personagens: ["Ryu", "Ken"],
    cenarios: ["Suzaku-JPN", "Ruinas-THA", "Cachoeira-VNZ", "Blanka-BRA", "Beco-JPN", "Bay-Area-EUA", "Amazonia-BRA"]
};

class UI{
    // instancia as referencias para os componentes do HTML e estruturas de dados
    constructor(main){
        this.main = main;

        this.menu = document.getElementById("tela-menu");
        this.escolhaModo = document.getElementById("seletor-modo");
        this.escolhaP1 = document.getElementById("seletor-p1");
        this.escolhaP2 = document.getElementById("seletor-p2");
        this.escolhaCenario = document.getElementById("seletor-cenario");
        this.botaoStart = document.getElementById("botao-iniciar");
        this.nomeP1 = document.getElementById("nome-p1");
        this.nomeP2 = document.getElementById("nome-p2");

        // Objeto vazio que vai guardar as opções do jogo
        this.configuracaoJogo = {
            modo: "pvc",
            p1: "Ruy",
            p2: null,
            cenario: "China"
        };
    }

    // popula com todos os personagens existentes a escolha
    popularPersonagens(id){
        CATALOGO_DE_ASSETS.personagens.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;

            let escolhaPlayer = document.getElementById(id);
            escolhaPlayer.appendChild(opcao);
        });
    }

    // popula com todas as escolhas de cenarios possíveis
    popularCenarios(){
        CATALOGO_DE_ASSETS.cenarios.forEach((item) => {
            const opcao = document.createElement("option");
            opcao.value = item;
            opcao.textContent = item;
            this.escolhaCenario.appendChild(opcao);
        });
    }

    escutarEventos(){
        // Detecta quando o usuário troca a opção no select de modo
        this.escolhaModo.addEventListener("change", () => {
            const containerP2 = this.escolhaP2.parentElement;
            if (this.escolhaModo.value === "pvc") {
                // Se for contra o PC, esconde a escolha do P2
                containerP2.style.display = "none";
                
                // Define um valor para o bot se estiver escondido
                // Gera um número aleatório entre 0 e o tamanho da lista de personagens
                const indiceAleatorio = Math.floor(Math.random() * CATALOGO_DE_ASSETS.personagens.length);
                // Pega o nome do personagem sorteado
                const personagemSorteado = CATALOGO_DE_ASSETS.personagens[indiceAleatorio]

                // Atribui o valor sorteado ao select do P2
                this.escolhaP2.value = personagemSorteado;
                // Atribui a escolha aleatoria na configuração
                this.configuracaoJogo.p2 = this.escolhaP2.value;
            } else {
                // Se for PvP, mostra a caixa de seleção do P2 novamente
                containerP2.style.display = "block";
            }
        });


        this.botaoStart.addEventListener("click", () => {
            this.configuracaoJogo.modo = this.escolhaModo.value;
            this.configuracaoJogo.p1 = this.escolhaP1.value;
            this.configuracaoJogo.p2 = this.escolhaP2.value;
            this.configuracaoJogo.cenario = this.escolhaCenario.value.toLowerCase();

            this.esconderMenu()
            this.main.jogar(this.configuracaoJogo);
        });
    }

    mostrarMenu(){
        this.menu.style.display = "flex";
    }

    esconderMenu(){
        this.menu.style.display = "none";
        
        // Atualiza os nomes no HUD
        this.nomeP1.textContent = `P1: ${this.configuracaoJogo.p1.toUpperCase()}`;
        this.nomeP2.textContent = `${this.configuracaoJogo.p2.toUpperCase()} :P2`;
    }
}