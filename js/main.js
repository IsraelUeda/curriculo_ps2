import {
  PROFILE,
  PROJECTS,
  SKILLS,
  EXPERIENCE,
  DESIGN_SPECS,
  VERSION_INFO,
} from './data.js';
import { PS2Audio } from './audio.js';
import { PS2Scene } from './scene.js';
import { PS2Gamepad } from './gamepad.js';

/**
 * Controlador principal do PS2 OS Portfolio
 * Sincroniza a cena 3D Three.js, os fundos autênticos (BIOS vs Memory Card),
 * o sintetizador Web Audio e a navegação por teclado/mouse.
 */
class PS2PortfolioApp {
  constructor() {
    this.audio = new PS2Audio();
    this.currentScreen = 'boot'; // 'boot' | 'home' | 'browser' | 'system' | 'version'
    this.isInspecting = false;

    this.homeIndex = 0;
    this.selectedProjectIndex = 0;
    this.activeSystemTab = 'language';

    this.settings = {
      crt: true,
      glow: 1.0,
      aspect43: false,
    };

    this._cacheDOM();
    this._populateStaticContent();
    this._initScene();
    this._initGamepad();
    this._bindUIEvents();
    this._bindKeyboard();
    this._startClock();
    this._updateHUD();
  }

  _cacheDOM() {
    this.canvas = document.getElementById('ps2-canvas');
    this.screens = {
      boot: document.getElementById('screen-boot'),
      home: document.getElementById('screen-home'),
      browser: document.getElementById('screen-browser'),
      system: document.getElementById('screen-system'),
      version: document.getElementById('screen-version'),
    };

    this.menuItems = Array.from(document.querySelectorAll('.menu-item'));
    this.sysTabs = Array.from(document.querySelectorAll('.sys-tab'));
    this.systemContent = document.getElementById('system-content');
    this.versionBody = document.getElementById('version-body');

    // Memory Card OSD Header (topo esquerdo + topo direito amarelo)
    this.mcFreeSpace = document.getElementById('mc-free-space');
    this.previewTitle = document.getElementById('preview-title');
    this.previewSubtitle = document.getElementById('preview-subtitle');
    this.previewMeta = document.getElementById('preview-meta');
    this.mcQuickArrows = document.getElementById('mc-quick-arrows');

    // Painel de inspeção do Save
    this.inspectPanel = document.getElementById('project-inspect');
    this.inspectDragHint = document.getElementById('inspect-drag-hint');
    this.inspectCategory = document.getElementById('inspect-category');
    this.inspectSize = document.getElementById('inspect-size');
    this.inspectTitle = document.getElementById('inspect-title');
    this.inspectSubtitle = document.getElementById('inspect-subtitle');
    this.inspectDesc = document.getElementById('inspect-desc');
    this.inspectHighlights = document.getElementById('inspect-highlights');
    this.inspectTech = document.getElementById('inspect-tech');
    this.inspectDemoLink = document.getElementById('inspect-demo-link');
    this.inspectRepoLink = document.getElementById('inspect-repo-link');

    // Rodapé & Clocks
    this.liveClockHome = document.getElementById('live-clock-home');
    this.hudConfirm = document.getElementById('hud-confirm');
    this.hudConfirmLabel = document.getElementById('hud-confirm-label');
    this.hudBack = document.getElementById('hud-back');
    this.hudBackLabel = document.getElementById('hud-back-label');
    this.hudVersion = document.getElementById('hud-version');
    this.hudVersionLabel = document.getElementById('hud-version-label');
    this.hudAudio = document.getElementById('hud-audio');
    this.hudAudioLabel = document.getElementById('hud-audio-label');
    this.toastEl = document.getElementById('ps2-toast');
    this.printResume = document.getElementById('print-resume');
  }

  _populateStaticContent() {
    document.getElementById('boot-profile-line').textContent =
      `${PROFILE.name} — ${PROFILE.role}`;
    document.getElementById('home-handle').textContent = PROFILE.handle;
    document.getElementById('home-name').textContent = PROFILE.name;
    document.getElementById('home-role').textContent = PROFILE.role;

    // Espaço livre no Memory Card de 8 MB (8192 KB)
    const totalKB = 8192;
    const usedKB = PROJECTS.reduce((acc, p) => acc + (p.sizeKB || 256), 0);
    const freeKB = Math.max(0, totalKB - usedKB);
    this.mcFreeSpace.textContent = `${freeKB.toLocaleString('en-US')} KB Free`;

    this._renderBrowserHeader();
    this._renderSystemTab(this.activeSystemTab);
    this._renderVersionInfo();
    this._renderPrintResume();
  }

