import * as THREE from 'three';

/**
 * Motor 3D Three.js com estética autêntica do PlayStation 2 BIOS / Memory Card:
 * - Tela inicial (Home / Boot): fundo negro profundo com torres cristalinas
 *   na névoa azul e os 7 orbes luminosos clássicos em órbita.
 * - Tela Browser (Memory Card): fundo transparente sobre o gradiente metálico
 *   cinza-oliva clássico do PS2, exibindo ícones 3D sólidos e coloridos de "Save"
 *   flutuando livres em grade e iluminados pelo icônico ORBE DE LUZ BRANCA cursor!
 */
export class PS2Scene {
  constructor(canvas, projects, callbacks = {}) {
    this.canvas = canvas;
    this.projects = projects;
    this.callbacks = callbacks;

    this.mode = 'boot'; // 'boot' | 'home' | 'browser' | 'inspect' | 'system' | 'version'
    this.selectedIndex = 0;
    this.hoveredIndex = -1;
    this.gridCols = 4;
    this.glowIntensity = 1.0;

    // Interação de ponteiro / paralaxe / rotação de inspeção
    this.pointer = new THREE.Vector2(999, 999);
    this.normalizedMouse = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.isDraggingInspect = false;
    this.lastDragX = 0;
    this.lastDragY = 0;
    this.inspectRotY = 0;
    this.inspectRotX = 0;

    // Câmera alvo (interpolada suavemente)
    this.camTargetPos = new THREE.Vector3(0, 2.2, 13);
    this.camTargetLook = new THREE.Vector3(0, 0, 0);
    this.currentLook = new THREE.Vector3(0, 0, 0);

    // Estruturas da cena
    this.towers = [];
    this.orbs = [];
    this.memoryIcons = [];
    this.hitMeshes = [];

    this.clock = new THREE.Clock();
    this.elapsed = 0;

    this._initRendererAndScene();
    this._createProceduralTextures();
    this._buildLights();
    this._buildCrystalTowers();
    this._buildAmbientParticles();
    this._buildSevenOrbs();
    this._buildMemoryCardIcons();
    this._bindEvents();
    this._handleResize();

    this._animate = this._animate.bind(this);
    this._animate();
  }

