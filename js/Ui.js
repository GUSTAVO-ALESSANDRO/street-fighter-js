// Objeto que lista o que existe nas pastas
const CATALOGO_DE_ASSETS = {
    personagens: ["Ryu", "Ken"],
    cenarios: ["Suzaku-JPN", "Ruinas-THA", "Cachoeira-VNZ", "Blanka-BRA", "Beco-JPN", "Amazonia-BRA"]
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
            cenario: "Suzaku-JPN"
        };

        // preview e placar
        this.fundoPreview = document.getElementById("fundo-preview-cenario");
        this.previewP1Img = document.getElementById("preview-p1-img");
        this.previewP2Img = document.getElementById("preview-p2-img");
        this.rotuloPlacarP2 = document.getElementById("rotulo-placar-p2");
        this.vitoriasP1Elem = document.getElementById("vitorias-p1");
        this.vitoriasP2Elem = document.getElementById("vitorias-p2");

        // placar acumulado de partidas
        this.placarGeral = {
            pvp: { p1: 0, p2: 0 },
            pvc: { p1: 0, pc: 0 }
        };

        this.animacaoP1Timer = null;
        this.animacaoP2Timer = null;
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
        this.escolhaModo.addEventListener("change", () => {
            const containerP2 = this.escolhaP2.parentElement;
            
            if (this.escolhaModo.value === "pvc") {
                this.rotuloPlacarP2.textContent = "VITÓRIAS (PC)";
                this.sortearPC();
                this.escolhaP2.disabled = true; // Desabilita troca manual em PvC
            } else {
                this.rotuloPlacarP2.textContent = "VITÓRIAS (P2)";
                this.escolhaP2.disabled = false;
            }
            this.atualizarPreview();
        });

        // troca de personagens e cenario
        this.escolhaP1.addEventListener("change", () => this.atualizarPreview());
        this.escolhaP2.addEventListener("change", () => this.atualizarPreview());
        this.escolhaCenario.addEventListener("change", () => this.atualizarPreview());

        // iniciar a luta
        this.botaoStart.addEventListener("click", () => {
            this.configuracaoJogo.modo = this.escolhaModo.value;
            this.configuracaoJogo.p1 = this.escolhaP1.value;
            this.configuracaoJogo.p2 = this.escolhaP2.value;
            this.configuracaoJogo.cenario = this.escolhaCenario.value.toLowerCase();

            this.esconderMenu();
            this.main.jogar(this.configuracaoJogo);
        });

        // Atualiza o preview inicial com os valores padrão dos selectors
        this.atualizarPreview();
    }

    sortearPC() {
        const indiceAleatorio = Math.floor(Math.random() * CATALOGO_DE_ASSETS.personagens.length);
        const personagemSorteado = CATALOGO_DE_ASSETS.personagens[indiceAleatorio];
        this.escolhaP2.value = personagemSorteado;
        this.configuracaoJogo.p2 = personagemSorteado;
    }

    atualizarPreview() {
        const p1 = this.escolhaP1.value.toLowerCase();
        const p2 = this.escolhaP2.value.toLowerCase();
        const cenario = this.escolhaCenario.value;
        const modo = this.escolhaModo.value;

        // atualiza imagem parada do P1 e P2
        this.iniciarAnimacaoPreview(this.previewP1Img, p1, 'animacaoP1Timer', false);
        this.iniciarAnimacaoPreview(this.previewP2Img, p2, 'animacaoP2Timer', true);

        // atualiza imagem de fundo do cenario
        this.fundoPreview.style.backgroundImage = `url('assets/cenario/${cenario.toLowerCase()}.png')`;

        // atualiza os placares gerais de acordo com o modo escolhido
        if (modo === "pvc") {
            this.vitoriasP1Elem.textContent = this.placarGeral.pvc.p1;
            this.vitoriasP2Elem.textContent = this.placarGeral.pvc.pc;
        } else {
            this.vitoriasP1Elem.textContent = this.placarGeral.pvp.p1;
            this.vitoriasP2Elem.textContent = this.placarGeral.pvp.p2;
        }
    }

    // Registra a vitória na UI ao fim do jogo
    registrarVitoriaPartida(vencedor) {
        const modo = this.escolhaModo.value;
        if (modo === "pvc") {
            if (vencedor === "P1") this.placarGeral.pvc.p1++;
            else if (vencedor === "P2") this.placarGeral.pvc.pc++;
        } else {
            if (vencedor === "P1") this.placarGeral.pvp.p1++;
            else if (vencedor === "P2") this.placarGeral.pvp.p2++;
        }
    }

    iniciarAnimacaoPreview(elementoImg, nomePersonagem, timerProp, isP2 = false) {
        if (this[timerProp]) clearInterval(this[timerProp]);

        let frame = 1;
        elementoImg.src = `assets/personagem/${nomePersonagem}/${nomePersonagem}${frame}.png`;

        // Descobre a orientação nativa do personagem
        const orientacaoNativa = this.main.acharOrientacaoPersonagem(nomePersonagem);
        let inverter = false;
        if (!isP2) {
            // P1
            inverter = (orientacaoNativa === "esquerda");
        } else {
            // P2
            inverter = (orientacaoNativa === "direita");
        }

        elementoImg.style.transform = inverter ? "scaleX(-1)" : "scaleX(1)";

        this[timerProp] = setInterval(() => {
            frame = (frame % 3) + 1;
            elementoImg.src = `assets/personagem/${nomePersonagem}/${nomePersonagem}${frame}.png`;
        }, 300);
    }

    mostrarMenu() {
        this.menu.style.display = "flex";
        // Atualiza os números do placar e as imagens assim que retorna ao menu
        this.atualizarPreview();
    }

    esconderMenu(){
        this.menu.style.display = "none";
        
        // Atualiza os nomes no HUD
        this.nomeP1.textContent = `P1: ${this.configuracaoJogo.p1.toUpperCase()}`;
        this.nomeP2.textContent = `${this.configuracaoJogo.p2.toUpperCase()} :P2`;
    }
}