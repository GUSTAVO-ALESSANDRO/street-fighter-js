class SoundManager {
  constructor() {
    this.audioIniciado = false;

    // Música de fundo
    this.bgm = new Audio('assets/audio/musica-fundo.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.2;

    // Objetos de áudio pré-carregados
    this.sfx = {
      golpe: new Audio('assets/audio/golpe.wav'),
      acerto: new Audio('assets/audio/acerto.wav'),
      especial: new Audio('assets/audio/especial.wav'),
      fight: new Audio('assets/audio/fight.mp3'),
      ko: new Audio('assets/audio/ko.mp3')
    };

    // Escuta a PRIMEIRA interação do usuário para destravar o áudio no navegador
    const destravarAudio = () => {
      if (!this.audioIniciado) {
        this.audioIniciado = true;
        // Tenta tocar e pausar rapidamente para liberar as permissões
        this.bgm.play().then(() => {
          // Áudio desbloqueado com sucesso
        }).catch(() => {});
        
        window.removeEventListener('keydown', destravarAudio);
        window.removeEventListener('click', destravarAudio);
      }
    };

    window.addEventListener('keydown', destravarAudio);
    window.addEventListener('click', destravarAudio);
  }

  tocarMúsica() {
    this.bgm.play().catch(erro => {
      console.log("Aguardando interação do usuário para tocar a BGM:", erro);
    });
  }

  pausarMúsica() {
    this.bgm.pause();
  }

  tocarEfeito(audioObj, volume = 0.7, velocidade = 1.0) {
    if (!audioObj) return;
    
    // Clona o nó do áudio para permitir sobreposição de sons sem atraso
    const clone = audioObj.cloneNode();
    clone.volume = volume;
    clone.playbackRate = velocidade;
    clone.play().catch(erro => {
      console.log("Erro ao tocar SFX:", erro);
    });
  }

  tocarGolpe() {
    this.tocarEfeito(this.sfx.golpe, 0.05);
  }

  tocarAcerto() {
    this.tocarEfeito(this.sfx.acerto, 0.3);
  }

  tocarEspecial() {
    this.tocarEfeito(this.sfx.especial, 0.35);
  }

  tocarFigth() {
    this.tocarEfeito(this.sfx.fight, 0.35);
  }

  tocarKO() {
    this.tocarEfeito(this.sfx.ko, 0.5, 1.5);
  }
}

// Instância global
const sons = new SoundManager();