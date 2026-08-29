const ORIENTACAO_PERSONAGEM = {
    direita: ["Ken"],
    esquerda: ["Ruy"]
}

class Character{

    constructor(x, y, ePlayer1) {
        // Posição na tela
        this.x = x;
        this.y = y;
        
        // Dimensões do desenho
        this.largura = 100;
        this.altura = 200;

        // Orientação (se é P1 olha pra direita, se é P2 olha pra esquerda)
        this.ePlayer1 = ePlayer1;

        // Velocidade de Movimento
        this.velocidadeX = 0;
        this.velocidadeY = 0;

        // Hurtbox - Caixa de colisão para tomar dano
        this.hurtbox = {
            x: this.x,
            y: this.y,
            largura: 75,
            altura: 190
        };
    }

    // Exemplo desconexo de como desenhar a Hurtbox para depuração
    draw(ctx) {
        //Desenha o Retângulo da Hurtbox (vermelho/transparente para debug)
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.hurtbox.x, this.hurtbox.y, this.hurtbox.largura, this.hurtbox.altura);

        // Desenha o personagem no Canvas
        //ctx.drawImage("assets/personagem/ruy/ruy-intro.png", this.x, this.y, this.largura, this.altura);
    }

    update() {
        // Aplica o movimento na posição do personagem
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        // Atualiza a Hurtbox junto com o personagem
        this.hurtbox.x = this.x + 20;
        this.hurtbox.y = this.y + 10;
    }

    acharOrientacaoPersonagem(nome_personagem){
        return orientacao = ORIENTACAO_PERSONAGEM.direita.some(nome_personagem) != null ? 
                                    ORIENTACAO_PERSONAGEM.direita.some(nome_personagem) : 
                                    ORIENTACAO_PERSONAGEM.esquerda.some(nome_personagem)
    }

    parado(){
        this.velocidadeX = 0;
    }

    andarFrente(){
        this.velocidadeX = 5;
    }

    andarTras(){
        this.velocidadeX = -5;
    }

    jab(){

    }

    chute(){

    }

    agaixar(){

    }

    derrota(){

    }

    vitoria(){

    }

}