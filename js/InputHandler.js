class InputHandler {
    constructor() {
        // Objeto que guarda o estado atual de cada ação (true = pressionada, false = solta)
        this.teclas = {
            // Controles Jogador 1
            p1_esquerda: false,
            p1_direita: false,
            p1_cima: false,
            p1_baixo: false,
            p1_jab: false,
            p1_chute: false,

            // Controles Jogador 2
            p2_esquerda: false,
            p2_direita: false,
            p2_cima: false,
            p2_baixo: false,
            p2_jab: false,
            p2_chute: false
        };

        // Mapeamento: Tecla do Teclado - Nome da Ação no jogo
        this.mapaTeclas = {
            // P1 (W, A, S, D + F, G)
            "KeyA": "p1_esquerda",
            "KeyD": "p1_direita",
            "KeyW": "p1_cima",
            "KeyS": "p1_baixo",
            "KeyF": "p1_jab",
            "KeyG": "p1_chute",

            // P2 (Setas + K, L)
            "ArrowLeft": "p2_esquerda",
            "ArrowRight": "p2_direita",
            "ArrowUp": "p2_cima",
            "ArrowDown": "p2_baixo",
            "KeyK": "p2_jab",
            "KeyL": "p2_chute"
        };

        // Inicia os escutadores de eventos do navegador
        this.escutarTeclas();
    }

    escutarTeclas() {
        // Quando aperta uma tecla
        window.addEventListener("keydown", (evento) => {
            const acao = this.mapaTeclas[evento.code];
            if (acao !== undefined) {
                this.teclas[acao] = true;
            }
        });

        // Quando solta uma tecla
        window.addEventListener("keyup", (evento) => {
            const acao = this.mapaTeclas[evento.code];
            if (acao !== undefined) {
                this.teclas[acao] = false;
            }
        });
    }
}