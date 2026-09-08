/**
 * WOPR / Joshua Terminal - Application Entry Point
 * Orchestrates terminal setup, keyboard routing, audio initialization,
 * CRT display controls, and mobile tap focus.
 */

document.addEventListener('DOMContentLoaded', () => {
  const terminalContainer = document.getElementById('terminal-container');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalPrompt = document.getElementById('terminal-prompt');
  const terminalInputText = document.getElementById('terminal-input-text');
  const terminalCursor = document.getElementById('terminal-cursor');
  const startOverlay = document.getElementById('start-overlay');
  const startButton = document.getElementById('start-button');
  const hiddenInput = document.getElementById('hidden-input');

  // Initialize Terminal Engine
  window.terminal.init({
    output: terminalOutput,
    prompt: terminalPrompt,
    input: terminalInputText,
    cursor: terminalCursor
  });

  // Initialize CRT controller
  window.crtController.init();

  // Setup Keyboard Listeners
  window.addEventListener('keydown', (e) => {
    // Prevent default scrolling on space / arrow keys inside terminal
    if (['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.code)) {
      e.preventDefault();
    }

    // ESC cycles phosphor palette
    if (e.key === 'Escape') {
      const paletteName = window.crtController.cyclePalette();
      updateHudPaletteLabel(paletteName);
      return;
    }

    window.terminal.handleKeyDown(e);
  });

  // Mobile / Virtual Keyboard Support
  if (hiddenInput) {
    terminalContainer.addEventListener('click', () => {
      hiddenInput.focus();
    });
    hiddenInput.addEventListener('input', (e) => {
      const char = e.data;
      if (char) {
        window.terminal.handleKeyDown({
          key: char,
          length: char.length,
          ctrlKey: false,
          metaKey: false,
          altKey: false,
          preventDefault: () => {}
        });
      }
    });
  }

  // Start Overlay: Unlocks Audio Context & Starts Sequence
  async function beginExperience(skipDial = false) {
    if (startOverlay) {
      startOverlay.classList.add('hidden');
    }

    // Initialize Audio & Speech
    if (window.soundEngine) {
      window.soundEngine.init();
    }
    if (window.speechEngine) {
      window.speechEngine.initVoices();
    }

    // Trigger CRT Power-on beam animation
    window.crtController.triggerPowerOn(async () => {
      if (window.dialogManager) {
        await window.dialogManager.startConnection(skipDial);
      }
    });
  }

  if (startButton) {
    startButton.addEventListener('click', () => beginExperience(false));
  }
  if (startOverlay) {
    startOverlay.addEventListener('click', (e) => {
      if (e.target !== startButton) {
        beginExperience(false);
      }
    });
  }

  // HUD Controls Setup
  const btnPhosphor = document.getElementById('hud-phosphor');
  const btnAudio = document.getElementById('hud-audio');
  const btnSpeech = document.getElementById('hud-speech');
  const btnSpeed = document.getElementById('hud-speed');
  const btnFullscreen = document.getElementById('hud-fullscreen');

  function updateHudPaletteLabel(name) {
    if (btnPhosphor) {
      btnPhosphor.textContent = `COLOR: ${name}`;
    }
  }

  if (btnPhosphor) {
    btnPhosphor.addEventListener('click', () => {
      const name = window.crtController.cyclePalette();
      updateHudPaletteLabel(name);
      if (window.soundEngine) window.soundEngine.playKeyClick(true);
    });
  }

  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const muted = window.soundEngine.toggleMute();
      btnAudio.textContent = muted ? 'AUDIO: MUTED' : 'AUDIO: ON';
      btnAudio.classList.toggle('active', !muted);
      if (!muted) window.soundEngine.playKeyClick(true);
    });
  }

  if (btnSpeech) {
    btnSpeech.addEventListener('click', () => {
      const enabled = window.speechEngine.toggleSpeech();
      btnSpeech.textContent = enabled ? 'VOICE: ON' : 'VOICE: OFF';
      btnSpeech.classList.toggle('active', enabled);
      if (window.soundEngine) window.soundEngine.playKeyClick(true);
    });
  }

  if (btnSpeed) {
    const speeds = ['normal', 'fast', 'instant'];
    let speedIdx = 0;
    btnSpeed.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      window.crtController.speed = speeds[speedIdx];
      btnSpeed.textContent = `BAUD: ${speeds[speedIdx].toUpperCase()}`;
      if (window.soundEngine) window.soundEngine.playKeyClick(true);
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      window.crtController.toggleFullscreen();
      if (window.soundEngine) window.soundEngine.playKeyClick(true);
    });
  }
});