  _initRendererAndScene() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0); // Transparente para revelar o fundo CSS autêntico de cada tela
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    this.camera.position.set(0, 7.5, 20);
  }

  /** Cria texturas procedurais (orbes luminosos + rótulos retrô estilo saves de PS2) */
  _createProceduralTextures() {
    const makeRadialTexture = (stops) => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // Halo azul-branco dos 7 orbes da tela inicial
    this.orbGlowTex = makeRadialTexture([
      [0.0, 'rgba(255, 255, 255, 1.0)'],
      [0.2, 'rgba(185, 226, 255, 0.92)'],
      [0.5, 'rgba(42, 130, 255, 0.42)'],
      [1.0, 'rgba(0, 18, 70, 0.0)'],
    ]);

    // Halo branco intenso e puro do cursor de seleção do Memory Card (fiel à imagem!)
    this.whiteCursorTex = makeRadialTexture([
      [0.0, 'rgba(255, 255, 255, 1.0)'],
      [0.26, 'rgba(255, 255, 255, 0.96)'],
      [0.48, 'rgba(225, 238, 255, 0.55)'],
      [0.72, 'rgba(180, 205, 235, 0.16)'],
      [1.0, 'rgba(255, 255, 255, 0.0)'],
    ]);

    this.sparkTex = makeRadialTexture([
      [0.0, 'rgba(225, 240, 255, 0.9)'],
      [0.4, 'rgba(80, 155, 255, 0.4)'],
      [1.0, 'rgba(0, 0, 0, 0.0)'],
    ]);
  }

  /** Helper para pintar texturas retrô estilo PS2 em CanvasTexture */
  _makeLabelTexture(drawFn, size = 256) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  _buildLights() {
    this.ambientLight = new THREE.AmbientLight('#d4d8dc', 1.15);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight('#f5f7fa', '#262922', 0.95);
    this.scene.add(this.hemiLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35);
    keyLight.position.set(6, 12, 14);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#9aa6b8', 0.55);
    fillLight.position.set(-10, -5, 6);
    this.scene.add(fillLight);

    // Luz intensa que acompanha o icônico Orbe Branco Cursor do Memory Card
    this.cursorLight = new THREE.PointLight('#ffffff', 4.2, 9.5, 1.5);
    this.cursorLight.position.set(0, 0, 2);
    this.scene.add(this.cursorLight);
  }

  /** As torres cristalinas escuras do fundo do menu inicial (Home / Boot) */
  _buildCrystalTowers() {
    this.towersGroup = new THREE.Group();
    this.scene.add(this.towersGroup);

    const towerMatBase = new THREE.MeshPhongMaterial({
      color: '#0b1a3d',
      emissive: '#040c24',
      specular: '#6ea8ff',
      shininess: 90,
      transparent: true,
      opacity: 0.55,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: '#4e8ef7',
      transparent: true,
      opacity: 0.22,
    });

    const count = 40;
    for (let i = 0; i < count; i++) {
      const col = (i % 8) - 3.5;
      const row = Math.floor(i / 8) - 2;
      const x = col * 3.5 + (Math.random() - 0.5) * 1.4;
      const z = -9 - row * 4.2 + (Math.random() - 0.5) * 2.0;
      const w = 0.8 + Math.random() * 0.9;
      const d = 0.8 + Math.random() * 0.9;
      const h = 4.5 + Math.random() * 12;

      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, towerMatBase.clone());
      mesh.material.opacity = 0.26 + Math.random() * 0.3;

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      mesh.add(edges);

      const baseY = -12 + h * 0.32 - Math.random() * 2;
      mesh.position.set(x, baseY, z);
      this.towersGroup.add(mesh);

      this.towers.push({
        mesh,
        baseY,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        amp: 0.35 + Math.random() * 0.5,
      });
    }
  }

  /** Partículas sutis para a tela inicial escura */
  _buildAmbientParticles() {
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      map: this.sparkTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  /** Os 7 orbes luminosos clássicos do menu principal do PS2 */
  _buildSevenOrbs() {
    this.orbsGroup = new THREE.Group();
    this.orbsGroup.position.set(-2.3, 0.2, -1.5);
    this.scene.add(this.orbsGroup);

    const coreSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.orbGlowTex,
        color: '#2563eb',
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    coreSprite.scale.set(5.6, 5.6, 1);
    this.orbsGroup.add(coreSprite);

    const orbCount = 7;
    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2;
      const orbNode = new THREE.Group();

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 14, 14),
        new THREE.MeshBasicMaterial({ color: '#ffffff' })
      );
      orbNode.add(sphere);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.orbGlowTex,
          color: '#7ab8ff',
          transparent: true,
          opacity: 0.94,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      halo.scale.set(1.5, 1.5, 1);
      orbNode.add(halo);

      const trailSprites = [];
      for (let t = 1; t <= 3; t++) {
        const ts = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.orbGlowTex,
            color: '#4690ff',
            transparent: true,
            opacity: 0.48 / t,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        ts.scale.set(1.05 / t, 1.05 / t, 1);
        this.orbsGroup.add(ts);
        trailSprites.push(ts);
      }

      this.orbsGroup.add(orbNode);
      this.orbs.push({
        node: orbNode,
        halo,
        trailSprites,
        baseAngle: angle,
        radius: 2.25,
      });
    }
  }

  /**
   * Modela cada ícone 3D clássico de "Save" de Memory Card do PS2 —
   * objetos sólidos, coloridos e low-poly com texturas procedurais retrô,
   * inspirados diretamente na tela clássica do Memory Card enviada pelo usuário!
   */
  _createPS2SaveModel(iconType) {
    const group = new THREE.Group();

    switch (iconType) {
      // 1. Cubo preto brilhante com logo estilo clássico (homenagem ao cubo GTA III da imagem!)
      case 'ps2-cube': {
        const tex = this._makeLabelTexture((ctx, s) => {
          ctx.fillStyle = '#0c0d11';
          ctx.fillRect(0, 0, s, s);
          ctx.strokeStyle = '#383d4a';
          ctx.lineWidth = 10;
          ctx.strokeRect(8, 8, s - 16, s - 16);

          ctx.fillStyle = '#e5e7eb';
          ctx.font = 'bold 64px Arial Black, Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('MH', s / 2, s * 0.34);

          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(36, s * 0.54, s - 72, 10);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 40px Arial, sans-serif';
          ctx.fillText('WORLD', s / 2, s * 0.74);
        });
        const mat = new THREE.MeshPhongMaterial({
          map: tex,
          specular: '#8899bb',
          shininess: 70,
        });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.08, 1.08), mat);
        cube.rotation.set(0.22, -0.45, 0);
        group.add(cube);
        group.userData.animType = 'gentle-turn';
        break;
      }

      // 2. Bloco vermelho duplo com emblema branco (homenagem ao save de Gran Turismo da imagem!)
      case 'red-block': {
        const tex = this._makeLabelTexture((ctx, s) => {
          const grad = ctx.createLinearGradient(0, 0, 0, s);
          grad.addColorStop(0, '#a8231b');
          grad.addColorStop(0.5, '#8f1b14');
          grad.addColorStop(1, '#68110c');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, s, s);

          // Linha divisória horizontal estilo 2 blocos empilhados
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(0, s * 0.49, s, 8);

          // Emblema estilizado branco
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(s * 0.38, s * 0.25, 28, 0.3, Math.PI * 1.85);
          ctx.stroke();
          ctx.fillStyle = '#f3f4f6';
          ctx.font = 'bold 42px Arial, sans-serif';
          ctx.fillText('FP', s * 0.52, s * 0.31);

          // Barras de telemetria na metade inferior
          const bars = [34, 58, 44, 72, 52];
          bars.forEach((h, i) => {
            ctx.fillStyle = i === 3 ? '#fde047' : '#e5e7eb';
            ctx.fillRect(46 + i * 34, s * 0.88 - h, 22, h);
          });
        });
        const mat = new THREE.MeshPhongMaterial({
          map: tex,
          specular: '#ff9988',
          shininess: 48,
        });
        const block = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.18, 0.92), mat);
        block.rotation.set(0.15, 0.22, 0);
        group.add(block);
        group.userData.animType = 'gentle-turn';
        break;
      }

      // 3. Escultura roxa/magenta com microfone & anel (homenagem ao SingStar da imagem!)
      case 'synth-ring': {
        const purpleMat = new THREE.MeshPhongMaterial({
          color: '#9b30b8',
          emissive: '#2c0938',
          specular: '#f0abfc',
          shininess: 85,
        });
        const chromeMat = new THREE.MeshPhongMaterial({
          color: '#b762d4',
          specular: '#ffffff',
          shininess: 110,
        });

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.12, 14, 32, Math.PI * 1.65),
          purpleMat
        );
        ring.rotation.z = 0.55;

        const micBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.065, 0.62, 12),
          purpleMat
        );
        micBody.position.set(0.32, -0.04, 0.08);
        micBody.rotation.z = -0.35;

        const micHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 14, 12),
          chromeMat
        );
        micHead.position.set(0.43, 0.28, 0.08);

        const coreNote = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.42, 10),
          purpleMat
        );
        coreNote.position.set(-0.04, 0.02, 0);

        group.add(ring, micBody, micHead, coreNote);
        group.userData.animType = 'spin-y';
        break;
      }

      // 4. Disquete 3.5" 3D clássico (diretamente inspirado no disquete da imagem!)
      case 'floppy-disk': {
        const bodyMat = new THREE.MeshPhongMaterial({
          color: '#1b1d24',
          specular: '#64748b',
          shininess: 65,
        });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.06, 0.18), bodyMat);

        // Trava metálica prateada no topo
        const shutterMat = new THREE.MeshPhongMaterial({
          color: '#b8c0cc',
          specular: '#ffffff',
          shininess: 120,
        });
        const shutter = new THREE.Mesh(
          new THREE.BoxGeometry(0.56, 0.36, 0.2),
          shutterMat
        );
        shutter.position.set(0.08, 0.34, 0);

        const slotHole = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.24, 0.22),
          new THREE.MeshBasicMaterial({ color: '#0f1116' })
        );
        slotHole.position.set(0.22, 0.34, 0);

        // Etiqueta frontal do disquete
        const labelTex = this._makeLabelTexture((ctx, s) => {
          ctx.fillStyle = '#d8dde6';
          ctx.fillRect(0, 0, s, s);
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(0, 0, s, 44);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px monospace';
          ctx.fillText('MERCADO.DB', 16, 30);
          ctx.fillStyle = '#334155';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(18, 76 + i * 38, s - 36, 6);
          }
        }, 256);

        const label = new THREE.Mesh(
          new THREE.PlaneGeometry(0.74, 0.52),
          new THREE.MeshPhongMaterial({ map: labelTex })
        );
        label.position.set(0, -0.2, 0.095);

        const labelBack = label.clone();
        labelBack.rotation.y = Math.PI;
        labelBack.position.z = -0.095;

        group.add(body, shutter, slotHole, label, labelBack);
        group.rotation.y = -0.22;
        group.userData.animType = 'gentle-turn';
        break;
      }

      // 5. Bloco dourado/âmbar texturizado estilo jogo de aventura PS2 (homenagem ao bloco amarelo!)
      case 'voxel-cube': {
        const tex = this._makeLabelTexture((ctx, s) => {
          const grad = ctx.createLinearGradient(0, 0, s, s);
          grad.addColorStop(0, '#eab308');
          grad.addColorStop(0.55, '#ca8a04');
          grad.addColorStop(1, '#854d0e');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, s, s);

          // Padrão geométrico de voxels / totem
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(28, 28, 64, 64);
          ctx.fillStyle = '#0f766e';
          ctx.fillRect(104, 28, 64, 64);
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(178, 28, 50, 64);

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(28, 112, s - 56, 36);
          ctx.fillStyle = '#fef9c3';
          ctx.font = 'bold 30px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('AWS QUIZ', s / 2, 140);

          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(48, 168, 48, 56);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(108, 168, 96, 56);
        });
        const mat = new THREE.MeshPhongMaterial({
          map: tex,
          specular: '#fef08a',
          shininess: 55,
        });
        const mainCube = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), mat);
        mainCube.rotation.set(0.24, 0.42, 0.08);
        group.add(mainCube);
        group.userData.animType = 'spin-y';
        break;
      }

      // 6. Capacete de corrida 3D metálico com viseira (diretamente inspirado no capacete da imagem!)
      case 'visor-helmet': {
        const shellMat = new THREE.MeshPhongMaterial({
          color: '#a84a20',
          specular: '#ffd7b8',
          shininess: 110,
        });
        const stripeMat = new THREE.MeshPhongMaterial({
          color: '#e2e8f0',
          specular: '#ffffff',
          shininess: 100,
        });
        const visorMat = new THREE.MeshPhongMaterial({
          color: '#1e293b',
          emissive: '#091122',
          specular: '#bae6fd',
          shininess: 150,
        });

        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.56, 20, 16), shellMat);
        dome.scale.set(0.94, 1.02, 1.08);

        const chin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.46, 0.42, 0.36, 16),
          new THREE.MeshPhongMaterial({ color: '#27272a', shininess: 60 })
        );
        chin.position.set(0, -0.24, 0.14);

        const visor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.53, 0.52, 0.28, 18, 1, false, -0.95, 1.9),
          visorMat
        );
        visor.position.set(0, -0.02, 0.06);

        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.84, 1.15),
          stripeMat
        );
        stripe.position.set(0, 0.18, -0.02);

        group.add(dome, chin, visor, stripe);
        group.rotation.set(0.18, -0.45, 0);
        group.userData.animType = 'spin-y';
        break;
      }

      // 7. Cartucho / Card retrô estilizado (inspirado nos blocos com faixa preta/prata da coluna 2!)
      case 'save-cart': {
        const labelTex = this._makeLabelTexture((ctx, s) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, s, s);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(10, 42, s - 20, s - 88);
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(24, 62, s - 48, 88);
          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 40px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CRUD', s / 2, 120);
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('LEITURA LIVROS', s / 2, s - 16);
        });

        const baseMat = new THREE.MeshPhongMaterial({
          color: '#1e2430',
          specular: '#94a3b8',
          shininess: 60,
        });
        const faceMat = new THREE.MeshPhongMaterial({
          map: labelTex,
          specular: '#cbd5e1',
          shininess: 70,
        });

        const card = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.82, 0.28), [
          baseMat,
          baseMat,
          baseMat,
          baseMat,
          faceMat,
          faceMat,
        ]);
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(1.04, 0.14, 0.3),
          new THREE.MeshPhongMaterial({ color: '#090b10', shininess: 40 })
        );
        cap.position.y = 0.44;

        group.add(card, cap);
        group.rotation.set(0.12, 0.18, 0);
        group.userData.animType = 'gentle-turn';
        break;
      }

      // 8. Disco / Emblema azul cobalto clássico (inspirado no ícone circular azul do topo-esquerdo!)
      case 'cobalt-disc':
      default: {
        const discTex = this._makeLabelTexture((ctx, s) => {
          ctx.fillStyle = '#1d4ed8';
          ctx.fillRect(0, 0, s, s);
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 94px Arial Black, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', s / 2, s / 2 + 4);
        });

        const rimMat = new THREE.MeshPhongMaterial({
          color: '#1e40af',
          specular: '#bfdbfe',
          shininess: 95,
        });
        const faceMat = new THREE.MeshPhongMaterial({
          map: discTex,
          specular: '#ffffff',
          shininess: 85,
        });

        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.54, 0.54, 0.22, 24),
          [rimMat, faceMat, faceMat]
        );
        disc.rotation.x = Math.PI / 2;
        disc.rotation.z = 0.1;

        group.add(disc);
        group.userData.animType = 'spin-y';
        break;
      }
    }

    return group;
  }

  /** Constrói a grade de ícones 3D de Memory Card + o icônico Orbe Branco Cursor */
  _buildMemoryCardIcons() {
    this.browserGroup = new THREE.Group();
    this.browserGroup.visible = false;
    this.browserGroup.scale.setScalar(0.001);
    this.scene.add(this.browserGroup);

    // O ICÔNICO ORBE LUMINOSO BRANCO CURSOR DO MEMORY CARD DO PS2 (igual à imagem!)
    this.cursorOrbGroup = new THREE.Group();
    const orbCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    const orbFlare = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.whiteCursorTex,
        color: '#ffffff',
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    orbFlare.scale.set(2.35, 2.35, 1);

    const orbOuterGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.whiteCursorTex,
        color: '#dbeafe',
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    orbOuterGlow.scale.set(3.6, 3.6, 1);

    this.cursorOrbGroup.add(orbCore, orbFlare, orbOuterGlow);
    this.cursorOrbFlare = orbFlare;
    this.browserGroup.add(this.cursorOrbGroup);

    // Cria cada objeto 3D de Save diretamente no espaço (sem caixas/jaulas translúcidas!)
    this.projects.forEach((project, idx) => {
      const root = new THREE.Group();
      const model = this._createPS2SaveModel(project.iconType);
      root.add(model);

      // Hitbox invisível para raycasting preciso
      const hitMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 1.65, 1.65),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitMesh.userData.projectIndex = idx;
      root.add(hitMesh);
      this.hitMeshes.push(hitMesh);

      this.browserGroup.add(root);
      this.memoryIcons.push({
        index: idx,
        project,
        root,
        model,
        basePos: new THREE.Vector3(),
        phase: idx * 0.9,
        currentScale: 1,
      });
    });

    this._layoutMemoryIcons();
  }

  /** Layout em grade limpa estilo Memory Card do PS2 (4x2 desktop, 2x4 mobile) */
  _layoutMemoryIcons() {
    const isCompact = window.innerWidth < 820;
    this.gridCols = isCompact ? 2 : 4;
    const cols = this.gridCols;
    const rows = Math.ceil(this.memoryIcons.length / cols);

    const spacingX = isCompact ? 2.25 : 2.35;
    const spacingY = isCompact ? 2.15 : 2.2;

    this.memoryIcons.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = (col - (cols - 1) / 2) * spacingX;
      const y = ((rows - 1) / 2 - row) * spacingY + 0.1;
      // Perspectiva sutil inspirada no grid flutuante do PS2
      const z = -row * 0.35;
      item.basePos.set(x, y, z);
    });
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === 'browser' || mode === 'inspect') {
      this.browserGroup.visible = true;
    }

    if (mode === 'inspect') {
      this.inspectRotX = 0;
      this.inspectRotY = 0;
    }

    this._updateCameraTargets();
  }

  setSelectedProject(index) {
    if (index < 0 || index >= this.memoryIcons.length) return;
    this.selectedIndex = index;
    this._updateCameraTargets();
  }

  setGlowIntensity(value) {
    this.glowIntensity = value;
    this.renderer.toneMappingExposure = 0.88 + value * 0.22;
  }

  rotateInspect(dx, dy) {
    if (this.mode !== 'inspect') return;
    this.inspectRotY += dx;
    this.inspectRotX = Math.max(-0.9, Math.min(0.9, this.inspectRotX + dy));
  }

  getGridCols() {
    return this.gridCols;
  }

  _updateCameraTargets() {
    const isCompact = window.innerWidth < 820;

    switch (this.mode) {
      case 'boot':
        this.camTargetPos.set(0, 5.5, 17.5);
        this.camTargetLook.set(0, -1.2, -4);
        break;
      case 'home':
        this.camTargetPos.set(0, 1.0, isCompact ? 13.0 : 10.8);
        this.camTargetLook.set(isCompact ? 0 : -0.9, 0.15, -1.5);
        break;
      case 'browser': {
        const sel = this.memoryIcons[this.selectedIndex];
        const fx = sel ? sel.basePos.x * 0.08 : 0;
        const fy = sel ? sel.basePos.y * 0.06 : 0;
        this.camTargetPos.set(fx, fy + 0.25, isCompact ? 11.4 : 8.6);
        this.camTargetLook.set(fx * 0.4, fy, 0);
        break;
      }
      case 'inspect': {
        const sel = this.memoryIcons[this.selectedIndex];
        if (sel) {
          const offsetX = isCompact ? 0 : 1.55;
          const offsetY = isCompact ? -0.7 : 0.05;
          this.camTargetPos.set(
            sel.basePos.x + offsetX,
            sel.basePos.y + offsetY,
            sel.basePos.z + (isCompact ? 5.2 : 4.2)
          );
          this.camTargetLook.set(
            sel.basePos.x + (isCompact ? 0 : 1.2),
            sel.basePos.y + (isCompact ? -0.4 : 0),
            sel.basePos.z + 1.1
          );
        }
        break;
      }
      case 'system':
        this.camTargetPos.set(-3.8, 2.2, 12.2);
        this.camTargetLook.set(0.6, 0.1, -3);
        break;
      case 'version':
        this.camTargetPos.set(2.2, -0.5, 13.0);
        this.camTargetLook.set(0, -2.0, -5);
        break;
      default:
        break;
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._handleResize());

    window.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.normalizedMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.mode === 'inspect' && this.isDraggingInspect) {
        const dx = e.clientX - this.lastDragX;
        const dy = e.clientY - this.lastDragY;
        this.inspectRotY += dx * 0.012;
        this.inspectRotX = Math.max(-0.9, Math.min(0.9, this.inspectRotX + dy * 0.01));
        this.lastDragX = e.clientX;
        this.lastDragY = e.clientY;
        return;
      }

      if (this.mode === 'browser' && e.target === this.canvas) {
        this.pointer.copy(this.normalizedMouse);
        this._checkHover();
      } else if (this.hoveredIndex !== -1) {
        this.hoveredIndex = -1;
        this.canvas.style.cursor = 'default';
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.mode === 'inspect') {
        this.isDraggingInspect = true;
        this.lastDragX = e.clientX;
        this.lastDragY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
        return;
      }

      if (this.mode === 'browser') {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
        if (hits.length > 0) {
          const idx = hits[0].object.userData.projectIndex;
          if (this.callbacks.onBlockClick) {
            this.callbacks.onBlockClick(idx);
          }
        }
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDraggingInspect) {
        this.isDraggingInspect = false;
        this.canvas.style.cursor = this.mode === 'inspect' ? 'grab' : 'default';
      }
    });
  }

  _checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);

    if (hits.length > 0) {
      const idx = hits[0].object.userData.projectIndex;
      this.canvas.style.cursor = 'pointer';
      if (idx !== this.hoveredIndex) {
        this.hoveredIndex = idx;
        if (this.callbacks.onBlockHover) {
          this.callbacks.onBlockHover(idx);
        }
      }
    } else {
      this.canvas.style.cursor = 'default';
      this.hoveredIndex = -1;
    }
  }

  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this._layoutMemoryIcons();
    this._updateCameraTargets();
  }

  _animate() {
    requestAnimationFrame(this._animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;
    const t = this.elapsed;

    const inMemoryCard = this.mode === 'browser' || this.mode === 'inspect';

    // 1. Torres Cristalinas & Partículas só ficam visíveis fora do Memory Card
    //    (mantendo a tela do Memory Card limpa e fiel ao gradiente metálico da imagem!)
    this.towersGroup.visible = !inMemoryCard;
    this.particles.visible = !inMemoryCard;

    if (!inMemoryCard) {
      for (let i = 0; i < this.towers.length; i++) {
        const tw = this.towers[i];
        tw.mesh.position.y = tw.baseY + Math.sin(t * tw.speed + tw.phase) * tw.amp;
      }
      this.particles.rotation.y = t * 0.015;
    }

    // 2. Os 7 Orbes Luminosos da tela inicial do PS2
    const showOrbs = this.mode === 'home' || this.mode === 'boot';
    const targetOrbsScale = showOrbs ? 1 : 0.001;
    const curOrbsScale = THREE.MathUtils.lerp(
      this.orbsGroup.scale.x,
      targetOrbsScale,
      dt * 4.5
    );
    this.orbsGroup.scale.setScalar(curOrbsScale);
    this.orbsGroup.visible = curOrbsScale > 0.015;

    if (this.orbsGroup.visible) {
      this.orbsGroup.rotation.x = 0.4 + Math.sin(t * 0.34) * 0.12;
      this.orbsGroup.rotation.y = Math.cos(t * 0.24) * 0.22;

      this.orbs.forEach((orb, idx) => {
        const angle = orb.baseAngle + t * 0.85;
        const r = orb.radius + Math.sin(t * 1.4 + idx) * 0.11;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = Math.sin(angle * 2 + t * 0.9) * 0.34;

        orb.node.position.set(x, y, z);
        const pulse = (1.35 + Math.sin(t * 3 + idx) * 0.22) * this.glowIntensity;
        orb.halo.scale.set(pulse, pulse, 1);

        orb.trailSprites.forEach((ts, tIdx) => {
          const lag = (tIdx + 1) * 0.15;
          const aLag = angle - lag;
          ts.position.set(
            Math.cos(aLag) * r,
            Math.sin(aLag) * r,
            Math.sin(aLag * 2 + (t - lag * 0.5) * 0.9) * 0.34
          );
        });
      });
    }

    // 3. Ícones 3D do Memory Card + Orbe Branco Cursor (estilo autêntico da imagem!)
    const targetBrowserScale = inMemoryCard ? 1 : 0.001;
    const curBScale = THREE.MathUtils.lerp(
      this.browserGroup.scale.x,
      targetBrowserScale,
      dt * 5.8
    );
    this.browserGroup.scale.setScalar(curBScale);
    this.browserGroup.visible = curBScale > 0.015;
    this.cursorLight.intensity = inMemoryCard ? 3.8 * this.glowIntensity : 0;

    if (this.browserGroup.visible) {
      const selItem = this.memoryIcons[this.selectedIndex];

      this.memoryIcons.forEach((item) => {
        const isSelected = item.index === this.selectedIndex;
        const isInspectingOther = this.mode === 'inspect' && !isSelected;

        // Animação clássica: no PS2 o save selecionado gira e flutua um pouco mais perto!
        const bobAmp = isSelected ? 0.09 : 0.035;
        const floatY = Math.sin(t * (isSelected ? 2.4 : 1.1) + item.phase) * bobAmp;
        const zBoost = isSelected
          ? this.mode === 'inspect'
            ? 1.15
            : 0.65
          : isInspectingOther
          ? -3.5
          : 0;

        item.root.position.x = THREE.MathUtils.lerp(item.root.position.x, item.basePos.x, dt * 6.5);
        item.root.position.y = THREE.MathUtils.lerp(
          item.root.position.y,
          item.basePos.y + floatY,
          dt * 6.5
        );
        item.root.position.z = THREE.MathUtils.lerp(
          item.root.position.z,
          item.basePos.z + zBoost,
          dt * 6.5
        );

        const targetScale = isInspectingOther
          ? 0.001
          : isSelected
          ? this.mode === 'inspect'
            ? 1.48
            : 1.18
          : 0.92;
        item.currentScale = THREE.MathUtils.lerp(item.currentScale, targetScale, dt * 7);
        item.root.scale.setScalar(item.currentScale);
        item.root.visible = item.currentScale > 0.02;

        // Rotação retrô autêntica
        if (this.mode === 'inspect' && isSelected) {
          item.model.rotation.y = THREE.MathUtils.lerp(
            item.model.rotation.y,
            this.inspectRotY + t * 0.45,
            dt * 5.5
          );
          item.model.rotation.x = THREE.MathUtils.lerp(
            item.model.rotation.x,
            this.inspectRotX + 0.14,
            dt * 5.5
          );
        } else if (isSelected) {
          item.model.rotation.y += dt * 1.15;
          item.model.rotation.x = Math.sin(t * 1.1) * 0.14;
        } else {
          // Ícones não selecionados oscilam bem devagar (como no Memory Card do PS2)
          item.model.rotation.y += dt * 0.16;
          item.model.rotation.x = Math.sin(t * 0.5 + item.phase) * 0.06;
        }
      });

      // Posiciona o icônico ORBE BRANCO LUMINOSO ao redor/abaixo do ícone selecionado
      if (selItem) {
        const orbitAngle = t * 1.65;
        const orbOffsetX =
          this.mode === 'inspect'
            ? Math.cos(orbitAngle) * 0.72
            : 0.18 + Math.cos(orbitAngle) * 0.22;
        const orbOffsetY =
          this.mode === 'inspect'
            ? -0.68 + Math.sin(orbitAngle) * 0.12
            : -0.46 + Math.sin(orbitAngle) * 0.08;
        const orbOffsetZ = this.mode === 'inspect' ? 0.85 : 0.78;

        const targetOrbPos = new THREE.Vector3(
          selItem.root.position.x + orbOffsetX,
          selItem.root.position.y + orbOffsetY,
          selItem.root.position.z + orbOffsetZ
        );

        this.cursorOrbGroup.position.lerp(targetOrbPos, dt * 11);
        const flarePulse = (2.15 + Math.sin(t * 4.2) * 0.22) * this.glowIntensity;
        this.cursorOrbFlare.scale.set(flarePulse, flarePulse, 1);

        this.cursorLight.position.copy(this.cursorOrbGroup.position);
        this.cursorLight.position.z += 0.65;
      }
    }

    // 4. Câmera com paralaxe bem sutil
    const parallaxScale = inMemoryCard ? 0.12 : 0.4;
    const px = this.normalizedMouse.x * parallaxScale;
    const py = this.normalizedMouse.y * parallaxScale * 0.65;

    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x,
      this.camTargetPos.x + px,
      dt * 4.2
    );
    this.camera.position.y = THREE.MathUtils.lerp(
      this.camera.position.y,
      this.camTargetPos.y + py,
      dt * 4.2
    );
    this.camera.position.z = THREE.MathUtils.lerp(
      this.camera.position.z,
      this.camTargetPos.z,
      dt * 4.2
    );

    this.currentLook.lerp(this.camTargetLook, dt * 4.6);
    this.camera.lookAt(this.currentLook);

    this.renderer.render(this.scene, this.camera);
  }
}
