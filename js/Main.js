class Main {
    constructor() {
        this.canvas = document.getElementById("canvasJogo");
        this.ctx = this.canvas.getContext("2d");
        
        this.imagemCenario = new Image();
        this.jogoRodando = false;
    }

    iniciar(){
        // Instancia a interface
        const ui = new UI(this);

        // Popula os seletores
        ui.popularPersonagens("seletor-p1");
        ui.popularPersonagens("seletor-p2");
        ui.popularCenarios();

        // Fica aguardando o clique do jogador
        ui.escutarEventos();
    }

    // Método para iniciar o motor gráfico com base nas escolhas da UI
    jogar(configuracoes) {
        // Carrega a imagem do cenário selecionado
        this.imagemCenario.src = `assets/cenario/${configuracoes.cenario}.png`;

        // Só inicia o loop quando a imagem carregar
        this.imagemCenario.onload = () => {
            this.jogoRodando = true;
            this.loop(); // Dispara o Game Loop
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
        // Reservado para lógica de física, comandos e movimento
    }

    draw() {
        // Limpa o frame anterior do Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenha o fundo cobrindo todo o Canvas
        this.ctx.drawImage(this.imagemCenario, 0, 0, this.canvas.width, this.canvas.height);
    }
}

const main = new Main();

main.iniciar();