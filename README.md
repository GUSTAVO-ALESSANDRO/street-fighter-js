# Street Fighter JS 🥊

Um jogo de luta 2D desenvolvido inteiramente com tecnologias web fundamentais (HTML5, CSS3 e JavaScript puro). O projeto oferece suporte a partidas locais entre dois jogadores (PvP) e contra a máquina (PvC), com sistema de seleção de personagens, mecânicas de ataque e defesa, escolha de cenários e placar de vitórias.

## 🔗 Link da Aplicação
O jogo está publicado e pronto para jogar através do GitHub Pages em:  
👉 **[https://gustavo-alessandro.github.io/street-fighter-js/](https://gustavo-alessandro.github.io/street-fighter-js/)**

---

## 🎯 Objetivo do Jogo
O objetivo principal é derrotar o oponente em um combate 2D, reduzindo sua barra de vida a zero antes que o tempo se esgote. As lutas ocorrem no formato **Melhor de 3 Rounds**, exigindo estratégia no uso de ataques, defesas e golpes especiais para conquistar a vitória final.

---

## 📜 Regras e Mecânicas
- **Condição de Vitória (Round):** Vence o round quem esgotar a barra de vida do adversário. Se o tempo (99 segundos) acabar, vence quem tiver a maior porcentagem de vida restante.
- **Condição de Vitória (Partida):** O jogador que vencer 2 rounds primeiro (ou vencer o 1º round e empatar outro) ganha a partida.
- **Placar Global:** Cada partida vencida incrementa o contador de vitórias do jogador (ou da máquina) no painel de estatísticas do menu principal.
- **Defesa:** Agachar-se (tecla para baixo) coloca o personagem em postura de defesa, reduzindo o dano recebido para apenas **1/3 do valor original**.
- **Barra de Energia e Especial:** Atacar ou defender com sucesso enche a barra de energia, que quando completa, o jogador pode disparar um projétil (golpe especial) que causa um dano maior no oponente caso acerte-o.

---

## 🎮 Controles

| Ação | Jogador 1 (P1) | Jogador 2 (P2 / IA) |
| :--- | :---: | :---: |
| **Pular** | `W` | `Seta para Cima (↑)` |
| **Mover Esquerda** | `A` | `Seta Esquerda (←)` |
| **Ajoelhar / Defender** | `S` | `Seta para Baixo (↓)` |
| **Mover Direita** | `D` | `Seta Direita (→)` |
| **Golpe (Jab)** | `F` | `K` |
| **Chute Baixo** | `G` | `L` |
| **Poder Especial** | `T` | `O` |

---

## 🛠️ Tecnologias Utilizadas
Para desenvolver o projeto, foi utilizado as segunites tecnologias:
- **HTML5:** Estruturação da interface, menus, telas de instrução e elementos para a renderização do jogo.
- **CSS3:** Estilização com variáveis, layouts, menus sobrepostos (modais) e interface de usuário (HUD) dinâmica.
- **JavaScript:** Programação orientada a objetos (POO) pura para física, detecção de colisões retangulares, animações em loop via `requestAnimationFrame`, sistema de estados da IA do bot e controle de fluxo do jogo (Rounds, Vitória/Derrota).

---

## 🎨 Créditos e Recursos
Os recursos visuais e sonoros foram obtidos a partir de bibliotecas e comunidades de preservação de jogos:

- **Sprites e Animações:** Retirados de *Street Fighter Alpha 3 (Arcade)* via [The Spriters Resource](https://www.spriters-resource.com/arcade/streetfighteralpha3/).
- **Efeitos Sonoros (SFX):** Obtidos via [Mixkit](https://mixkit.co/free-sound-effects/) e [Pixabay](https://pixabay.com/sound-effects/).
- **Trilha Sonora (BGM):** Música obtida via [Incompetech](https://incompetech.com/music/royalty-free/music.html).

---

## 📦 Instruções de Instalação (Uso Local)
Como é um projeto web puro, não há necessidade de instalação de dependências ou build.
1. Clone o repositório: `git clone https://github.com/gustavo-alessandro/street-fighter-js`
2. Abra a pasta do projeto.
3. Execute o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge).

---

## 📄 Licença
Este projeto está sob a licença **MIT**. Para mais detalhes, consulte o arquivo [LICENSE](LICENSE) na raiz do repositório.

---

```json
{ 
  "nome": "Street Fighter JS", 
  "descricao": "Jogo de luta 2D inspirado no clássico Street Fighter, mas com funcionalidades reduzidas. O jogo conta com movimentação, pulos, defesa e ataque, além de conter modos Player vs Player e Player vs Máquina, o objetivo é vencer 2 rounds zerando a vida do rival.", 
  "autores": "Gustavo Alessandro", 
  "turma": "14B"
}