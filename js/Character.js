const ORIENTACAO_PERSONAGEM = {
    direita: ["Ken"],
    esquerda: ["Ruy"]
}

class Character {    
    constructor(x, y, ePlayer1, nomePersonagem) {
        // Posição na tela
        this.x = x;
        this.y = y;

        this.chao = y;
        
        // Dimensões do desenho
        this.largura = 100;
        this.altura = 200;

        // Orientação (se é P1 olha pra direita, se é P2 olha pra esquerda)
        this.ePlayer1 = ePlayer1;

        this.nome = nomePersonagem.toLowerCase();

        this.orientacaoNativa = this.acharOrientacaoPersonagem(nomePersonagem);

        // Velocidade de Movimento
        this.velocidadeX = 0;
        this.velocidadeY = 0;

        this.forcaPulo = -15;
        this.gravidade = 0.5;
        this.estaNoChao = true;

        // Controle de Animações
        this.estadoAtual = "parado"; // Estado atual para controle de animação (ex: 'parado', 'andar', 'jab')

        // Objeto de Imagem para a renderização do Sprite
        this.imagem = new Image();

        //Contador da imagem
        this.contImg = 0;
        this.derrotaImg = 0;

        // carrega a imagem de introdução ou estado atual
        this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;

        // orientação do personagem
        this.olhandoParaEsquerda = !ePlayer1;

        // Hurtbox - Caixa de colisão para tomar dano
        this.hurtbox = {
            x: this.x + 20,
            y: this.y + 10,
            largura: 55,
            altura: 180
        };
        // Hitbox - caixa para causar dano
        this.hitbox = null;

        this.teclaPuloLiberada = true;
        this.podeAtacar = true;
        this.teclaJabLiberada = true;
        this.teclaChuteLiberada = true;
        // Tempo em milissegundos entre ataques
        this.tempoCooldownAtaque = 300;
        this.duracaoAtaque = 220;
        this.atacando = false;
    }

    draw(ctx) {
        if (this.imagem.complete && this.imagem.naturalWidth !== 0) {
            ctx.save(); // Salva o estado atual do Canvas

            const precisaEspelhar = (this.olhandoParaEsquerda && this.orientacaoNativa === "direita") ||
                                    (!this.olhandoParaEsquerda && this.orientacaoNativa === "esquerda");

            if (precisaEspelhar) {
                ctx.translate(this.x + this.largura, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.imagem, 0, 0, this.largura, this.altura);
            } else {
                ctx.drawImage(this.imagem, this.x, this.y, this.largura, this.altura);
            }

            ctx.restore(); // Restaura o Canvas ao estado original
        }

        // Desenha a Hurtbox por cima (para depuração)
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.hurtbox.x, this.hurtbox.y, this.hurtbox.largura, this.hurtbox.altura);

