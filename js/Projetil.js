class Projetil {
    constructor(x, y, ePlayer1, direcao, imagem, precisaEspelhar) {
        this.x = x;
        this.y = y;
        this.largura = 85;
        this.altura = 75;
        this.velocidade = 12 * direcao; // 1 (direita) ou -1 (esquerda)
        this.direcao = direcao;
        this.ePlayer1 = ePlayer1;
        this.dano = 30;
        this.destruido = false;
        this.imagem = imagem;
        this.precisaEspelhar = precisaEspelhar;
    }

    update() {
        this.x += this.velocidade;
    }

    draw(ctx) {
        if (this.imagem) {
            ctx.save();

            if (this.precisaEspelhar) {
                ctx.translate(this.x + this.largura, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura);
            } else {
                ctx.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
            }

            ctx.restore();
        }
        
        /*
        *
        *
        // Mostra a hitbox usada na colisao do projetil.
        ctx.save();
        ctx.fillStyle = "rgba(255, 230, 0, 0.18)";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.strokeStyle = "#ffeb3b";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.largura, this.altura);
        ctx.restore();
        *
        *
        */
    }
}