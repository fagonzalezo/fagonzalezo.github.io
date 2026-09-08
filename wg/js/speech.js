/**
 * WOPR / Joshua Terminal - Speech Synthesis Engine
 * Emulates the 1983 Joshua / WOPR speech vocalizer using Web Speech API.
 */

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isEnabled = true;
    this.selectedVoice = null;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const maleNames = [
        'Alex', 'Fred', 'Bruce', 'Ralph', 'Daniel', 'David', 
        'Oliver', 'George', 'Tom', 'Evan', 'Nathan', 'Guy', 
        'Google UK English Male', 'Microsoft David', 'Microsoft Mark'
      ];

      const femaleNames = [
        'Samantha', 'Victoria', 'Karen', 'Moira', 'Fiona', 'Tessa', 
        'Zira', 'Susan', 'Hazel', 'Linda', 'Jenny', 'Ava', 'Allison', 
        'Google US English', 'Google UK English Female', 'Kate', 'Serena', 
        'Veena', 'Kyoko', 'Sin-ji', 'Yuna', 'Ting-Ting'
      ];

      // 1. Check for specific preferred male names
      let match = voices.find(v => 
        maleNames.some(name => v.name.toLowerCase().includes(name.toLowerCase()))
      );

      // 2. Check for voices with 'male' in their name (excluding 'female')
      if (!match) {
        match = voices.find(v => {
          const lower = v.name.toLowerCase();
          return lower.includes('male') && !lower.includes('female');
        });
      }

      // 3. Fall back to any English voice that is NOT in the female list
      if (!match) {
        match = voices.find(v => 
          v.lang.startsWith('en') && 
          !femaleNames.some(f => v.name.toLowerCase().includes(f.toLowerCase()))
        );
      }

      // 4. Fallback to first available
      this.selectedVoice = match || voices[0];
      console.log('Selected WOPR Voice:', this.selectedVoice ? this.selectedVoice.name : 'Default');
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  toggleSpeech() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && this.synth) {
      this.synth.cancel();
    }
    return this.isEnabled;
  }

  speak(text, onComplete) {
    if (!this.isEnabled || !this.synth) {
      if (onComplete) onComplete();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech

      // Clean punctuation for speech rhythm
      const speechText = text
        .replace(/#\d+/g, '')
        .replace(/\(\d{3}\)\s*\d{3}-\d{4}/g, '')
        .trim();

      if (!speechText) {
        if (onComplete) onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(speechText);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      // WOPR synthesizer profile: deeper male pitch, slightly slower, flat cadence
      utterance.pitch = 0.65;
      utterance.rate = 0.88;
      utterance.volume = 1.0;

      utterance.onend = () => {
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.warn('Speech error:', e);
        if (onComplete) onComplete();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech engine exception:', e);
      if (onComplete) onComplete();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

window.speechEngine = new SpeechEngine();
