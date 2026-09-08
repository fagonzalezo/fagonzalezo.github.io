/**
 * WOPR / Joshua Terminal - Procedural Web Audio Synthesizer
 * Generates mechanical keyboard clicks, terminal bells, rotary pulses,
 * and acoustic coupler modem carrier handshakes in real-time.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.8;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Mechanical Keystroke Sound (IMSAI IKB-1 Mechanical Switch)
  playKeyClick(isSpecial = false) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. High frequency mechanical switch click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = isSpecial ? 650 : 1200 + (Math.random() * 400 - 200);
      osc.type = isSpecial ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      gain.gain.setValueAtTime(this.volume * (isSpecial ? 0.35 : 0.22), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpecial ? 0.045 : 0.028));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // 2. Plastic housing body resonance
      const bufferSize = this.ctx.sampleRate * 0.015;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = isSpecial ? 800 : 1800;
      filter.Q.value = 3;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(this.volume * (isSpecial ? 0.25 : 0.15), now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.03);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Vintage 800Hz Terminal Bell / Piezo Buzzer
  playBell() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Bell audio error:', e);
    }
  }

  // Teletype Character Chime / Typing Click
  playTeletypeChar() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.012);

      gain.gain.setValueAtTime(this.volume * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {
      // Ignored for high-frequency teletype clicks
    }
  }

  // Acoustic Coupler Modem Dialing & Handshake Sequence
  async playModemHandshake(onProgress) {
    if (!this.ctx) this.init();
    if (this.isMuted) {
      if (onProgress) onProgress('CONNECTED');
      return;
    }

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // 1. Off-hook click
      this.playKeyClick(true);
      if (onProgress) onProgress('OFF HOOK...');
      await wait(400);

      // 2. Rotary Dial Pulses
      if (onProgress) onProgress('DIALING (311) 767-8739...');
      const pulseCounts = [3, 1, 1, 7, 6, 7];
      for (const count of pulseCounts) {
        for (let p = 0; p < count; p++) {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(700, now);
          gain.gain.setValueAtTime(this.volume * 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          await wait(60);
        }
        await wait(180);
      }

      // 3. Ring tone
      if (onProgress) onProgress('RINGING...');
      for (let r = 0; r < 2; r++) {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        gain.gain.setValueAtTime(this.volume * 0.12, now);
        gain.gain.setValueAtTime(this.volume * 0.12, now + 0.8);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.85);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);

        await wait(1200);
      }

      // 4. Remote Answer & Carrier Tone (2225 Hz answer tone)
      if (onProgress) onProgress('CARRIER DETECTED...');
      const answerNow = this.ctx.currentTime;
      const carrierOsc = this.ctx.createOscillator();
      const carrierGain = this.ctx.createGain();

      carrierOsc.type = 'sine';
      carrierOsc.frequency.setValueAtTime(2225, answerNow);
      carrierGain.gain.setValueAtTime(this.volume * 0.22, answerNow);
      carrierGain.gain.linearRampToValueAtTime(this.volume * 0.22, answerNow + 0.9);
      carrierGain.gain.linearRampToValueAtTime(0.001, answerNow + 1.2);

      carrierOsc.connect(carrierGain);
      carrierGain.connect(this.ctx.destination);

      carrierOsc.start(answerNow);
      carrierOsc.stop(answerNow + 1.3);

      await wait(1000);

      // 5. 1200/300 Baud FSK Handshake Chirp & Static
      if (onProgress) onProgress('HANDSHAKE NEGOTIATION 1200 BAUD...');
      const handshakeNow = this.ctx.currentTime;
      const fskOsc = this.ctx.createOscillator();
      const fskGain = this.ctx.createGain();

      fskOsc.type = 'sawtooth';
      fskOsc.frequency.setValueAtTime(1200, handshakeNow);
      fskOsc.frequency.linearRampToValueAtTime(2400, handshakeNow + 0.2);
      fskOsc.frequency.linearRampToValueAtTime(1070, handshakeNow + 0.5);
      fskOsc.frequency.linearRampToValueAtTime(1270, handshakeNow + 0.8);

      fskGain.gain.setValueAtTime(this.volume * 0.18, handshakeNow);
      fskGain.gain.exponentialRampToValueAtTime(0.001, handshakeNow + 0.9);

      fskOsc.connect(fskGain);
      fskGain.connect(this.ctx.destination);

      fskOsc.start(handshakeNow);
      fskOsc.stop(handshakeNow + 0.95);

      await wait(950);

      if (onProgress) onProgress('CARRIER ESTABLISHED.');
      await wait(300);

    } catch (e) {
      console.warn('Modem sequence error:', e);
    }
  }
}

window.soundEngine = new SoundEngine();
