class Bot {
    constructor(player1, player2) {
        this.p1 = player1;
        this.p2 = player2;

        this.cooldownFrames = 0;
        this.esperaDefesaFrames = 0;
        this.andarFrames = 0;
        this.direcaoAndar = null;
    }

    // Retorna um objeto simulando o pressionamento de teclas do P2
    decidir() {
        const teclasBot = {
            p2_esquerda: false,
            p2_direita: false,
            p2_cima: false,
            p2_baixo: false,
            p2_jab: false,
            p2_chute: false
        };

        const distancia = Math.abs(this.p2.x - this.p1.x);

        // se estiver pulando, mantém o movimento em direção a o player
        if (!this.p2.estaNoChao) {
            if (this.direcaoAndar === "frente") {
                if (this.p2.x > this.p1.x) teclasBot.p2_esquerda = true;
                else teclasBot.p2_direita = true;
            } else if (this.direcaoAndar === "tras") {
                if (this.p2.x > this.p1.x) teclasBot.p2_direita = true;
                else teclasBot.p2_esquerda = true;
            }
            return teclasBot;
        }

        // se estiver andando
        if (this.andarFrames > 0) {
            this.andarFrames--;
            if (this.p2.x > this.p1.x) {
                // anda para esquerda em direção ao player
                teclasBot.p2_esquerda = true;
            } else {
                // anda para direita em direção ao player
                teclasBot.p2_direita = true;
            }
            return teclasBot;
        }

        // se estiver em tempo de espera
        if (this.cooldownFrames > 0) {
            this.cooldownFrames--;

            if (this.esperaDefesaFrames > 0) {
                this.esperaDefesaFrames--;
                teclasBot.p2_baixo = true; // continua agachado
            }
            return teclasBot;
        }

        // decisão a curta distância
        if (distancia <= 160) {
            const escolheAcao = this.gerarNumeroAleatorio(1, 9);

            // 1, 2 e 3 é jab
            if (escolheAcao === 1 || escolheAcao === 2 || escolheAcao === 3) {
                teclasBot.p2_jab = true;
                this.cooldownFrames = 20;
            } 
            // 4, 5 e 6 é chute
            else if (escolheAcao === 4 || escolheAcao === 5 || escolheAcao === 6) {
                teclasBot.p2_chute = true;
                this.cooldownFrames = 22;
            } 
            // 7 e 8 agaixa
            else if (escolheAcao === 7 || escolheAcao === 8) {
                teclasBot.p2_baixo = true;
                this.esperaDefesaFrames = 40;
                this.cooldownFrames = 40;
            } 
            // 9 pula para trás
            else if (escolheAcao === 9) {
                teclasBot.p2_cima = true;
                this.direcaoAndar = "tras";
                if (this.p2.x > this.p1.x) {
                    teclasBot.p2_direita = true;
                } else {
                    teclasBot.p2_esquerda = true;
                }
                this.cooldownFrames = 25;
            }
        }
        // decisão a longa distancia
        else {
            const acaoAproximacao = this.gerarNumeroAleatorio(1, 20);

            if (acaoAproximacao === 1) {
                teclasBot.p2_cima = true;
                this.direcaoAndar = "frente";
                if (this.p2.x > this.p1.x){
                    teclasBot.p2_esquerda = true;
                } else {
                    teclasBot.p2_direita = true;
                }
                this.cooldownFrames = 30;
            } else {
                // Inicia caminhada por 15 frames seguidos
                this.andarFrames = 15;
                if (this.p2.x > this.p1.x) {
                    teclasBot.p2_esquerda = true;
                } else {
                    teclasBot.p2_direita = true;
                }
            }
        }

        return teclasBot;
    }

    gerarNumeroAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}