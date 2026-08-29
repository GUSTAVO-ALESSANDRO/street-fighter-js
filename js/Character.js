const ORIENTACAO_PERSONAGEM = {
    direita: ["Ken"],
    esquerda: ["Ryu"]
}

class Character {    
    constructor(x, y, ePlayer1, nomePersonagem) {
        // Posição na tela
        this.x = x;
        this.y = y;
        
        // Dimensões do desenho
        this.largura = 100;
        this.altura = 200;

        // Orientação (se é P1 olha pra direita, se é P2 olha pra esquerda)
        this.ePlayer1 = ePlayer1;

        this.nome = nomePersonagem;

        // Velocidade de Movimento
        this.velocidadeX = 0;
        this.velocidadeY = 0;

        // Estado atual para controle de animação (ex: 'parado', 'andar', 'jab')
        this.estadoAtual = "parado";

        // Objeto de Imagem para a renderização do Sprite
        this.imagem = new Image();
        // Exemplo: carrega a imagem de introdução ou estado atual
        this.imagem.src = `assets/personagem/${this.nome.toLowerCase()}/${this.nome.toLowerCase()}1.png`;

        // Hurtbox - Caixa de colisão para tomar dano
        this.hurtbox = {
            x: this.x + 20,
            y: this.y + 10,
            largura: 55,
            altura: 180
        };
    }

    draw(ctx) {
        // Desenha a imagem do personagem assim que estiver carregada
        if (this.imagem.complete && this.imagem.naturalWidth !== 0) {
            ctx.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
        }

        // Desenha a Hurtbox por cima (para depuração)
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.hurtbox.x, this.hurtbox.y, this.hurtbox.largura, this.hurtbox.altura);
    }

    update() {
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

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