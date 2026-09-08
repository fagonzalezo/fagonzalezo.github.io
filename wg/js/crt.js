/**
 * WOPR / Joshua Terminal - CRT Display Controller
 * Manages phosphor palettes (P4 White, P31 Green, P22 Amber),
 * scanlines, barrel distortion, power animations, and viewport scaling.
 */

class CRTController {
  constructor() {
    this.palettes = ['theme-p4', 'theme-p31', 'theme-p22'];
    this.currentPaletteIndex = 0; // 0: P4 White (film authentic default)
    this.speed = 'normal'; // normal (~300-600 baud), fast (~1200 baud), max (instant)
    this.isPoweredOn = false;
  }

  init() {
    this.applyPalette();
  }

  cyclePalette() {
    this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.palettes.length;
    this.applyPalette();
    return this.getPaletteName();
  }

  setPalette(name) {
    const idx = this.palettes.indexOf(name);
    if (idx !== -1) {
      this.currentPaletteIndex = idx;
      this.applyPalette();
    }
  }

  applyPalette() {
    document.body.classList.remove('theme-p31', 'theme-p4', 'theme-p22');
    const activeTheme = this.palettes[this.currentPaletteIndex];
    document.body.classList.add(activeTheme);
  }

  getPaletteName() {
    switch (this.palettes[this.currentPaletteIndex]) {
      case 'theme-p31': return 'P31 GREEN';
      case 'theme-p22': return 'P22 AMBER';
      default: return 'P4 MONOCHROME';
    }
  }

  triggerPowerOn(callback) {
    const screen = document.querySelector('.crt-screen');
    const led = document.querySelector('.bezel-power-led');
    
    if (led) led.classList.add('on');
    if (screen) {
      screen.classList.remove('power-on-flash');
      void screen.offsetWidth; // Force reflow
      screen.classList.add('power-on-flash');
    }

    this.isPoweredOn = true;
    if (callback) setTimeout(callback, 650);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      return true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      return false;
    }
  }

  getCharDelay() {
    switch (this.speed) {
      case 'fast': return 12 + Math.random() * 8; // ~1200 baud
      case 'instant': return 0;
      case 'normal':
      default:
        return 28 + Math.random() * 22; // ~300-600 baud teletype with micro-jitter
    }
  }
}

window.crtController = new CRTController();
