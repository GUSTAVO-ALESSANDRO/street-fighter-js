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

        this.tempoRestante = 99;
        this.intervaloTempo = null;
        this.roundAtual = 1;
        this.podeLutar = false; // Flag que trava/libera a movimentação
    }

    iniciar(){
        // Instancia a interface
        const ui = new UI(this);

        // Popula os seletores usando os métodos que você criou
        ui.popularPersonagens("seletor-p1");
        ui.popularPersonagens("seletor-p2");
        ui.popularCenarios();

        // Fica aguardando o clique do jogador
        ui.escutarEventos();
    }

    // Método para iniciar o motor gráfico com base nas escolhas da UI
    jogar(configuracoes) {
        this.configuracoes = configuracoes;
        
        // Carrega a imagem do cenário selecionado
        this.imagemCenario.src = `assets/cenario/${configuracoes.cenario}.png`;

        this.player1 = new Character(100, 270, true, configuracoes.p1);  // true = é o P1
        this.player2 = new Character(780, 270, false, configuracoes.p2); // false = é o P2

        this.atualizarHUD();

        // Só inicia o loop quando a imagem carregar
        this.imagemCenario.onload = () => {
            this.jogoRodando = true;
            this.iniciarRound();
            this.loop(configuracoes); // Dispara o Game Loop
        };

    }

    // O Ciclo Principal de Renderização
    loop = () => {
        if (!this.jogoRodando) return;

        this.update(); // Atualiza posições e lógica
        this.draw();   // Desenha os elementos gráficos

        // Pede para o navegador chamar o método loop() no próximo frame
        requestAnimationFrame(this.loop);
    }

    update() {
        // Se a partida acabou, atualiza apenas as animações de fim de jogo
        if (this.player1.vida <= 0 || this.player2.vida <= 0) {
            // Se ainda não estava registrado o fim de jogo
            if (this.podeLutar) {
                this.podeLutar = false;
                this.pararTemporizador();
                this.exibirKO();
            }

            this.player1.atualizarVitoriaDerrota();
            this.player2.atualizarVitoriaDerrota();
        } else {
            // Se for o modo "pvc", envia um objeto com todas as entradas falsas
            const entradasP2 = (this.configuracoes.modo === "pvc") ? {} : this.input.teclas;

            // Atualiza cada personagem
            if (this.player1) {
                this.player1.update(this.input.teclas, this.player2, this.podeLutar);
            }
            if (this.player2) {
                this.player2.update(entradasP2, this.player1, this.podeLutar);
            }

            // Checa colisões depois de atualizar os dois personagens
            if (this.player1 && this.player2) {
                this.checarAtaques();
            }
        }
    }

    draw() {
        // Limpa o frame anterior do Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha o fundo cobrindo todo o Canvas
        this.ctx.drawImage(this.imagemCenario, 0, 0, this.canvas.width, this.canvas.height);

        // Desenha os personagens por cima do fundo
        if (this.player1) this.player1.draw(this.ctx);
        if (this.player2) this.player2.draw(this.ctx);
    }

    checarAtaques() {
        // Verifica golpe do P1 no P2
        if (this.colidir(this.player1, this.player2)) {
            this.player1.hitbox.jaAcertou = true; // Marca como processado
            const dano = (this.player1.tipoAtaque === "jab") ? 6 : 8;
            this.player2.tomarDano(dano, this.player1.tipoAtaque);
            this.atualizarHUD();
        }

        // Verifica golpe do P2 no P1
        if (this.colidir(this.player2, this.player1)) {
            this.player2.hitbox.jaAcertou = true; // Marca como processado
            const dano = (this.player2.tipoAtaque === "jab") ? 6 : 8;
            this.player1.tomarDano(dano, this.player2.tipoAtaque);
            this.atualizarHUD();
        }
    }

    colidir(atacante, defensor) {
        // Se não houver hitbox ativa ou se ela já registrou o acerto, ignora
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

        if (barraP1 && this.player1) {
            const porc1 = (this.player1.vida / this.player1.vidaMaxima) * 100;
            barraP1.style.width = `${porc1}%`;
        }

        if (barraP2 && this.player2) {
            const porc2 = (this.player2.vida / this.player2.vidaMaxima) * 100;
            barraP2.style.width = `${porc2}%`;
        }
    }

    // Método para iniciar a animação do Round e depois o contador
    iniciarRound() {
        this.podeLutar = false; // Trava os personagens durante a introdução
        this.tempoRestante = 99;
        this.atualizarHUDTempo();

        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");

        // Exibe "ROUND 1"
        texto.textContent = `ROUND ${this.roundAtual}`;
        overlay.classList.remove("escondido");

        // Após 1.5s muda para "FIGHT!"
        setTimeout(() => {
            texto.textContent = "FIGHT!";

            // Após mais 1s esconde o texto e libera o jogo + contador
            setTimeout(() => {
                overlay.classList.add("escondido");
                this.podeLutar = true; // Libera os personagens
                this.iniciarTemporizador();
            }, 1000);

        }, 1500);
    }

    // Controle do Temporizador
    iniciarTemporizador() {
        if (this.intervaloTempo) clearInterval(this.intervaloTempo);

        this.intervaloTempo = setInterval(() => {
            if (this.podeLutar) {
                this.tempoRestante--;
                this.atualizarHUDTempo();

                // Quando chega a 0 trava tudo e para o tempo
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

    exibirKO() {
        const overlay = document.getElementById("overlay-status");
        const texto = document.getElementById("texto-status");

        if (overlay && texto) {
            texto.textContent = "K.O.";
            overlay.classList.remove("escondido");
            
            texto.classList.add("texto-ko");
        }
    }
}

const main = new Main();

main.iniciar();