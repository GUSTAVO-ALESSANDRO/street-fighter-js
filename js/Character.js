const ORIENTACAO_PERSONAGEM = {
    direita: ["Ken"],
    esquerda: ["Ryu", "Akuma", "Sakura"]
};

class Character {    
    constructor(x, y, ePlayer1, nomePersonagem) {
        // Posição na tela
        this.x = x;
        this.y = y;

        this.chao = y;
        
        // Dimensões padrão do corpo/colisão
        this.largura = 100;
        this.altura = 200;

        // Altura alvo proporcional na tela
        this.alturaAlvo = 200; 
        this.alturaBaseSprite = 0;

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

        // Controle de Animações e Estados
        this.estadoAtual = "parado"; // 'parado', 'agachado', 'andar', etc.

        // Objeto de Imagem para a renderização do Sprite
        this.imagem = new Image();

        // Contadores da animação
        this.contImg = 0;
        this.contAgachar = 0;
        this.derrotaImg = 0;
        this.frameFimJogo = 0;

        // Carrega a imagem inicial do personagem
        this.definirSprite("-basic");

        // Orientação do personagem
        this.olhandoParaEsquerda = !ePlayer1;

        // Hurtbox - Caixa de colisão para tomar dano
        this.hurtbox = {
            x: this.x + 20,
            y: this.y + 10,
            largura: 55,
            altura: 180
        };

        // Hitbox - Caixa para causar dano
        this.hitbox = null;

        this.teclaPuloLiberada = true;
        this.podeAtacar = true;
        this.teclaJabLiberada = true;
        this.teclaChuteLiberada = true;

        // Tempo em milissegundos entre ataques
        this.tempoCooldownAtaque = 300;
        this.duracaoAtaque = 220;
        this.atacando = false;
        this.tipoAtaque = ""; // "jab" ou "chute"

        this.vidaMaxima = 100;
        this.vida = 100;

        this.energiaMaxima = 100;
        this.energia = 0;

        this.tomandoDano = false;
        this.tempoHitstun = 0;
    }

    draw(ctx) {
        if (this.imagem.complete && this.imagem.naturalWidth !== 0) {
            ctx.save(); // Salva o estado atual do Canvas

            // Captura a altura da imagem básica em pé como referência de escala
            if (this.alturaBaseSprite === 0 || this.imagem.src.includes("-basic")) {
                this.alturaBaseSprite = this.imagem.naturalHeight;
            }

            // Calcula a escala para que a imagem base tenha exatamente a alturaAlvo
            const escala = this.alturaAlvo / (this.alturaBaseSprite || this.imagem.naturalHeight);
            const larguraRender = this.imagem.naturalWidth * escala;
            const alturaRender = this.imagem.naturalHeight * escala;

            // Alinha a base da imagem exatamente na linha do chão (evita flutuar)
            const desenharY = (this.y + this.altura) - alturaRender;

            const precisaEspelhar = this.deveEspelharImagem();

            // Ajuste X para alinhar o corpo e evitar que o imagem vá para trás no ataque devido ao aumento do PNG
            let desenharX = this.x;
            const diferencaLargura = larguraRender - this.largura;

            if (diferencaLargura > 0) {
                if (this.olhandoParaEsquerda) {
                    desenharX -= diferencaLargura;
                }
            }

            if (precisaEspelhar) {
                ctx.translate(desenharX + larguraRender, desenharY);
                ctx.scale(-1, 1);
                ctx.drawImage(this.imagem, 0, 0, larguraRender, alturaRender);
            } else {
                ctx.drawImage(this.imagem, desenharX, desenharY, larguraRender, alturaRender);
            }

            ctx.restore(); // Restaura o Canvas ao estado original
        }

        /*
        *
        *
        // Desenha a Hurtbox por cima (para depuração)
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.hurtbox.x, this.hurtbox.y, this.hurtbox.largura, this.hurtbox.altura);

        // Desenha a Hitbox em AZUL (para depuração)
        if (this.hitbox) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.largura, this.hitbox.altura);
        }
        *
        *
        */
    }