        // Desenha a Hitbox em AZUL ( para depuração)
        if (this.hitbox) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.largura, this.hitbox.altura);
        }
    }

    update(teclas, oponente) {
        if (!teclas) return;

        // Atualiza a orientação com base na posição do oponente
        if (oponente) {
            // Se a minha posição X for maior que a do oponente, devo olhar para a esquerda
            this.olhandoParaEsquerda = this.x > oponente.x;
        }

        // Captura as teclas do jogador correto
        const teclaDireita = this.ePlayer1 ? teclas.p1_direita : teclas.p2_direita;
        const teclaEsquerda = this.ePlayer1 ? teclas.p1_esquerda : teclas.p2_esquerda;
        const teclaCima     = this.ePlayer1 ? teclas.p1_cima     : teclas.p2_cima;
        const teclaBaixo    = this.ePlayer1 ? teclas.p1_baixo    : teclas.p2_baixo;
        const teclaJab      = this.ePlayer1 ? teclas.p1_jab      : teclas.p2_jab;
        const teclaChute    = this.ePlayer1 ? teclas.p1_chute    : teclas.p2_chute;

        // Libera as teclas de ataque depois do jogador solta-las
        if (!teclaJab) {
            this.teclaJabLiberada = true;
        }
        if (!teclaChute) {
            this.teclaChuteLiberada = true;
        }

        // se agaxar trava todo o movimento
        if (teclaBaixo && this.estaNoChao) {
            this.velocidadeX = 0; // Para o movimento horizontal
            this.agaixar();
            return; // TRAVA todo o resto das ações enquanto estiver agachado
        } 
        else {
            if (teclaDireita) {
                this.andarFrente();
            } else if (teclaEsquerda) {
                this.andarTras();
            } else {
                this.parado();
            }

            if (teclaCima) {
                this.pular();
            }

            if (teclaJab && this.teclaJabLiberada) {
                this.teclaJabLiberada = false; // Trava até o jogador soltar o botão
                this.jab();
            } 

            else if (teclaChute && this.teclaChuteLiberada) {
                this.teclaChuteLiberada = false; // Trava até o jogador soltar o botão
                this.chute();
            }
        }

        // Aplica a física da gravidade
        this.aplicarGravidade(teclaCima);

        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        // Impede o personagem de sair da tela
        this.limitarTela(960);

        this.hurtbox.x = this.x + 20;
        this.hurtbox.y = this.y + 10;
    }

    // Retorna 'direita' se o nome estiver na lista de direita, senão 'esquerda'
    acharOrientacaoPersonagem(nome_personagem) {
        const olhaParaDireita = ORIENTACAO_PERSONAGEM.direita.includes(nome_personagem);
        return olhaParaDireita ? "direita" : "esquerda";
    }

    parado(){
        this.contImg +=1;
        this.velocidadeX = 0;

        // Não troca a imagem se estiver no ar ou atacando
        if (!this.estaNoChao || this.atacando) return;

        if(this.contImg % 40 == 0){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}1.png`;
        } else if (this.contImg % 40 == 12){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}2.png`;
        } else if (this.contImg % 40 == 25){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}3.png`;
        }
    }

    andarFrente(){
        this.contImg +=1;
        this.velocidadeX = 5;

        // Não troca a imagem se estiver no ar ou atacando
        if (!this.estaNoChao || this.atacando) return;

        if(this.ePlayer1){
            if(this.contImg % 20 == 0){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;
            } else if(this.contImg % 20 == 10){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-front.png`;
            }
        } else {
            if(this.contImg % 20 == 0){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;
            } else if(this.contImg % 20 == 10){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-late.png`;
            }
        }
    }

    andarTras(){
        this.contImg +=1;
        this.velocidadeX = -5;

        // Não troca a imagem se estiver no ar ou atacando
        if (!this.estaNoChao || this.atacando) return;

        if(this.ePlayer1){
            if(this.contImg % 20 == 0){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;
            } else if(this.contImg % 20 == 10){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-late.png`;
            }
        } else {
            if(this.contImg % 20 == 0){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;
            } else if(this.contImg % 20 == 10){
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-front.png`;
            }
        }
    }

    jab() {
        if (!this.podeAtacar) return;

        this.podeAtacar = false;
        this.atacando = true;

        // Início do soco
        this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-jab1.png`;

        // Calcula a posição da Hitbox de acordo com a direção
        const offsetX = this.olhandoParaEsquerda ? -60 : this.largura - 10;

        // Hitbox do Jab
        this.hitbox = {
            x: this.x + offsetX,
            y: this.y + 30,
            largura: 50,
            altura: 30
        };

        // Extensão do soco (após 1/10 da duração)
        setTimeout(() => {
            if (this.atacando) {
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-jab2.png`;
            }
        }, this.duracaoAtaque / 10);

        // Fim da Animação do Golpe
        setTimeout(() => {
            this.atacando = false; 
            this.hitbox = null; // Apaga a hitbox;
        }, this.duracaoAtaque);

        // Libera o Cooldown para o próximo ataque
        setTimeout(() => {
            this.podeAtacar = true;
        }, this.duracaoAtaque + this.tempoCooldownAtaque);
    }

    chute() {
        if (!this.podeAtacar) return;

        this.podeAtacar = false;
        this.atacando = true;

        // Início do chute
        this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-short1.png`;

        // Calcula a posição da Hitbox de acordo com a direção
        const offsetX = this.olhandoParaEsquerda ? -40 : this.largura - 10;

        // Hitbox do Chute
        this.hitbox = {
            x: this.x + offsetX,
            y: this.y + 110,
            largura: 70,
            altura: 40
        };

        // Extensão do chute (após 1/3 da duração)
        setTimeout(() => {
            if (this.atacando) {
                this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-short2.png`;
            }
        }, this.duracaoAtaque / 3);

        // Fim da Animação do Golpe
        setTimeout(() => {
            this.atacando = false; 
            this.hitbox = null; //Apaga a hitbox
        }, this.duracaoAtaque);

        // Libera o Cooldown para o próximo ataque
        setTimeout(() => {
            this.podeAtacar = true;
        }, this.duracaoAtaque + this.tempoCooldownAtaque);
    }

    agaixar(){
        if (this.atacando) return;

        this.contImg++;

        if(this.contImg % 40 == 0){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-basic.png`;
        } else if (this.contImg % 40 == 10){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-guard.png`;
        }
    }


    pular() {
        // Só pula se estiver no chão E se o jogador tiver soltado e apertado a tecla novamente
        if (this.estaNoChao && this.teclaPuloLiberada) {
            this.velocidadeY = this.forcaPulo;
            this.estaNoChao = false;
            // Trava até soltar a tecla
            this.teclaPuloLiberada = false;

            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-jump-up.png`;
        }
    }

    aplicarGravidade(teclaCima) {
        // Se o personagem estiver no ar, a gravidade atua puxando-o para baixo
        if (!this.estaNoChao) {
            this.velocidadeY += this.gravidade;

            if (!this.atacando) {
                if(this.velocidadeY < 0){
                    this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-jump-up.png`;
                } else{
                    this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-jump-down.png`;
                }
            }
        }

        // Verifica se tocou no chão novamente
        if (this.y + this.velocidadeY >= this.chao) {
            this.y = this.chao;
            this.velocidadeY = 0;
            // Libera para poder pular de novo
            this.estaNoChao = true;
        }

        // Libera a trava do pulo assim que o jogador solta a tecla
        if (!teclaCima) {
            this.teclaPuloLiberada = true;
        }
    }

    derrota(){
        this.derrotaImg++;
        if(this.contImg < 10){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-defeat1.png`;
        } else if (this.contImg < 20){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-defeat2.png`;
        } else {
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-defeat3.png`;
        }
    }

    vitoria(){
        this.contImg++;

        if(this.contImg % 40 == 0){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-victory1.png`;
        } else if (this.contImg % 40 == 10){
            this.imagem.src = `assets/personagem/${this.nome}/${this.nome}-victory2.png`;
        }
    }

    // impede o personagem sair da area visivel
    limitarTela(limiteCanvas) {
        // Impede de sair pela esquerda (X min = 0)
        if (this.x < 0) {
            this.x = 0;
        }
        // Impede de sair pela direita (X max = largura do Canvas - largura do personagem)
        if (this.x > limiteCanvas - this.largura) {
            this.x = limiteCanvas - this.largura;
        }
    }

}