  _initScene() {
    this.scene3D = new PS2Scene(this.canvas, PROJECTS, {
      onBlockHover: (idx) => {
        if (this.currentScreen !== 'browser' || this.isInspecting) return;
        if (idx !== this.selectedProjectIndex) {
          this.selectedProjectIndex = idx;
          this.scene3D.setSelectedProject(idx);
          this._renderBrowserHeader();
          this.audio.playHoverBlock();
        }
      },
      onBlockClick: (idx) => {
        if (this.currentScreen !== 'browser' || this.isInspecting) return;
        if (idx === this.selectedProjectIndex) {
          this.openProjectInspect();
        } else {
          this.selectedProjectIndex = idx;
          this.scene3D.setSelectedProject(idx);
          this._renderBrowserHeader();
          this.audio.playMove();
        }
      },
    });
  }

  _initGamepad() {
    this.gamepad = new PS2Gamepad({
      onConnect: (name) => {
        this.showToast(`Controle conectado: ${name}`);
      },
      onDisconnect: () => {
        this.showToast('Controle desconectado');
      },
      onConfirm: () => {
        this._handleConfirmAction();
      },
      onBack: () => {
        this._handleBackAction();
      },
      onVersion: () => {
        if (this.currentScreen === 'boot') {
          this.bootSystem();
          return;
        }
        if (this.currentScreen === 'version') {
          this.audio.playBack();
          this.navigateTo('home');
        } else {
          this.closeProjectInspect(true);
          this.audio.playConfirm();
          this.navigateTo('version');
        }
      },
      onToggleAudio: () => {
        const muted = this.audio.toggleMute();
        this._updateAudioLabel(muted);
        this.showToast(muted ? 'Sound: OFF' : 'Sound: ON');
      },
      onPrev: () => {
        if (this.currentScreen === 'browser') {
          this.moveBrowserSelection(-1);
          if (this.isInspecting) this._populateInspectPanel();
        } else if (this.currentScreen === 'system') {
          this._switchSystemTabByDelta(-1);
        }
      },
      onNext: () => {
        if (this.currentScreen === 'browser') {
          this.moveBrowserSelection(1);
          if (this.isInspecting) this._populateInspectPanel();
        } else if (this.currentScreen === 'system') {
          this._switchSystemTabByDelta(1);
        }
      },
      onDirection: (dir) => {
        if (this.currentScreen === 'home') {
          if (dir === 'down') {
            this.setHomeIndex((this.homeIndex + 1) % this.menuItems.length);
            this.audio.playMove();
          } else if (dir === 'up') {
            this.setHomeIndex(
              (this.homeIndex - 1 + this.menuItems.length) % this.menuItems.length
            );
            this.audio.playMove();
          }
          return;
        }

        if (this.currentScreen === 'browser') {
          if (this.isInspecting) {
            if (dir === 'right') {
              this.moveBrowserSelection(1);
              this._populateInspectPanel();
            } else if (dir === 'left') {
              this.moveBrowserSelection(-1);
              this._populateInspectPanel();
            }
            return;
          }

          const cols = this.scene3D.getGridCols();
          if (dir === 'right') this.moveBrowserSelection(1);
          else if (dir === 'left') this.moveBrowserSelection(-1);
          else if (dir === 'down') this.moveBrowserSelection(cols);
          else if (dir === 'up') this.moveBrowserSelection(-cols);
          return;
        }

        if (this.currentScreen === 'system') {
          if (dir === 'down' || dir === 'right') this._switchSystemTabByDelta(1);
          else if (dir === 'up' || dir === 'left') this._switchSystemTabByDelta(-1);
        }
      },
      onRightStick: (rx, ry) => {
        if (this.currentScreen === 'browser' && this.isInspecting) {
          this.scene3D.rotateInspect(rx * 0.055, ry * 0.04);
        } else if (this.currentScreen === 'system' && this.systemContent) {
          this.systemContent.scrollTop += ry * 12;
        } else if (this.currentScreen === 'version' && this.versionBody) {
          this.versionBody.scrollTop += ry * 12;
        }
      },
    });
  }

