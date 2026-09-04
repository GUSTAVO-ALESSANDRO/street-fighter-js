class Main {
    constructor() {
        this.canvas = document.getElementById("canvasJogo");
        this.ctx = this.canvas.getContext("2d");
        
        this.imagemCenario = new Image();
        this.input = new InputHandler();
        this.jogoRodando = false;

        this.player1 = null;
        this.player2 = null;
        this.bot = null;

        this.configuracoes = null;

        this.tempoRestante = 99;
        this.intervaloTempo = null;

        this.podeLutar = false;

        this.roundAtual = 1;
        this.maxRounds = 3;
        this.trocandoRound = false;

        // Placar de vitórias por round
        this.vitoriasP1 = 0;
        this.vitoriasP2 = 0;
        this.historicoRounds = [];

        this.ui = null;
    }

    iniciar(){
        this.ui = new UI(this);
        this.ui.popularPersonagens("seletor-p1");
        this.ui.popularPersonagens("seletor-p2");
        this.ui.popularCenarios();
        this.ui.escutarEventos();
    }

    acharOrientacaoPersonagem(nome) {
        if (!nome) return "esquerda";
        const nomeLower = nome.toLowerCase();
        const ehDireita = ORIENTACAO_PERSONAGEM.direita.some(
            p => p.toLowerCase() === nomeLower
        );
        return ehDireita ? "direita" : "esquerda";
    }

    jogar(configuracoes) {
        this.roundAtual = 1;
        this.vitoriasP1 = 0;
        this.vitoriasP2 = 0;
        this.trocandoRound = false; 
        this.historicoRounds = [];
        this.configuracoes = configuracoes;

        this.imagemCenario.src = `assets/cenario/${configuracoes.cenario}.png`;

        this.player1 = new Character(100, 270, true, configuracoes.p1);  
        this.player2 = new Character(780, 270, false, configuracoes.p2); 

        if (this.configuracoes.modo === "pvc") {
            this.bot = new Bot(this.player1, this.player2);
        } else {
            this.bot = null;
        }

        // Define quem olha para onde com base no lado e na orientação nativa do sprite
        const orientP1 = this.acharOrientacaoPersonagem(configuracoes.p1);
        const orientP2 = this.acharOrientacaoPersonagem(configuracoes.p2);

        this.player1.olhandoParaEsquerda = (orientP1 === "esquerda");
        this.player2.olhandoParaEsquerda = (orientP2 === "direita");

        this.atualizarHUD();

        this.imagemCenario.onload = () => {
            this.jogoRodando = true;
            this.iniciarRound();
            this.loop();
        };
    }

    loop = () => {
        if (!this.jogoRodando) return;

        this.update(); 
        this.draw();   

        requestAnimationFrame(this.loop);
    }

    update() {
        const tempoEsgotado = this.tempoRestante <= 0;
        const alguemMorreu = this.player1.vida <= 0 || this.player2.vida <= 0;

        if (alguemMorreu || tempoEsgotado) {
            if (!this.trocandoRound) {
                this.trocandoRound = true;
                this.podeLutar = false;
                this.pararTemporizador();
                
                let vencedorRound = "empate";

                if (this.player1.vida > this.player2.vida) {
                    vencedorRound = "P1";
                    this.vitoriasP1++;
                } else if (this.player2.vida > this.player1.vida) {
                    vencedorRound = "P2";
                    this.vitoriasP2++;
                }

                this.historicoRounds.push(vencedorRound);

                if (tempoEsgotado && !alguemMorreu) {
                    this.exibirKOTimeOver("TIME OVER");
                } else {
                    this.exibirKOTimeOver("K.O");
                }

                this.agendarProximoRound();
            }

            this.player1.atualizarVitoriaDerrota();
            this.player2.atualizarVitoriaDerrota();
        } else {
            // Define de onde vêm as entradas do Player 2 (Bot ou Teclado Humano)
            let entradasP2 = this.input.teclas;
            
            if (this.configuracoes.modo === "pvc" && this.bot && this.podeLutar) {
                entradasP2 = this.bot.decidir();
            }

            if (this.player1) {
                this.player1.update(this.input.teclas, this.player2, this.podeLutar);
            }
            if (this.player2) {
                this.player2.update(entradasP2, this.player1, this.podeLutar);
            }

            if (this.player1 && this.player2) {
                this.checarAtaques();
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.imagemCenario, 0, 0, this.canvas.width, this.canvas.height);

        if (this.player1) this.player1.draw(this.ctx);
        if (this.player2) this.player2.draw(this.ctx);
    }

    checarAtaques() {
        if (this.colidir(this.player1, this.player2)) {
            this.player1.hitbox.jaAcertou = true;
            const dano = (this.player1.tipoAtaque === "jab") ? 6 : 8;
            this.player2.tomarDano(dano, this.player1.tipoAtaque);
            this.atualizarHUD();
        }

        if (this.colidir(this.player2, this.player1)) {
            this.player2.hitbox.jaAcertou = true;
            const dano = (this.player2.tipoAtaque === "jab") ? 6 : 8;
            this.player1.tomarDano(dano, this.player2.tipoAtaque);
            this.atualizarHUD();
        }
    }

    colidir(atacante, defensor) {
        if (!atacante.hitbox || atacante.hitbox.jaAcertou) return false;

        const hit = atacante.hitbox;
        const hurt = defensor.hurtbox;

        return (
            hit.x < hurt.x + hurt.largura &&
            hit.x + hit.largura > hurt.x &&
            hit.y < hurt.y + hurt.altura &&
            hit.y + hit.altura > hurt.y
        );
    }

    atualizarHUD() {
        const barraEsquerda = document.getElementById("vida-p1");
        const barraDireita = document.getElementById("vida-p2");
        const nomeEsquerda = document.getElementById("nome-p1");
        const nomeDireita = document.getElementById("nome-p2");

        // Verifica se no round atual o P1 está na esquerda ou na direita
        const p1NaEsquerda = (this.roundAtual % 2 !== 0);

        // Quem está do lado esquerdo e do lado direito no momento
        const personagemEsquerda = p1NaEsquerda ? this.player1 : this.player2;
        const personagemDireita = p1NaEsquerda ? this.player2 : this.player1;

        const nomeP1Str = this.configuracoes ? this.configuracoes.p1.toUpperCase() : "P1";
        const nomeP2Str = this.configuracoes ? this.configuracoes.p2.toUpperCase() : "P2";

        // Atualiza textos do HUD mantendo a posição visual correta da tela
        if (nomeEsquerda) {
            nomeEsquerda.textContent = p1NaEsquerda 
                ? `P1: ${nomeP1Str} (${this.vitoriasP1})` 
                : `P2: ${nomeP2Str} (${this.vitoriasP2})`;
        }
        if (nomeDireita) {
            nomeDireita.textContent = p1NaEsquerda 
                ? `${nomeP2Str} :P2 (${this.vitoriasP2})` 
                : `${nomeP1Str} :P1 (${this.vitoriasP1})`;
        }

        // Atualiza as barras com base no personagem físico que está naquele lado
        if (barraEsquerda && personagemEsquerda) {
            const porc1 = Math.max(0, (personagemEsquerda.vida / personagemEsquerda.vidaMaxima) * 100);
            barraEsquerda.style.width = `${porc1}%`;
        }

        if (barraDireita && personagemDireita) {
            const porc2 = Math.max(0, (personagemDireita.vida / personagemDireita.vidaMaxima) * 100);
            barraDireita.style.width = `${porc2}%`;
        }
    }

    iniciarRound() {
        this.podeLutar = false; 
        this.tempoRestante = 99;
        this.atualizarHUDTempo();

        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");

        // Remove estilo do KO e volta estilo padrao
        texto.classList.remove("texto-status");

        // Exibe "ROUND X"
        texto.textContent = `ROUND ${this.roundAtual}`;
        overlay.classList.remove("escondido");

        setTimeout(() => {
            texto.textContent = "FIGHT!";

            setTimeout(() => {
                overlay.classList.add("escondido");
                this.podeLutar = true; 
                this.iniciarTemporizador();
            }, 1000);

        }, 1500);
    }

    iniciarTemporizador() {
        if (this.intervaloTempo) clearInterval(this.intervaloTempo);

        this.intervaloTempo = setInterval(() => {
            if (this.podeLutar) {
                this.tempoRestante--;
                this.atualizarHUDTempo();

                if (this.tempoRestante <= 0) {
                    this.tempoRestante = 0;
                    this.atualizarHUDTempo();
                    this.podeLutar = false;
                    clearInterval(this.intervaloTempo);
                }
            }
        }, 1000);
    }

    pararTemporizador() {
        if (this.intervaloTempo) {
            clearInterval(this.intervaloTempo);
            this.intervaloTempo = null;
        }
    }

    atualizarHUDTempo() {
        const tempo = document.getElementById("tempo-jogo");
        if (tempo) tempo.textContent = this.tempoRestante;
    }

    // Exibe apenas as mensagens impactantes (K.O. e TIME OVER)
    exibirKOTimeOver(status) {
        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");

        if (overlay && texto) {
            texto.textContent = status;
            texto.classList.add("texto-status");
            overlay.classList.remove("escondido");
        }
    }

    agendarProximoRound() {
        setTimeout(() => {
            const r = this.historicoRounds;
            const total = r.length;

            let vencedorPartida = null; // null = continua o jogo

            // quem faz 2 vitórias ganha a partida
            if (this.vitoriasP1 >= 2){
                vencedorPartida = "P1 WIN!";
            } else if (this.vitoriasP2 >= 2) {
                vencedorPartida = "P2 WIN!";
            } else if (total === 2) { // verifica 1 vitória e 1 empate
                if (this.vitoriasP1 === 1 && this.vitoriasP2 === 0) {
                    vencedorPartida = "P1 WIN!";
                }
                else if (this.vitoriasP2 === 1 && this.vitoriasP1 === 0){
                    vencedorPartida = "P2 WIN!";
                }
            } else if (total === 3) {
                if (this.vitoriasP1 === 0 && this.vitoriasP2 === 0) {
                    // 3 empates seguidos, os dois perdem
                    vencedorPartida = "GAME OVER";
                } else {
                    // Se houve vitoria alternada e empate no final e ganha quem venceu o R1
                    const primeiroVencedor = r.find(res => res === "P1" || res === "P2");
                    vencedorPartida = primeiroVencedor ? `${primeiroVencedor} WIN!` : "GAME OVER";
                }
            }

            if (vencedorPartida) {
                this.finalizarPartida(vencedorPartida);
            } else {
                this.roundAtual++;
                this.resetarRound();
            }
        }, 3000);
    }

    finalizarPartida(mensagem) {
        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");

        if (overlay && texto) {
            texto.classList.remove("texto-status");
            texto.textContent = mensagem;
            overlay.classList.remove("escondido");
        }

        // Registra a vitória na UI
        if (this.ui) {
            if (mensagem.includes("P1 WIN")) {
                this.ui.registrarVitoriaPartida("P1");
            } else if (mensagem.includes("P2 WIN")) {
                this.ui.registrarVitoriaPartida("P2");
            }
        }

        // Interrompe o temporizador e a execução do loop do Canvas
        this.pararTemporizador();
        this.jogoRodando = false;

        // Aguarda 3 segundos exibindo a mensagem antes de retornar ao menu principal
        setTimeout(() => {
            if (overlay) overlay.classList.add("escondido");

            // Limpa o canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Exibe o menu de volta
            this.ui.mostrarMenu();
        }, 3000);
    }

    resetarRound() {
        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");
        if (overlay && texto) {
            overlay.classList.add("escondido");
            texto.classList.remove("texto-status");
        }

        // Alterna a posição inicial de spawn a cada round
        const p1LadoEsquerdo = (this.roundAtual % 2 !== 0);
        const xP1 = p1LadoEsquerdo ? 100 : 780;
        const xP2 = p1LadoEsquerdo ? 780 : 100;

        if (this.player1 && this.player2) {
            this.player1.resetarPersonagem(xP1, 270, p1LadoEsquerdo);
            this.player2.resetarPersonagem(xP2, 270, !p1LadoEsquerdo);

            const orientP1 = this.acharOrientacaoPersonagem(this.player1.nome);
            const orientP2 = this.acharOrientacaoPersonagem(this.player2.nome);

            // Se P1 está no lado esquerdo, deve olhar para a direita e vice-versa
            this.player1.olhandoParaEsquerda = p1LadoEsquerdo ? (orientP1 === "esquerda") : (orientP1 === "direita");
            this.player2.olhandoParaEsquerda = !p1LadoEsquerdo ? (orientP2 === "esquerda") : (orientP2 === "direita");
        }

        this.atualizarHUD();
        this.trocandoRound = false;
        this.iniciarRound();
    }
}

const main = new Main();
main.iniciar();