    update(teclas, oponente, podeLutar) {

        // Se estiver em tomando dano impede novas ações
        if (this.tomandoDano) {
            this.velocidadeX = 0; // Não move enquanto apanha
            this.tempoHitstun--;
            if (this.tempoHitstun <= 0) {
                this.tomandoDano = false;
            } else {
                // Atualiza gravidade e posição caso apanhe no ar, depois interrompe
                this.aplicarGravidade(false);
                this.x += this.velocidadeX;
                this.y += this.velocidadeY;
                this.limitarTela(960);
                return;
            }
        }

        if (!teclas) return;

        // Atualiza a orientação com base na posição do oponente
        if (oponente) {
            this.olhandoParaEsquerda = this.x > oponente.x;
        }

        // Define as variáveis de controle
        let teclaDireita = false;
        let teclaEsquerda = false;
        let teclaCima = false;
        let teclaBaixo = false;
        let teclaJab = false;
        let teclaChute = false;
        let teclaPoder = false;

        // Só lê os comandos do teclado se puder lutar
        if (podeLutar) {
            teclaDireita    = this.ePlayer1 ? teclas.p1_direita : teclas.p2_direita;
            teclaEsquerda   = this.ePlayer1 ? teclas.p1_esquerda : teclas.p2_esquerda;
            teclaCima       = this.ePlayer1 ? teclas.p1_cima     : teclas.p2_cima;
            teclaBaixo      = this.ePlayer1 ? teclas.p1_baixo    : teclas.p2_baixo;
            teclaJab        = this.ePlayer1 ? teclas.p1_jab      : teclas.p2_jab;
            teclaChute      = this.ePlayer1 ? teclas.p1_chute    : teclas.p2_chute;
            teclaPoder      = this.ePlayer1 ? teclas.p1_power : teclas.p2_power;
        }

        // Libera as teclas de ataque depois do jogador soltá-las
        if (!teclaJab) {
            this.teclaJabLiberada = true;
        }
        if (!teclaChute) {
            this.teclaChuteLiberada = true;
        }

        // Se agachar trava o movimento horizontal e processa o agachamento
        if (teclaBaixo && this.estaNoChao) {
            this.velocidadeX = 0;
            this.agaixar();
        } 
        else {
            // Se soltou a tecla de baixo, reseta o contador de agachar
            this.contAgachar = 0;
            this.estadoAtual = "parado";

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
                this.teclaJabLiberada = false;
                this.jab();
            } 
            else if (teclaChute && this.teclaChuteLiberada) {
                this.teclaChuteLiberada = false;
                this.chute();
            }

            if (teclaPoder) {
                this.poder();
            }
        }

        // Aplica a física da gravidade
        this.aplicarGravidade(teclaCima);

        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        // Impede o personagem de sair da tela
        this.limitarTela(960);

        // Define a largura, altura e offsets da Hurtbox conforme o estado
        let larguraHurtbox = 70;
        let alturaHurtbox = 190;
        let offsetY = 5;
        let offsetX = 20;

        if (this.estadoAtual === "agachado") {
            larguraHurtbox = 85;
            alturaHurtbox = 130;
            offsetY = 70;
            offsetX = 8;
        }

        // Centraliza a Hurtbox no corpo
        let folgaX = (this.largura - larguraHurtbox) / 2;

        // Aplica o offsetX respeitando para onde o personagem está olhando
        folgaX += this.olhandoParaEsquerda ? -offsetX : offsetX;

        // Se estiver atacando, inclina levemente a Hurtbox na direção do golpe
        if (this.atacando) {
            folgaX += this.olhandoParaEsquerda ? -15 : 15;
        }

