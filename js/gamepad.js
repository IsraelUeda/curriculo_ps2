/**
 * Controlador nativo via Gamepad API (navegadores modernos).
 * Suporta controles USB/Bluetooth (DualShock 4, DualSense PS5, Xbox, PS2 USB e genéricos)
 * com mapeamento padrão PlayStation (✕ ○ △ □, D-Pad, analógicos, L1/R1 e vibração suave).
 */
export class PS2Gamepad {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.activeIndex = null;
    this.prevButtons = [];
    this.lastDir = null;
    this.nextRepeatAt = 0;

    this.DEADZONE_NAV = 0.52;
    this.DEADZONE_LOOK = 0.16;
    this.REPEAT_INITIAL_MS = 340;
    this.REPEAT_INTERVAL_MS = 165;

    this._onConnected = this._onConnected.bind(this);
    this._onDisconnected = this._onDisconnected.bind(this);
    this._poll = this._poll.bind(this);

    if (typeof window !== 'undefined' && 'getGamepads' in navigator) {
      window.addEventListener('gamepadconnected', this._onConnected);
      window.addEventListener('gamepaddisconnected', this._onDisconnected);
      requestAnimationFrame(this._poll);
    }
  }

  _onConnected(e) {
    const gp = e.gamepad;
    this.activeIndex = gp.index;
    this.prevButtons = gp.buttons.map((b) => b.pressed);
    if (this.callbacks.onConnect) {
      this.callbacks.onConnect(this._cleanName(gp.id));
    }
    this.rumble(70, 0.25, 0.15);
  }

  _onDisconnected(e) {
    if (this.activeIndex === e.gamepad.index) {
      this.activeIndex = null;
      this.prevButtons = [];
      this.lastDir = null;
    }
    if (this.callbacks.onDisconnect) {
      this.callbacks.onDisconnect();
    }
  }

  _cleanName(rawId = '') {
    return rawId.replace(/\s*\(.*?\)\s*/g, ' ').trim() || 'Gamepad';
  }

  _getActiveGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (this.activeIndex !== null && pads[this.activeIndex]) {
      return pads[this.activeIndex];
    }
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        this.activeIndex = pads[i].index;
        return pads[i];
      }
    }
    return null;
  }

  rumble(duration = 55, weak = 0.22, strong = 0.1) {
    const gp = this._getActiveGamepad();
    if (!gp || !gp.vibrationActuator || !gp.vibrationActuator.playEffect) return;
    try {
      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: weak,
        strongMagnitude: strong,
      });
    } catch {
      // Ignora silenciosamente se o dispositivo não suportar vibração
    }
  }

  _poll(now) {
    requestAnimationFrame(this._poll);

    const gp = this._getActiveGamepad();
    if (!gp) return;

    const btns = gp.buttons;
    const isJustPressed = (idx) =>
      Boolean(btns[idx]?.pressed) && !Boolean(this.prevButtons[idx]);

    // Botões de ação (mapeamento padrão W3C Standard Gamepad)
    // 0: ✕ / A | 1: ○ / B | 2: □ / X | 3: △ / Y | 4: L1 | 5: R1 | 9: Start
    if (isJustPressed(0) || isJustPressed(9)) {
      this.rumble(50, 0.22, 0.12);
      this.callbacks.onConfirm?.();
    } else if (isJustPressed(1)) {
      this.rumble(35, 0.14, 0.05);
      this.callbacks.onBack?.();
    } else if (isJustPressed(3)) {
      this.rumble(45, 0.18, 0.08);
      this.callbacks.onVersion?.();
    } else if (isJustPressed(2)) {
      this.callbacks.onToggleAudio?.();
    } else if (isJustPressed(4)) {
      this.callbacks.onPrev?.();
    } else if (isJustPressed(5)) {
      this.callbacks.onNext?.();
    }

    // Direcional: D-Pad (12..15) + Analógico Esquerdo (axes 0, 1)
    const axX = gp.axes[0] || 0;
    const axY = gp.axes[1] || 0;

    let dir = null;
    if (btns[12]?.pressed || axY < -this.DEADZONE_NAV) dir = 'up';
    else if (btns[13]?.pressed || axY > this.DEADZONE_NAV) dir = 'down';
    else if (btns[14]?.pressed || axX < -this.DEADZONE_NAV) dir = 'left';
    else if (btns[15]?.pressed || axX > this.DEADZONE_NAV) dir = 'right';

    if (dir) {
      if (dir !== this.lastDir) {
        this.lastDir = dir;
        this.nextRepeatAt = now + this.REPEAT_INITIAL_MS;
        this.callbacks.onDirection?.(dir);
      } else if (now >= this.nextRepeatAt) {
        this.nextRepeatAt = now + this.REPEAT_INTERVAL_MS;
        this.callbacks.onDirection?.(dir);
      }
    } else {
      this.lastDir = null;
    }

    // Analógico Direito (axes 2, 3): rotaciona o bloco 3D no modo inspeção
    const rx = gp.axes[2] || 0;
    const ry = gp.axes[3] || 0;
    if (Math.abs(rx) > this.DEADZONE_LOOK || Math.abs(ry) > this.DEADZONE_LOOK) {
      this.callbacks.onRightStick?.(rx, ry);
    }

    this.prevButtons = btns.map((b) => b.pressed);
  }
}
