# PlayStation 2 OS — Portfólio Interativo 3D

Portfólio interativo inspirado na estética clássica do **BIOS / System Configuration** e da tela de **Memory Card (`Browser`)** do **PlayStation 2**, desenvolvido com **Three.js**, **JavaScript ES6+**, **CSS3** e **Web Audio API**.

O projeto adapta os elementos icônicos do console para apresentar projetos, habilidades técnicas, experiência profissional e currículo de **Israel Ueda Massatoshi** de forma nostálgica, responsiva e sem necessidade de etapa de build.

---

## Visão Geral e Mapeamento do Menu

| Seção do PS2 | Função no Portfólio |
| :--- | :--- |
| **Browser (`Memory Card (PS2) / 1`)** | **Projetos em Destaque** renderizados como ícones 3D sólidos flutuantes em **Three.js**, iluminados pelo cursor de orbe branco luminoso. Ao selecionar um projeto, é possível inspecionar o modelo 3D (com rotação por arraste) e acessar detalhes, tecnologias e links do GitHub/Demo. |
| **System Configuration** | **Sobre Mim & Configurações do Sistema**, dividido em: **Language** (habilidades de Suporte de TI, Infraestrutura e Back-End), **Clock Adjustment** (relógio ao vivo + experiência e trajetória), **Screen Size** (informações técnicas + controles reais de Scanlines CRT, moldura 4:3 e brilho 3D) e **Audio & Network** (contato, redes e volume do sintetizador). |
| **Version Information (`△`)** | **Currículo / CV** no estilo BIOS/OSD com resumo profissional, formação acadêmica, cursos complementares, idiomas, cópia rápida de e-mail e botão para **Imprimir / Salvar Currículo em PDF**. |

---

## Principais Recursos

- **Cena 3D Interativa com Three.js (`js/scene.js`)**:
  - **Tela Inicial (BIOS)**: fundo escuro profundo com torres cristalinas flutuantes e o clássico anel de **7 orbes luminosos** em órbita.
  - **Memory Card (`Browser`)**: transição para o gradiente metálico cinza-oliva clássico do PS2 com **8 ícones 3D modelados proceduralmente** (disquete, bloco vermelho, cubo texturizado, anel/microfone, capacete, cartucho, disco e bloco voxel), raycasting para hover/clique e o **orbe de luz branca** como cursor dinâmico.
  - **Modo de Inspeção 3D**: foco de câmera no projeto escolhido com rotação livre via arraste do mouse.
- **Áudio Procedural com Web Audio API (`js/audio.js`)**:
  - Sintetiza em tempo real a ambiência sonora inspirada no console e os efeitos de boot, navegação, hover, confirmação (`✕`) e retorno (`○`), sem depender de arquivos MP3 externos.
- **Ajustes Visuais Retrô em Tempo Real**:
  - Ativação/desativação de **Scanlines CRT**, alternância entre **16:9** e moldura clássica **4:3**, e controle de brilho do orbe cursor.
- **Exportação de Currículo em PDF**:
  - Folha de estilo `@media print` dedicada que gera uma versão limpa e estruturada do currículo ao acionar a impressão em **Version Information**.

---

## Tecnologias Utilizadas

- **Three.js** (WebGL 3D via ES Modules / Import Map)
- **JavaScript (ES6+)**
- **HTML5 & CSS3**
- **Web Audio API**

---

## Estrutura do Projeto

```text
curriculo_ps2/
├── index.html      # Estrutura das telas OSD (Boot, Home, Browser, System Config, Version)
├── styles.css      # Estética PS2 (gradientes BIOS/Memory Card, tipografia com contorno, CRT e print)
├── js/
│   ├── main.js     # Controlador de estado, navegação por teclado/mouse e renderização dinâmica
│   ├── scene.js    # Motor 3D Three.js (torres, 7 orbes, ícones 3D do Memory Card e raycasting)
│   ├── gamepad.js  # Suporte nativo a controles físicos via Gamepad API (USB / Bluetooth)
│   ├── audio.js    # Sintetizador procedural Web Audio API
│   └── data.js     # Dados centralizados (perfil, projetos, habilidades, experiência e currículo)
└── README.md
```

---

## Controles

| Ação | Teclado | Controle (Gamepad API) | Mouse / Toque |
| :--- | :--- | :--- | :--- |
| Navegar no menu / grade 3D | `↑` `↓` `←` `→` ou `W` `A` `S` `D` | D-Pad ou Analógico Esquerdo | Mover ponteiro / setas laterais |
| Confirmar / Inspecionar bloco (`✕`) | `Enter` | `✕` (PS) / `A` (Xbox) / `Start` | Clique no item / bloco 3D |
| Voltar (`○`) | `Esc` ou `Backspace` | `○` (PS) / `B` (Xbox) | Botão `○ Back` no rodapé |
| Version Information / Currículo (`△`) | `T` | `△` (PS) / `Y` (Xbox) | Botão `△ Options / Version` |
| Ativar / Silenciar Áudio (`□`) | `M` | `□` (PS) / `X` (Xbox) | Botão `□ Sound` no canto inferior direito |
| Trocar projeto / aba rapidamente | `←` `→` | `L1` / `R1` (ou `LB` / `RB`) | Setas / clique |
| Girar ícone 3D (modo inspeção) | — | Analógico Direito | Clicar e arrastar sobre o modelo 3D |

---

## Como Executar Localmente

Como o projeto utiliza **ES Modules**, basta servi-lo com qualquer servidor HTTP estático na raiz do repositório:

### Usando Python
```bash
python -m http.server 4173
```

### Usando Node.js (`npx`)
```bash
npx serve . -l 4173
```

Depois, abra no navegador:
```text
http://localhost:4173
```

---

## Como Personalizar

Todas as informações do portfólio estão concentradas em [`js/data.js`](js/data.js). Para editar projetos, links, habilidades, experiência ou formação, basta alterar os objetos exportados (`PROFILE`, `PROJECTS`, `SKILLS`, `EXPERIENCE`, `DESIGN_SPECS` e `VERSION_INFO`).

---

## Autor

**Israel Ueda Massatoshi** — Profissional de Suporte de TI / Desenvolvedor Júnior  
- **GitHub:** [github.com/IsraelUeda](https://github.com/IsraelUeda)
- **LinkedIn:** [linkedin.com/in/israel-massatoshi](https://www.linkedin.com/in/israel-massatoshi/)
- **E-mail:** israelueda@gmail.com