        // Aplica as coordenadas para simetria
        this.hurtbox.x = this.x + folgaX;
        this.hurtbox.y = this.y + offsetY;
        this.hurtbox.largura = larguraHurtbox;
        this.hurtbox.altura = alturaHurtbox;
    }

    // Retorna 'direita' se o nome estiver na lista de direita, senão 'esquerda'
    acharOrientacaoPersonagem(nome_personagem) {
        const olhaParaDireita = ORIENTACAO_PERSONAGEM.direita.includes(nome_personagem);
        return olhaParaDireita ? "direita" : "esquerda";
    }

    deveEspelharImagem() {
        const olhaParaDireita = !this.olhandoParaEsquerda;
        return (olhaParaDireita && this.orientacaoNativa === "esquerda") ||
               (!olhaParaDireita && this.orientacaoNativa === "direita");
    }

    parado() {
        this.contImg += 1;
        this.velocidadeX = 0;

        if (!this.estaNoChao || this.atacando) return;

        if (this.contImg % 40 == 0) {
            this.definirSprite("1");
        } else if (this.contImg % 40 == 12) {
            this.definirSprite("2");
        } else if (this.contImg % 40 == 25) {
            this.definirSprite("3");
        }
    }

    andarFrente() {
        this.contImg += 1;
        this.velocidadeX = 5;

        if (!this.estaNoChao || this.atacando) return;

        if (this.ePlayer1) {
            if (this.contImg % 20 == 0) {
                this.definirSprite("-basic");
            } else if (this.contImg % 20 == 10) {
                this.definirSprite("-front");
            }
        } else {
            if (this.contImg % 20 == 0) {
                this.definirSprite("-basic");
            } else if (this.contImg % 20 == 10) {
                this.definirSprite("-late");
            }
        }
    }

    andarTras() {
        this.contImg += 1;
        this.velocidadeX = -5;

        if (!this.estaNoChao || this.atacando) return;

        if (this.ePlayer1) {
            if (this.contImg % 20 == 0) {
                this.definirSprite("-basic");
            } else if (this.contImg % 20 == 10) {
                this.definirSprite("-late");
            }
        } else {
            if (this.contImg % 20 == 0) {
                this.definirSprite("-basic");
            } else if (this.contImg % 20 == 10) {
                this.definirSprite("-front");
            }
        }
    }

    jab() {
        if (!this.podeAtacar) return;

        this.podeAtacar = false;
        this.atacando = true;
        this.tipoAtaque = "jab";

        this.definirSprite("-jab1");

        const offsetX = this.olhandoParaEsquerda ? -120 : this.largura + 20;

        this.hitbox = {
            x: this.x + offsetX,
            y: this.y + 25,
            largura: 100,
            altura: 30,
            jaAcertou: false
        };

        setTimeout(() => {
            if (this.atacando) {
                this.definirSprite("-jab2");
            }
        }, this.duracaoAtaque / 10);

        setTimeout(() => {
            this.atacando = false; 
            this.tipoAtaque = "";
            this.hitbox = null;
        }, this.duracaoAtaque);

        setTimeout(() => {
            this.podeAtacar = true;
        }, this.duracaoAtaque + this.tempoCooldownAtaque);
    }

    chute() {
        if (!this.podeAtacar) return;

        this.podeAtacar = false;
        this.atacando = true;
        this.tipoAtaque = "chute";

        this.definirSprite("-short1");

        const offsetX = this.olhandoParaEsquerda ? -115 : this.largura + 45;

        this.hitbox = {
            x: this.x + offsetX,
            y: this.y + 140,
            largura: 75,
            altura: 32,
            jaAcertou: false
        };

        setTimeout(() => {
            if (this.atacando) {
                this.definirSprite("-short2");
            }
        }, this.duracaoAtaque / 3);

        setTimeout(() => {
            this.atacando = false; 
            this.tipoAtaque = "";
            this.hitbox = null;
        }, this.duracaoAtaque);

        setTimeout(() => {
            this.podeAtacar = true;
        }, this.duracaoAtaque + this.tempoCooldownAtaque);
    }

    agaixar() {
        if (this.atacando) return;

        this.estadoAtual = "agachado";
        this.contAgachar++;

        if (this.contAgachar <= 10) {
            this.definirSprite("-basic2");
        } else {
            this.definirSprite("-guard");
        }
    }

    pular() {
        if (this.estaNoChao && this.teclaPuloLiberada) {
            this.velocidadeY = this.forcaPulo;
            this.estaNoChao = false;
            this.teclaPuloLiberada = false;

            this.definirSprite("-jump-up");
        }
    }

    ganharEnergia(quantidade) {
        if (!Number.isFinite(quantidade) || quantidade <= 0) return;
        this.energia = Math.min(this.energiaMaxima, this.energia + quantidade);
        this.atualizarHudGlobal();
    }

    atualizarHudGlobal() {
        const mainInstance = window.main || main;
        if (mainInstance) {
            mainInstance.atualizarHUD();
        }
    }

    poder() {
        if (this.energia < 100 || !this.podeAtacar || this.atacando) return;

        this.podeAtacar = false;
        this.atacando = true;
        this.tipoAtaque = "poder";
        this.hitbox = null;

        this.definirSprite("-power1");
        this.atualizarHudGlobal();

        setTimeout(() => {
            if (this.atacando){
                this.definirSprite("-power2");
            }
        }, 100);

        setTimeout(() => {
            if (this.atacando){
                this.definirSprite("-power3");
            }
        }, 200);

        setTimeout(() => {
            if (this.atacando) {
                const direcao = this.olhandoParaEsquerda ? -1 : 1;
                const posX = this.olhandoParaEsquerda ? this.x - 140 : this.x + this.largura + 90;
                const posY = this.y + 40;
                const imgProjetil = assets.obter(`assets/personagem/${this.nome}/${this.nome}-power.png`) || assets.obter(`assets/personagem/${this.nome}/${this.nome}-power1.png`) || null;
                const precisaEspelhar = this.deveEspelharImagem();

                const mainInstance = window.main || main;
                if (mainInstance && mainInstance.projeteis) {
                    mainInstance.projeteis.push(new Projetil(posX, posY, this.ePlayer1, direcao, imgProjetil, precisaEspelhar));
                }

                this.energia = 0;
                this.atualizarHudGlobal();
            }
        }, 300);

        setTimeout(() => {
            this.atacando = false;
            this.tipoAtaque = "";
            this.podeAtacar = true;
        }, 520);
    }

    aplicarGravidade(teclaCima) {
        if (!this.estaNoChao) {
            this.velocidadeY += this.gravidade;

            if (!this.atacando) {
                if (this.velocidadeY < 0) {
                    this.definirSprite("-jump-up");
                } else {
                    this.definirSprite("-jump-down");
                }
            }
        }

        if (this.y + this.velocidadeY >= this.chao) {
            this.y = this.chao;
            this.velocidadeY = 0;
            this.estaNoChao = true;
        }

        if (!teclaCima) {
            this.teclaPuloLiberada = true;
        }
    }

    limitarTela(limiteCanvas) {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > limiteCanvas - this.largura) {
            this.x = limiteCanvas - this.largura;
        }
    }

    tomarDano(quantidade, tipoAtaque) {
        if (this.vida <= 0) return;

        this.atacando = false;
        this.hitbox = null;
        this.tipoAtaque = "";

        let danoFinal = quantidade;
        const estavaAgachado = this.estadoAtual === "agachado";

        if (estavaAgachado) {
            danoFinal = Math.floor(quantidade / 3);
            this.ganharEnergia(15);
        }

        this.vida = Math.max(0, this.vida - danoFinal);

        this.tomandoDano = true;
        this.tempoHitstun = 20;

        if (!estavaAgachado) {
            const sulfixoSprite = (tipoAtaque === "jab") ? "-punched-jab" : "-punched-short";
            this.definirSprite(sulfixoSprite);
        }
    }

    atualizarVitoriaDerrota() {
        // Se o personagem morreu ou venceu no ar, aplica a gravidade até encostar no chão
        if (!this.estaNoChao) {
            this.aplicarGravidade(false);
            this.y += this.velocidadeY;
            return; // Espera chegar ao chão antes de iniciar os quadros da animação
        }

        if (this.vida <= 0) {
            this.frameFimJogo++;

            if (this.frameFimJogo <= 20) {
                this.definirSprite("-defeat1");
            } else if (this.frameFimJogo <= 40) {
                this.definirSprite("-defeat2");
            } else {
                // Congela no defeat3 para sempre
                this.definirSprite("-defeat3");
            }
        } else {
            this.frameFimJogo++;

            if (this.frameFimJogo % 80 == 0) {
                this.definirSprite("-victory1");
            } else if (this.frameFimJogo % 80 == 40){
                this.definirSprite("-victory2");
            }
        }
    }

    resetarPersonagem(x, y, estaNaEsquerda) {
        this.x = x;
        this.y = y;
        this.vida = this.vidaMaxima;
        this.energia = 0;
        this.velocidadeX = 0;
        this.velocidadeY = 0;
        this.estaNoChao = true;
        this.frameFimJogo = 0;

        this.olhandoParaEsquerda = !estaNaEsquerda;

        // Restaura o sprite padrão parado
        this.definirSprite("1");
    }

    definirSprite(caminhoRelativo) {
        const urlCompleta = `assets/personagem/${this.nome}/${this.nome}${caminhoRelativo}.png`;
        const imgCache = assets.obter(urlCompleta);
        if (imgCache) {
            this.imagem = imgCache;
        }
    }
}