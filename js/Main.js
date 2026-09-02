class Main {
    constructor() {
        this.canvas = document.getElementById("canvasJogo");
        this.ctx = this.canvas.getContext("2d");
        
        this.imagemCenario = new Image();
        this.input = new InputHandler();
        this.jogoRodando = false;

        this.player1 = null;
        this.player2 = null;

        this.configuracoes = null;

        this.tempoRestante = 9;
        this.intervaloTempo = null;

        this.podeLutar = false;

        this.roundAtual = 1;
        this.maxRounds = 3;
        this.trocandoRound = false;

        // Placar de vitórias por round
        this.vitoriasP1 = 0;
        this.vitoriasP2 = 0;
        this.historicoRounds = [];
    }

    iniciar(){
        const ui = new UI(this);
        ui.popularPersonagens("seletor-p1");
        ui.popularPersonagens("seletor-p2");
        ui.popularCenarios();
        ui.escutarEventos();
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

                // Registra o resultado no histórico
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
            const entradasP2 = (this.configuracoes.modo === "pvc") ? {} : this.input.teclas;

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
        const barraP1 = document.getElementById("vida-p1");
        const barraP2 = document.getElementById("vida-p2");
        const nomeP1 = document.getElementById("nome-p1");
        const nomeP2 = document.getElementById("nome-p2");

        if (this.configuracoes) {
            if (nomeP1) nomeP1.textContent = `P1: ${this.configuracoes.p1.toUpperCase()} (${this.vitoriasP1})`;
            if (nomeP2) nomeP2.textContent = `${this.configuracoes.p2.toUpperCase()} :P2 (${this.vitoriasP2})`;
        }

        if (barraP1 && this.player1) {
            const porc1 = Math.max(0, (this.player1.vida / this.player1.vidaMaxima) * 100);
            barraP1.style.width = `${porc1}%`;
        }

        if (barraP2 && this.player2) {
            const porc2 = Math.max(0, (this.player2.vida / this.player2.vidaMaxima) * 100);
            barraP2.style.width = `${porc2}%`;
        }
    }

    iniciarRound() {
        this.podeLutar = false; 
        this.tempoRestante = 9;
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

        // P1 continua respondendo às teclas do P1, apenas reseta posição e lado onde nasceu
        if (this.player1 && this.player2) {
            this.player1.resetarPersonagem(xP1, 270, p1LadoEsquerdo);
            this.player2.resetarPersonagem(xP2, 270, !p1LadoEsquerdo);
        }

        this.atualizarHUD();
        this.trocandoRound = false;
        this.iniciarRound();
    }
}

const main = new Main();
main.iniciar();