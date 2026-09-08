/**
 * WOPR / Joshua Terminal - Teletype Terminal Engine
 * Emulates vintage 80x24 teletype character streaming,
 * prompt management, line editor, history, and block cursor.
 */

class TerminalEngine {
  constructor() {
    this.outputElement = null;
    this.promptElement = null;
    this.inputElement = null;
    this.cursorElement = null;

    this.currentInput = '';
    this.history = [];
    this.historyIndex = -1;
    this.isInputActive = false;
    this.isPrinting = false;
    this.inputResolver = null;

    this.promptText = 'LOGON:  ';
  }

  init(domElements) {
    this.outputElement = domElements.output;
    this.promptElement = domElements.prompt;
    this.inputElement = domElements.input;
    this.cursorElement = domElements.cursor;

    this.setPrompt(this.promptText);
    this.showCursor(true);
  }

  setPrompt(str) {
    this.promptText = str;
    if (this.promptElement) {
      this.promptElement.textContent = str;
    }
  }

  showCursor(show) {
    if (this.cursorElement) {
      if (show) {
        this.cursorElement.classList.remove('hidden');
      } else {
        this.cursorElement.classList.add('hidden');
      }
    }
  }

  clear() {
    if (this.outputElement) {
      this.outputElement.innerHTML = '';
    }
    this.currentInput = '';
    if (this.inputElement) {
      this.inputElement.textContent = '';
    }
  }

  // Print text line immediately
  printLine(text = '', className = '') {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.textContent = text;
    this.outputElement.appendChild(line);
    this.scrollToBottom();
    return line;
  }

  // Stream text character by character like a vintage serial teletype
  async typeText(text, options = {}) {
    this.isPrinting = true;
    this.showCursor(false);

    const lines = text.split('\n');
    for (let li = 0; li < lines.length; li++) {
      const lineStr = lines[li];
      const lineElem = document.createElement('div');
      lineElem.className = 'terminal-line' + (options.className ? ' ' + options.className : '');
      this.outputElement.appendChild(lineElem);

      for (let ci = 0; ci < lineStr.length; ci++) {
        const ch = lineStr[ci];
        lineElem.textContent += ch;
        this.scrollToBottom();

        if (window.soundEngine && options.sound !== false) {
          window.soundEngine.playTeletypeChar();
        }

        const delay = options.instant ? 0 : (options.delay || window.crtController.getCharDelay());
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
      }

      if (options.lineDelay && li < lines.length - 1) {
        await new Promise(r => setTimeout(r, options.lineDelay));
      }
    }

    this.isPrinting = false;
    this.showCursor(true);
  }

  scrollToBottom() {
    if (this.outputElement) {
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
  }

  // Await next user line input
  readLine() {
    return new Promise((resolve) => {
      this.currentInput = '';
      if (this.inputElement) this.inputElement.textContent = '';
      this.isInputActive = true;
      this.inputResolver = resolve;
      this.showCursor(true);
    });
  }

  handleKeyDown(e) {
    if (!this.isInputActive || this.isPrinting) return;

    // Key handling
    if (e.key === 'Enter') {
      e.preventDefault();
      const submitted = this.currentInput;

      if (window.soundEngine) {
        window.soundEngine.playKeyClick(true);
      }

      // Echo line into output history
      this.printLine(this.promptText + submitted);

      // Save history
      if (submitted.trim()) {
        this.history.push(submitted);
        this.historyIndex = this.history.length;
      }

      this.currentInput = '';
      if (this.inputElement) this.inputElement.textContent = '';
      this.isInputActive = false;

      if (this.inputResolver) {
        const resolve = this.inputResolver;
        this.inputResolver = null;
        resolve(submitted);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentInput.length > 0) {
        this.currentInput = this.currentInput.slice(0, -1);
        if (this.inputElement) this.inputElement.textContent = this.currentInput;
        if (window.soundEngine) window.soundEngine.playKeyClick(false);
      } else {
        if (window.soundEngine) window.soundEngine.playBell();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput = this.history[this.historyIndex];
        if (this.inputElement) this.inputElement.textContent = this.currentInput;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentInput = this.history[this.historyIndex];
        if (this.inputElement) this.inputElement.textContent = this.currentInput;
      } else {
        this.historyIndex = this.history.length;
        this.currentInput = '';
        if (this.inputElement) this.inputElement.textContent = '';
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      // Allow entering lower case / mixed case characters as typed by the user
      this.currentInput += e.key;
      if (this.inputElement) this.inputElement.textContent = this.currentInput;

      if (window.soundEngine) {
        const isSpace = e.key === ' ';
        window.soundEngine.playKeyClick(isSpace);
      }
    }
  }
}

window.terminal = new TerminalEngine();
