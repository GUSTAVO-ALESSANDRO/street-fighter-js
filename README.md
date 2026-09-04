# Street Fighter JS 🥊

Um jogo de luta 2D desenvolvido inteiramente com tecnologias web fundamentais (HTML5, CSS3 e JavaScript). O projeto oferece suporte a partidas locais entre dois jogadores (PvP) e contra a inteligência artificial (PvC), com sistema de seleção de personagens, escolha de cenários, placar de vitórias e HUD funcional.

## 🔗 Link da Aplicação
O jogo está publicado e pronto para jogar em:  
👉 **[https://gustavo-alessandro.github.io/street-fighter-js/](https://gustavo-alessandro.github.io/street-fighter-js/)**

---

## 🎯 Objetivo do Jogo
O objetivo principal é derrotar o oponente em um combate reduzindo sua barra de vida a zero antes que o tempo do temporizador esgoste.

---

## 📜 Regras do Jogo
- **Pontuação / Vitórias:** Cada rodada vencida incrementa o contador de vitórias do jogador no painel de estatísticas do menu.
- **Condição de Vitória:** O jogador vence a rodada ao zerar a vida do adversário.
- **Temporizador:** Caso o tempo acabe antes do fim da vida de um dos lutadores, vence aquele que tiver a maior porcentagem de vida restante.
- **Controles:**
  - **Jogador 1 (P1):**
    - `A` / `D`: Movimentação para Esquerda / Direita
    - `W`: Pulo
    - `S`: Agachar / Defesa
    - `F`: Jab (Soco)
    - `G`: Chute
  - **Jogador 2 (P2 / IA):**
    - `Seta Esquerda` / `Seta Direita`: Movimentação para Esquerda / Direita
    - `Seta para Cima`: Pulo
    - `Seta para Baixo`: Agachar / Defesa
    - `K`: Jab (Soco)
    - `L`: Chute

---

## 🛠️ Tecnologias Utilizadas
- **HTML5:** Estruturação da interface, formulários do menu e elemento Canvas 2D.
- **CSS3:** Estilização com variáveis, layouts dinâmicos em Flexbox/Grid, sombras e animações.
- **JavaScript (ES6+):** Programação orientada a objetos (POO) pura para física, detecção de colisões, animações em loop (`requestAnimationFrame`), máquina de estados da IA e lógica do jogo.

---

## 📄 Licença
Este projeto está sob a licença **MIT**. Para mais detalhes, consulte o arquivo [LICENSE](LICENSE) na raiz do repositório.

---

```json
{
  "nome": "Street Fighter Lite",
  "descricao": "Jogo de luta 2D em HTML5 Canvas e JS puro com modos PvP e PvC, escolha de personagens e cenários, HUD com barras de vida e placar de vitórias.",
  "autores": "Gustavo Sabino",
  "turma": "10A"
}
