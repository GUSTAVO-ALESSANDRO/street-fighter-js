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

        // Só inicia o loop quando a imagem carregar
        this.imagemCenario.onload = () => {
            this.jogoRodando = true;
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
        if (this.player1) this.player1.update(this.input.teclas, this.player2);

        if (this.player2) {
            // Se for o modo "pvc", envia um objeto com todas as entradas falsas
            const entradasP2 = (this.configuracoes.modo === "pvc") ? {} : this.input.teclas;
            
            this.player2.update(entradasP2, this.player1);
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
}

const main = new Main();

main.iniciar();