  _switchSystemTabByDelta(delta) {
    const order = ['language', 'datetime', 'display', 'network'];
    const idx = order.indexOf(this.activeSystemTab);
    const next = order[(idx + delta + order.length) % order.length];
    this.activeSystemTab = next;
    this.audio.playMove();
    this._renderSystemTab(next);
  }

  _bindUIEvents() {
    document.getElementById('btn-boot-start').addEventListener('click', () => {
      this.bootSystem();
    });

    this.menuItems.forEach((btn, idx) => {
      btn.addEventListener('mouseenter', () => {
        if (this.currentScreen !== 'home') return;
        if (this.homeIndex !== idx) {
          this.setHomeIndex(idx);
          this.audio.playMove();
        }
      });

      btn.addEventListener('click', () => {
        this.setHomeIndex(idx);
        this.audio.playConfirm();
        this.navigateTo(btn.dataset.target);
      });
    });

    document.getElementById('btn-prev-block').addEventListener('click', () => {
      this.moveBrowserSelection(-1);
    });

    document.getElementById('btn-next-block').addEventListener('click', () => {
      this.moveBrowserSelection(1);
    });

    document.getElementById('btn-close-inspect').addEventListener('click', () => {
      this.closeProjectInspect();
    });

    this.sysTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        if (key === this.activeSystemTab) return;
        this.activeSystemTab = key;
        this.audio.playMove();
        this._renderSystemTab(key);
      });
    });

    document.querySelectorAll('[data-action="go-home"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.playBack();
        this.navigateTo('home');
      });
    });

    document.getElementById('btn-print-cv').addEventListener('click', () => {
      this.audio.playConfirm();
      window.print();
    });

    document.getElementById('btn-copy-email-cv').addEventListener('click', () => {
      this.copyText(PROFILE.email, `E-mail copiado: ${PROFILE.email}`);
    });

    // Prompts centrais (✕ Enter / ○ Back / △ Options)
    this.hudConfirm.addEventListener('click', () => this._handleConfirmAction());
    this.hudBack.addEventListener('click', () => this._handleBackAction());
    this.hudVersion.addEventListener('click', () => {
      if (this.currentScreen === 'boot') {
        this.bootSystem();
      }
      if (this.currentScreen === 'version') {
        this.audio.playBack();
        this.navigateTo('home');
      } else {
        this.closeProjectInspect(true);
        this.audio.playConfirm();
        this.navigateTo('version');
      }
    });

    this.hudAudio.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      this._updateAudioLabel(muted);
      this.showToast(muted ? 'Sound: OFF' : 'Sound: ON');
    });
  }

  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'm') {
        const muted = this.audio.toggleMute();
        this._updateAudioLabel(muted);
        this.showToast(muted ? 'Sound: OFF' : 'Sound: ON');
        return;
      }

      if (this.currentScreen === 'boot') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.bootSystem();
        }
        return;
      }

      if (e.key.toLowerCase() === 't') {
        if (this.currentScreen === 'version') {
          this.audio.playBack();
          this.navigateTo('home');
        } else {
          this.closeProjectInspect(true);
          this.audio.playConfirm();
          this.navigateTo('version');
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (e.target.tagName === 'INPUT') return;
        e.preventDefault();
        this._handleBackAction();
        return;
      }

      if (this.currentScreen === 'home') {
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.setHomeIndex((this.homeIndex + 1) % this.menuItems.length);
          this.audio.playMove();
        } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          e.preventDefault();
          this.setHomeIndex(
            (this.homeIndex - 1 + this.menuItems.length) % this.menuItems.length
          );
          this.audio.playMove();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this._handleConfirmAction();
        }
        return;
      }

      if (this.currentScreen === 'browser') {
        if (this.isInspecting) {
          if (e.key === 'ArrowRight') {
            this.moveBrowserSelection(1);
            this._populateInspectPanel();
          } else if (e.key === 'ArrowLeft') {
            this.moveBrowserSelection(-1);
            this._populateInspectPanel();
          }
          return;
        }

        const cols = this.scene3D.getGridCols();
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          e.preventDefault();
          this.moveBrowserSelection(1);
        } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          e.preventDefault();
          this.moveBrowserSelection(-1);
        } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.moveBrowserSelection(cols);
        } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          e.preventDefault();
          this.moveBrowserSelection(-cols);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.openProjectInspect();
        }
        return;
      }

      if (this.currentScreen === 'system') {
        const order = ['language', 'datetime', 'display', 'network'];
        const idx = order.indexOf(this.activeSystemTab);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = order[(idx + 1) % order.length];
          this.activeSystemTab = next;
          this.audio.playMove();
          this._renderSystemTab(next);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = order[(idx - 1 + order.length) % order.length];
          this.activeSystemTab = prev;
          this.audio.playMove();
          this._renderSystemTab(prev);
        }
      }
    });
  }

  bootSystem() {
    if (this.currentScreen !== 'boot') return;
    this.audio.playBoot();
    this.navigateTo('home');
  }

  setHomeIndex(idx) {
    this.homeIndex = idx;
    this.menuItems.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  }

  navigateTo(screenName) {
    this.currentScreen = screenName;

    Object.entries(this.screens).forEach(([key, el]) => {
      el.classList.toggle('active', key === screenName);
    });

    // Alterna fundo autêntico: cinza-oliva metálico no Memory Card, preto/azul no BIOS
    const isMC = screenName === 'browser';
    document.body.classList.toggle('mode-memorycard', isMC);
    document.body.classList.toggle('mode-bios', !isMC);

    if (!isMC) {
      this.closeProjectInspect(true);
    }

    this.scene3D.setMode(screenName);
    if (isMC) {
      this.scene3D.setSelectedProject(this.selectedProjectIndex);
      this._renderBrowserHeader();
    }

    this._updateHUD();
  }

  moveBrowserSelection(delta) {
    const len = PROJECTS.length;
    const next = (this.selectedProjectIndex + delta + len) % len;
    this.selectedProjectIndex = next;
    this.scene3D.setSelectedProject(next);
    this._renderBrowserHeader();
    this.audio.playMove();
  }

  openProjectInspect() {
    if (this.isInspecting) return;
    this.isInspecting = true;
    this._populateInspectPanel();
    this.inspectPanel.hidden = false;
    this.inspectDragHint.hidden = false;
    document.body.classList.add('mode-inspecting');
    this.mcQuickArrows.classList.add('hidden-arrows');
    this.scene3D.setMode('inspect');
    this.audio.playConfirm();
    this._updateHUD();
  }

  closeProjectInspect(silent = false) {
    if (!this.isInspecting) return;
    this.isInspecting = false;
    this.inspectPanel.hidden = true;
    this.inspectDragHint.hidden = true;
    document.body.classList.remove('mode-inspecting');
    this.mcQuickArrows.classList.remove('hidden-arrows');
    if (this.currentScreen === 'browser') {
      this.scene3D.setMode('browser');
    }
    if (!silent) {
      this.audio.playBack();
    }
    this._updateHUD();
  }

  _handleConfirmAction() {
    if (this.currentScreen === 'boot') {
      this.bootSystem();
    } else if (this.currentScreen === 'home') {
      const target = this.menuItems[this.homeIndex]?.dataset.target || 'browser';
      this.audio.playConfirm();
      this.navigateTo(target);
    } else if (this.currentScreen === 'browser' && !this.isInspecting) {
      this.openProjectInspect();
    }
  }

  _handleBackAction() {
    if (this.currentScreen === 'browser' && this.isInspecting) {
      this.closeProjectInspect();
    } else if (this.currentScreen !== 'home' && this.currentScreen !== 'boot') {
      this.audio.playBack();
      this.navigateTo('home');
    }
  }

  /** Atualiza o topo direito amarelo clássico do Memory Card (fiel à imagem!) */
  _renderBrowserHeader() {
    const project = PROJECTS[this.selectedProjectIndex];
    if (!project) return;

    this.previewTitle.textContent = project.title;
    this.previewSubtitle.textContent = project.subtitle;
    this.previewMeta.textContent = `${project.sizeKB} KB • ${project.date}`;
  }

  _populateInspectPanel() {
    const project = PROJECTS[this.selectedProjectIndex];
    if (!project) return;

    this.inspectCategory.textContent = project.category;
    this.inspectSize.textContent = `${project.sizeKB} KB • ${project.date}`;
    this.inspectTitle.textContent = project.title;
    this.inspectSubtitle.textContent = project.subtitle;
    this.inspectDesc.textContent = project.details;

    this.inspectHighlights.innerHTML = project.highlights
      .map((item) => `<li>${item}</li>`)
      .join('');

    this.inspectTech.innerHTML = project.tech
      .map((t) => `<span class="tech-pill">${t}</span>`)
      .join('');

    if (project.demoUrl) {
      this.inspectDemoLink.href = project.demoUrl;
      this.inspectDemoLink.style.display = 'inline-flex';
    } else {
      this.inspectDemoLink.style.display = 'none';
    }
    this.inspectRepoLink.href = project.repoUrl;
  }

  _renderSystemTab(tabKey) {
    this.sysTabs.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    if (tabKey === 'language') {
      const groupsHTML = SKILLS.map(
        (group) => `
          <div class="skill-group">
            <div class="skill-group-title">${group.group}</div>
            ${group.items
            .map(
              (sk) => `
              <div class="skill-row">
                <div class="skill-row-head">
                  <span>${sk.name}</span>
                  <span class="skill-tag">${sk.tag} • ${sk.level}%</span>
                </div>
                <div class="skill-bar">
                  <div class="skill-fill" style="width:${sk.level}%"></div>
                </div>
              </div>
            `
            )
            .join('')}
          </div>
        `
      ).join('');

      this.systemContent.innerHTML = `
        <h3 class="sys-section-title">Sobre Mim &amp; Linguagens</h3>
        <p class="sys-bio">${PROFILE.bio}</p>
        ${groupsHTML}
      `;
      return;
    }

    if (tabKey === 'datetime') {
      const timelineHTML = EXPERIENCE.map(
        (exp) => `
          <article class="timeline-card">
            <div class="timeline-period">${exp.period}</div>
            <div class="timeline-role">${exp.role}</div>
            <div class="timeline-company">${exp.company}</div>
            <p class="timeline-desc">${exp.description}</p>
          </article>
        `
      ).join('');

      this.systemContent.innerHTML = `
        <h3 class="sys-section-title">Relógio do Sistema &amp; Experiência</h3>
        <div class="ps2-big-clock" id="sys-live-clock">${this._formatPS2Clock()}</div>
        <div class="timeline-list">${timelineHTML}</div>
      `;
      return;
    }

    if (tabKey === 'display') {
      const specsHTML = DESIGN_SPECS.map(
        (item) => `
          <div class="timeline-card">
            <div class="timeline-role">${item.label}</div>
            <p class="timeline-desc">${item.value}</p>
          </div>
        `
      ).join('');

      this.systemContent.innerHTML = `
        <h3 class="sys-section-title">Tela, Design &amp; Moldura CRT</h3>
        <div class="timeline-list">${specsHTML}</div>

        <div class="config-controls">
          <div class="config-row">
            <div>
              <div class="config-row-label">Scanlines TV CRT</div>
              <div class="config-row-sub">Textura sutil de monitor de tubo dos anos 2000</div>
            </div>
            <div class="toggle-group">
              <button class="toggle-chip ${this.settings.crt ? 'active' : ''}" data-crt="on" type="button">ON</button>
              <button class="toggle-chip ${!this.settings.crt ? 'active' : ''}" data-crt="off" type="button">OFF</button>
            </div>
          </div>

          <div class="config-row">
            <div>
              <div class="config-row-label">Screen Size</div>
              <div class="config-row-sub">Alterna entre 16:9 Full e moldura clássica 4:3</div>
            </div>
            <div class="toggle-group">
              <button class="toggle-chip ${!this.settings.aspect43 ? 'active' : ''}" data-aspect="169" type="button">16:9</button>
              <button class="toggle-chip ${this.settings.aspect43 ? 'active' : ''}" data-aspect="43" type="button">4:3</button>
            </div>
          </div>

          <div class="config-row">
            <div>
              <div class="config-row-label">Brilho do Orbe Cursor</div>
              <div class="config-row-sub">Ajusta a intensidade luminosa da cena 3D</div>
            </div>
            <div class="toggle-group">
              <button class="toggle-chip ${this.settings.glow === 0.7 ? 'active' : ''}" data-glow="0.7" type="button">SUAVE</button>
              <button class="toggle-chip ${this.settings.glow === 1.0 ? 'active' : ''}" data-glow="1.0" type="button">PADRÃO</button>
              <button class="toggle-chip ${this.settings.glow === 1.35 ? 'active' : ''}" data-glow="1.35" type="button">FORTE</button>
            </div>
          </div>
        </div>
      `;

      this.systemContent.querySelectorAll('[data-crt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.settings.crt = btn.dataset.crt === 'on';
          document.body.classList.toggle('crt-enabled', this.settings.crt);
          this.audio.playConfirm();
          this._renderSystemTab('display');
        });
      });

      this.systemContent.querySelectorAll('[data-aspect]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.settings.aspect43 = btn.dataset.aspect === '43';
          document.body.classList.toggle('aspect-43', this.settings.aspect43);
          this.audio.playConfirm();
          this._renderSystemTab('display');
        });
      });

      this.systemContent.querySelectorAll('[data-glow]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.settings.glow = parseFloat(btn.dataset.glow);
          this.scene3D.setGlowIntensity(this.settings.glow);
          this.audio.playConfirm();
          this._renderSystemTab('display');
        });
      });
      return;
    }

    if (tabKey === 'network') {
      this.systemContent.innerHTML = `
        <h3 class="sys-section-title">Contato, Redes &amp; Áudio PS2</h3>
        <div class="contact-links-grid">
          <button class="contact-card" id="sys-copy-email" type="button">
            <span class="contact-card-label">E-mail (copiar)</span>
            <span class="contact-card-val">${PROFILE.email}</span>
          </button>

          <button class="contact-card" id="sys-copy-phone" type="button">
            <span class="contact-card-label">Telefone / WhatsApp (copiar)</span>
            <span class="contact-card-val">${PROFILE.phone}</span>
          </button>

          <a class="contact-card" href="${PROFILE.github}" target="_blank" rel="noopener noreferrer">
            <span class="contact-card-label">GitHub</span>
            <span class="contact-card-val">${PROFILE.github.replace('https://', '')}</span>
          </a>

          <a class="contact-card" href="${PROFILE.linkedin}" target="_blank" rel="noopener noreferrer">
            <span class="contact-card-label">LinkedIn</span>
            <span class="contact-card-val">${PROFILE.linkedin.replace('https://', '')}</span>
          </a>
        </div>

        <div class="config-controls">
          <div class="config-row">
            <div>
              <div class="config-row-label">Áudio Web Audio API</div>
              <div class="config-row-sub">Ambiência sonora + cliques de menu do PS2</div>
            </div>
            <div class="toggle-group">
              <button class="toggle-chip ${!this.audio.isMuted ? 'active' : ''}" data-audio-toggle="on" type="button">ON</button>
              <button class="toggle-chip ${this.audio.isMuted ? 'active' : ''}" data-audio-toggle="off" type="button">OFF</button>
            </div>
          </div>

          <div class="config-row">
            <div>
              <div class="config-row-label">Volume</div>
              <div class="config-row-sub">Nível geral do sintetizador</div>
            </div>
            <input
              id="audio-volume-slider"
              class="ps2-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value="${this.audio.volume}"
              aria-label="Volume geral"
            />
          </div>
        </div>
      `;

      document.getElementById('sys-copy-email').addEventListener('click', () => {
        this.copyText(PROFILE.email, `E-mail copiado: ${PROFILE.email}`);
      });

      document.getElementById('sys-copy-phone').addEventListener('click', () => {
        this.copyText(PROFILE.phone, `Telefone copiado: ${PROFILE.phone}`);
      });

      this.systemContent.querySelectorAll('[data-audio-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const wantMute = btn.dataset.audioToggle === 'off';
          if (wantMute !== this.audio.isMuted) {
            this.audio.toggleMute();
          }
          this._updateAudioLabel(this.audio.isMuted);
          this._renderSystemTab('network');
        });
      });

      document.getElementById('audio-volume-slider').addEventListener('input', (e) => {
        this.audio.setVolume(parseFloat(e.target.value));
      });
    }
  }

  _renderVersionInfo() {
    const specsRows = VERSION_INFO.specs
      .map(
        (s) => `
          <div class="spec-key">${s.label}</div>
          <div class="spec-val">${s.value}</div>
        `
      )
      .join('');

    const eduItems = VERSION_INFO.education
      .map(
        (e) => `
          <li>
            <strong>${e.title}</strong>
            <span class="version-edu-place">${e.place}</span>
          </li>
        `
      )
      .join('');

    const certItems = VERSION_INFO.certifications
      .map((c) => `<li>${c}</li>`)
      .join('');

    this.versionBody.innerHTML = `
      <div class="version-spec-table">${specsRows}</div>
      <div class="ps2-thin-rule"></div>
      <p class="sys-bio">${PROFILE.bio}</p>
      <div class="version-columns">
        <div class="version-block">
          <h3>Formação</h3>
          <ul class="version-list">${eduItems}</ul>
        </div>
        <div class="version-block">
          <h3>Certificações</h3>
          <ul class="version-list">${certItems}</ul>
        </div>
      </div>
    `;
  }

  _renderPrintResume() {
    const expHTML = EXPERIENCE.map(
      (e) =>
        `<p><strong>${e.role}</strong> — ${e.company} (${e.period})<br/>${e.description}</p>`
    ).join('');

    const projHTML = PROJECTS.slice(0, 5)
      .map(
        (p) =>
          `<li><strong>${p.title}</strong> (${p.tech.join(', ')}): ${p.summary}</li>`
      )
      .join('');

    const skillFlat = SKILLS.flatMap((g) => g.items.map((i) => i.name)).join(' • ');

    const eduHTML = VERSION_INFO.education
      .map((e) => `<p><strong>${e.title}</strong> — ${e.place}</p>`)
      .join('');

    const certHTML = VERSION_INFO.certifications
      .map((c) => `<li>${c}</li>`)
      .join('');

    this.printResume.innerHTML = `
      <h1>${PROFILE.fullName}</h1>
      <p><strong>${PROFILE.role}</strong></p>
      <p>${PROFILE.location} • Tel: ${PROFILE.phone} • ${PROFILE.email}</p>
      <p>GitHub: ${PROFILE.github} • LinkedIn: ${PROFILE.linkedin}</p>
      <h2>Resumo Profissional</h2>
      <p>${PROFILE.bio}</p>
      <h2>Experiência &amp; Atividades</h2>
      ${expHTML}
      <h2>Projetos em Destaque</h2>
      <ul>${projHTML}</ul>
      <h2>Formação Acadêmica</h2>
      ${eduHTML}
      <h2>Habilidades Técnicas</h2>
      <p>${skillFlat}</p>
      <h2>Cursos Complementares</h2>
      <ul>${certHTML}</ul>
      <h2>Idiomas</h2>
      <p>${PROFILE.languages}</p>
    `;
  }

  _updateHUD() {
    const isHome = this.currentScreen === 'home';
    const isBoot = this.currentScreen === 'boot';

    if (isBoot) {
      this.hudConfirmLabel.textContent = 'Start';
      this.hudBack.style.opacity = '0.35';
      this.hudVersionLabel.textContent = 'Version';
    } else if (isHome) {
      this.hudConfirmLabel.textContent = 'Enter';
      this.hudBack.style.opacity = '0.35';
      this.hudVersionLabel.textContent = 'Version';
    } else if (this.currentScreen === 'browser') {
      this.hudConfirmLabel.textContent = 'Enter';
      this.hudBack.style.opacity = '1';
      this.hudBackLabel.textContent = 'Back';
      this.hudVersionLabel.textContent = 'Options';
    } else {
      this.hudConfirmLabel.textContent = 'Enter';
      this.hudBack.style.opacity = '1';
      this.hudBackLabel.textContent = 'Back';
      this.hudVersionLabel.textContent = 'Version';
    }
  }

  _updateAudioLabel(isMuted) {
    this.hudAudioLabel.textContent = isMuted ? 'Sound: OFF' : 'Sound: ON';
  }

  _formatPS2Clock() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}  ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  _startClock() {
    const tick = () => {
      const str = this._formatPS2Clock();
      if (this.liveClockHome) this.liveClockHome.textContent = str;
      const sysClock = document.getElementById('sys-live-clock');
      if (sysClock) sysClock.textContent = str;
    };
    tick();
    setInterval(tick, 1000);
  }

  copyText(text, message) {
    this.audio.playConfirm();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => this.showToast(message),
        () => this.showToast(message)
      );
    } else {
      this.showToast(message);
    }
  }

  showToast(msg) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2400);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new PS2PortfolioApp();
});
