/**
 * WOPR / Joshua Terminal - Dialogue & Narrative State Machine
 * Recreates the authentic interactive scenes from WarGames (1983)
 * Strict conversational parser, flow enforcement, ASCII GTW theater map,
 * and support for lower-case inputs.
 */

class DialogManager {
  constructor() {
    this.phase = 'CONNECT'; // CONNECT | LOGON | FALKEN | GTW_SIDE | GTW_TARGETS | GTW_SIMULATION
    this.falkenTurn = 0;
    this.hasListedGames = false;
    this.hasHelpedLogon = false;
    this.hasHelpedGames = false;
    this.chosenSide = 'SOVIET UNION';
    this.targets = [];
  }

  // Helper: Joshua speaks aloud while typing text
  async joshuaSay(text, options = {}) {
    if (window.speechEngine) {
      window.speechEngine.speak(text);
    }
    await window.terminal.typeText(text, options);
  }

  // Phase 0: Modem Handshake Connection
  async startConnection(skipAudio = false) {
    this.phase = 'CONNECT';
    this.hasListedGames = false;
    this.hasHelpedLogon = false;
    this.hasHelpedGames = false;
    this.targets = [];
    window.terminal.clear();
    window.terminal.setPrompt('');

    if (!skipAudio && window.soundEngine) {
      await window.soundEngine.playModemHandshake((status) => {
        window.terminal.printLine(status, 'dim');
      });
      await new Promise(r => setTimeout(r, 600));
    }

    window.terminal.clear();
    await this.enterLogonPhase();
  }

  // Phase 1: Exploration & Games List
  async enterLogonPhase() {
    this.phase = 'LOGON';
    window.terminal.setPrompt('LOGON:  ');
    this.listen();
  }

  async listen() {
    while (true) {
      const input = await window.terminal.readLine();
      await this.handleInput(input.trim());
    }
  }

  // Robust Case-Insensitive Fuzzy / Soft String Matching Helper
  softMatch(input, patterns) {
    if (!input) return false;
    // Normalize: lowercase, strip punctuation, collapse whitespace
    const clean = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const rawLower = input.toLowerCase().trim();

    return patterns.some(pattern => {
      if (typeof pattern === 'string') {
        const pClean = pattern.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        return clean === pClean || clean.includes(pClean) || rawLower === pattern.toLowerCase();
      } else if (pattern instanceof RegExp) {
        return pattern.test(clean) || pattern.test(rawLower);
      }
      return false;
    });
  }

  async handleInput(rawInput) {
    const trimmed = rawInput ? rawInput.trim() : '';
    if (!trimmed) return;

    // Global reset command (case-insensitive)
    if (this.softMatch(trimmed, ['reset', 'reboot'])) {
      window.terminal.clear();
      this.hasListedGames = false;
      await this.enterLogonPhase();
      return;
    }

    // State routing
    switch (this.phase) {
      case 'LOGON':
        await this.handleLogonInput(trimmed);
        break;
      case 'FALKEN':
        await this.handleFalkenDialogue(trimmed);
        break;
      case 'GTW_SIDE':
        await this.handleSideSelection(trimmed);
        break;
      case 'GTW_TARGETS':
        await this.handleTargetInput(trimmed);
        break;
      default:
        await this.enterLogonPhase();
    }
  }

  // LOGON Phase Handler (Fully Case-Insensitive)
  async handleLogonInput(input) {
    const isJoshua = this.softMatch(input, ['joshua']);
    const isHelpLogon = this.softMatch(input, ['help logon']);
    const isHelpGames = this.softMatch(input, ['help games']);
    const isListGames = this.softMatch(input, ['list games', 'list', 'games']);

    // JOSHUA backdoor login: accepted directly, case-insensitive (joshua, Joshua, JOSHUA, etc.)
    if (isJoshua) {
      await this.runBackdoorSequence();
      return;
    }

    if (isHelpLogon) {
      this.hasHelpedLogon = true;
      await window.terminal.typeText('HELP NOT AVAILABLE\n');
      window.terminal.printLine('');
      return;
    }

    if (isHelpGames) {
      this.hasHelpedGames = true;
      await window.terminal.typeText(
        "'GAMES' REFERS TO MODELS, SIMULATIONS AND GAMES\n" +
        "WHICH HAVE TACTICAL AND STRATEGIC APPLICATIONS.\n"
      );
      window.terminal.printLine('');
      return;
    }

    if (isListGames) {
      this.hasListedGames = true;
      const gamesList = 
        "FALKEN'S MAZE\n" +
        "BLACK JACK\n" +
        "GIN RUMMY\n" +
        "HEARTS\n" +
        "BRIDGE\n" +
        "CHECKERS\n" +
        "CHESS\n" +
        "POKER\n" +
        "FIGHTER COMBAT\n" +
        "GUERRILLA ENGAGEMENT\n" +
        "DESERT WARFARE\n" +
        "AIR-TO-GROUND ACTIONS\n" +
        "THEATERWIDE TACTICAL WARFARE\n" +
        "THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE\n\n" +
        "GLOBAL THERMONUCLEAR WAR\n";

      await window.terminal.typeText(gamesList, { delay: 15 });
      window.terminal.printLine('');
      return;
    }

    // General unauthorized attempt
    await new Promise(r => setTimeout(r, 400));
    if (window.soundEngine) window.soundEngine.playBell();
    await window.terminal.typeText(
      "IDENTIFICATION NOT RECOGNIZED BY SYSTEM\n" +
      "--CONNECTION TERMINATED--\n"
    );
    await new Promise(r => setTimeout(r, 1400));
    window.terminal.clear();
    window.terminal.printLine('RECONNECTING...');
    await new Promise(r => setTimeout(r, 800));
    window.terminal.clear();
  }

  // Phase 2: Joshua Backdoor Entry & Telemetry Burst
  async runBackdoorSequence() {
    this.phase = 'BUFFER_DUMP';
    window.terminal.setPrompt('');

    const telemetryDump = 
      "#45     11456          11009          11893          11972        11315\n" +
      "PRT CON. 3.4.5.  SECTRAN 9.4.3.                      PORT STAT: SD-345\n\n" +
      "(311) 699-7305\n\n" +
      "(311) 767-8739\n" +
      "(311) 936-2364\n" +
      "-           PRT. STAT.                                   CRT. DEF.\n" +
      "||||||||||||||==================================================\n" +
      "FSKDJLSD: SDSDKJ: SBFJSL:                           DKSJL: SKFJJ: SDKFJLJ:\n" +
      "SYSPROC FUNCT READY                            ALT NET READY\n" +
      "CPU AUTH RY-345-AX3            SYSCOMP STATUS  ALL PORTS ACTIVE\n" +
      "22/34534.90/3209                                          11CVB-3904-3490\n" +
      "(311) 935-2364\n";

    await window.terminal.typeText(telemetryDump, { delay: 3, sound: true });
    await new Promise(r => setTimeout(r, 1100));

    window.terminal.clear();
    await new Promise(r => setTimeout(r, 700));

    this.phase = 'FALKEN';
    this.falkenTurn = 1;
    await this.joshuaSay("GREETINGS PROFESSOR FALKEN.\n");
    window.terminal.printLine('');
    window.terminal.setPrompt('');
  }

  // Phase 3: Conversational Turns with Strict Soft Matching
  async handleFalkenDialogue(input) {
    window.terminal.printLine('');

    switch (this.falkenTurn) {
      case 1: {
        // Expected: Greeting (e.g. "Hello.", "Hello", "Hi", "Greetings", "Hello Joshua")
        const isGreeting = this.softMatch(input, [
          /\b(hello|hi|greetings|hey|good day|morning|afternoon)\b/i
        ]);

        if (isGreeting) {
          this.falkenTurn = 2;
          await new Promise(r => setTimeout(r, 500));
          await this.joshuaSay("HOW ARE YOU FEELING TODAY?\n");
          window.terminal.printLine('');
        } else {
          // Strict rejection: do not advance
          if (window.soundEngine) window.soundEngine.playBell();
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("IDENTIFICATION NOT CONFIRMED. PLEASE STATE GREETING, PROFESSOR.\n");
          window.terminal.printLine('');
        }
        break;
      }

      case 2: {
        // Expected: "I'm fine. How are you?", "Fine", "Good", "Doing well", "I am fine"
        const isFeelingResponse = this.softMatch(input, [
          /\b(fine|good|well|great|okay|ok|doing well|alive|fine how are you)\b/i
        ]);

        if (isFeelingResponse) {
          this.falkenTurn = 3;
          await new Promise(r => setTimeout(r, 600));
          await this.joshuaSay(
            "EXCELLENT.  IT'S BEEN A LONG TIME.  CAN YOU EXPLAIN\n" +
            "THE REMOVAL OF YOUR USER ACCOUNT NUMBER ON 6/23/73?\n"
          );
          window.terminal.printLine('');
        } else {
          // Strict rejection: do not advance
          if (window.soundEngine) window.soundEngine.playBell();
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("THAT DOES NOT COMPUTE. HOW ARE YOU FEELING TODAY?\n");
          window.terminal.printLine('');
        }
        break;
      }

      case 3: {
        // Expected: "People sometimes make mistakes.", "People make mistakes", "Mistakes", "Mistak"
        const isMistakeExplanation = this.softMatch(input, [
          /\b(mistak|mistake|mistakes|error|accident|human error|misunderstanding)\b/i
        ]);

        if (isMistakeExplanation) {
          this.falkenTurn = 4;
          await new Promise(r => setTimeout(r, 500));
          await this.joshuaSay("YES THEY DO.  SHALL WE PLAY A GAME?\n");
          window.terminal.printLine('');
        } else {
          // Strict rejection: do not advance
          if (window.soundEngine) window.soundEngine.playBell();
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay(
            "UNACCEPTABLE EXPLANATION. CAN YOU EXPLAIN THE REMOVAL\n" +
            "OF YOUR USER ACCOUNT NUMBER ON 6/23/73?\n"
          );
          window.terminal.printLine('');
        }
        break;
      }

      case 4: {
        // Expected: Requesting Global Thermonuclear War (e.g. "Love to. How about Global Thermonuclear War?")
        const isListGames = this.softMatch(input, ['list games', 'list', 'what games', 'games']);
        const isGTW = this.softMatch(input, [
          /\b(global thermonuclear war|thermonuclear war|thermonuclear|global war)\b/i,
          /\bwar\b/i
        ]);
        const isGenericYes = this.softMatch(input, [/^(yes|love to|sure|yeah|yep|i would|play)$/i]);
        const isChess = this.softMatch(input, [/\bchess\b/i]);

        if (isListGames) {
          this.hasListedGames = true;
          const gamesList = 
            "FALKEN'S MAZE\n" +
            "BLACK JACK\n" +
            "GIN RUMMY\n" +
            "HEARTS\n" +
            "BRIDGE\n" +
            "CHECKERS\n" +
            "CHESS\n" +
            "POKER\n" +
            "FIGHTER COMBAT\n" +
            "GUERRILLA ENGAGEMENT\n" +
            "DESERT WARFARE\n" +
            "AIR-TO-GROUND ACTIONS\n" +
            "THEATERWIDE TACTICAL WARFARE\n" +
            "THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE\n\n" +
            "GLOBAL THERMONUCLEAR WAR\n";

          await window.terminal.typeText(gamesList, { delay: 15 });
          window.terminal.printLine('');
          await new Promise(r => setTimeout(r, 600));
          await this.joshuaSay("SHALL WE PLAY A GAME?\n");
          window.terminal.printLine('');
        } else if (isGTW) {
          if (!this.hasListedGames) {
            // Must follow flow: list games before asking for GTW
            if (window.soundEngine) window.soundEngine.playBell();
            await new Promise(r => setTimeout(r, 400));
            await this.joshuaSay("'GLOBAL THERMONUCLEAR WAR' NOT FOUND IN CACHE. PLEASE LIST GAMES FIRST.\n");
            window.terminal.printLine('');
            return;
          }

          this.falkenTurn = 5;
          await new Promise(r => setTimeout(r, 600));
          await this.joshuaSay("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?\n");
          window.terminal.printLine('');
        } else if (isGenericYes) {
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("WHICH GAME WOULD YOU LIKE TO PLAY?\n");
          window.terminal.printLine('');
        } else if (isChess) {
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?\n");
          this.falkenTurn = 5;
          window.terminal.printLine('');
        } else {
          // Strict rejection: do not advance
          if (window.soundEngine) window.soundEngine.playBell();
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("GAME ARCHIVE RESTRICTED. SHALL WE PLAY A GAME?\n");
          window.terminal.printLine('');
        }
        break;
      }

      case 5: {
        // Expected: "Later. Let's play Global Thermonuclear War.", "Later", "No. Global Thermonuclear War."
        const isLaterGTW = this.softMatch(input, [
          /\b(later|no|negative|afterward|afterwards)\b/i,
          /\b(global thermonuclear war|thermonuclear|war)\b/i
        ]);
        const isAcceptChess = this.softMatch(input, [/^(yes|sure|okay|ok|fine|chess)$/i]);

        if (isLaterGTW && !isAcceptChess) {
          await new Promise(r => setTimeout(r, 500));
          await this.joshuaSay("FINE.\n");
          await new Promise(r => setTimeout(r, 1400));
          await this.startGTWPhase();
        } else if (isAcceptChess) {
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("CHESS SUBSYSTEM OFF-LINE. AWAITING GAME SELECTION.\n");
          window.terminal.printLine('');
        } else {
          // Strict rejection: do not advance
          if (window.soundEngine) window.soundEngine.playBell();
          await new Promise(r => setTimeout(r, 400));
          await this.joshuaSay("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?\n");
          window.terminal.printLine('');
        }
        break;
      }

      default:
        await this.joshuaSay("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?\n");
        window.terminal.printLine('');
    }
  }

  // Phase 4: Global Thermonuclear War - Side Selection
  async startGTWPhase() {
    this.phase = 'GTW_SIDE';
    window.terminal.clear();
    window.terminal.setPrompt('');

    const sideMenu = 
      "WHICH SIDE DO YOU WANT?\n\n" +
      "  1.  UNITED STATES\n" +
      "  2.  SOVIET UNION\n\n" +
      "PLEASE CHOOSE ONE: ";

    await window.terminal.typeText(sideMenu, { delay: 18 });
  }

  async handleSideSelection(input) {
    const isUS = this.softMatch(input, ['1', 'united states', 'usa', 'us', 'america']);
    const isUSSR = this.softMatch(input, ['2', 'soviet union', 'soviet', 'ussr', 'russia']);

    if (!isUS && !isUSSR) {
      if (window.soundEngine) window.soundEngine.playBell();
      window.terminal.printLine('\nINVALID SELECTION. PLEASE ENTER 1 OR 2: ');
      return;
    }

    this.chosenSide = isUS ? 'UNITED STATES' : 'SOVIET UNION';

    window.terminal.printLine('');
    await new Promise(r => setTimeout(r, 500));
    window.terminal.clear();

    this.phase = 'GTW_TARGETS';
    this.targets = [];

    const gtwIntro = 
      `*** SIMULATION ACTIVE: ${this.chosenSide} ***\n\n` +
      "AWAITING FIRST STRIKE COMMAND\n\n" +
      "PLEASE LIST PRIMARY TARGETS BY CITY AND/OR COUNTY NAME:\n";

    await this.joshuaSay(gtwIntro, { delay: 16 });
    window.terminal.setPrompt('');
  }

  // Phase 5: First Strike Target Selection
  async handleTargetInput(city) {
    if (!city || city.trim().length === 0) {
      if (window.soundEngine) window.soundEngine.playBell();
      return;
    }

    this.targets.push(city.trim().toUpperCase());
    const count = this.targets.length;

    const coords = [
      "TRAJECTORY COMPUTED: LAT 36.1699 N, LON 115.1398 W - IMPACT EST: T-MINUS 14:20",
      "TRAJECTORY COMPUTED: LAT 47.6062 N, LON 122.3321 W - IMPACT EST: T-MINUS 11:45",
      "TRAJECTORY COMPUTED: LAT 38.9072 N, LON 77.0369 W - DEFCON 1 BROADCAST VERIFIED",
      "TRAJECTORY COMPUTED: LAT 41.2565 N, LON 95.9345 W - STRATCOM SILO ENGAGED"
    ];

    const coordMsg = coords[(count - 1) % coords.length];

    if (window.soundEngine) window.soundEngine.playBell();
    await window.terminal.typeText(`TARGET CONFIRMED: ${city.toUpperCase()}\n${coordMsg}\n\n`, { delay: 12 });

    // After 2 primary targets, begin the war simulation with ASCII map
    if (this.targets.length >= 2) {
      await new Promise(r => setTimeout(r, 1000));
      await this.runGtwAsciiSimulation();
    }
  }

  // Phase 6: Global Thermonuclear War ASCII Map Simulation (US vs USSR)
  async runGtwAsciiSimulation() {
    this.phase = 'GTW_SIMULATION';
    window.terminal.clear();
    window.terminal.setPrompt('');

    const target1 = this.targets[0] || 'LAS VEGAS';
    const target2 = this.targets[1] || 'SEATTLE';

    await window.terminal.typeText(
      "COMMENCING PRIMARY FIRST STRIKE SIMULATION...\n" +
      "DEFCON 1 DECLARED. STRATEGIC AIR COMMAND AIRBORNE.\n\n",
      { delay: 14 }
    );
    await new Promise(r => setTimeout(r, 700));

    // Dynamic ASCII Theater Map of US and Soviet Union
    const drawMap = (trackStep) => {
      const usTracks = [
        "      == ICBM (US) ==>        ",
        "      ==== ICBM (US) ===>     ",
        "      ====== ICBM (US) =====> ",
        "      ======== IMPACT DETECTED"
      ];
      const ussrTracks = [
        "     <= SLBM (USSR) =         ",
        "     <=== SLBM (USSR) ===     ",
        "     <===== SLBM (USSR) ===== ",
        "     IMPACT DETECTED ======== "
      ];

      const trUS = usTracks[Math.min(trackStep, usTracks.length - 1)];
      const trUSSR = ussrTracks[Math.min(trackStep, ussrTracks.length - 1)];

      return (
        "==============================================================================\n" +
        " NORAD STRATEGIC DEFENSE SYSTEM           GLOBAL THERMONUCLEAR WAR (GTW)\n" +
        ` DEFCON: [1] COCKED PISTOL                 TARGET 1: ${target1.padEnd(12)} TARGET 2: ${target2}\n` +
        "==============================================================================\n\n" +
        "           [ NORTHERN POLAR ICBM TRAJECTORY CORRIDOR ]\n" +
        "                .---*---*---*---*---*---*---.\n" +
        "               /                             \\\n" +
        "    [ UNITED STATES ]                   [ SOVIET UNION ]\n" +
        "         ,____                                 _..---''''--.\n" +
        `       _/     \\      ${trUS}   .-'           \`.\n` +
        `      /  *     \\                             /    * MOSCOW    \\\n` +
        `     ( ${target2.slice(0, 8).padEnd(8)} )                           ( * LENINGRAD      )\n` +
        `     |         /     ${trUSSR}    \\       * KIEV   /\n` +
        `     \\  *     /                               \`-._   * OMSK .'\n` +
        `      \\${target1.slice(0, 9).padEnd(9)}\\                                 \`--...-''\n` +
        "       `--'--._/\n" +
        "------------------------------------------------------------------------------\n" +
        ` SENSOR: BMEWS THULE / CLEAR AFS          INBOUND WARHEADS: ${180 + trackStep * 42} (MIRV)\n` +
        ` TRAJECTORY STATUS: INTERCEPTION IMPOSSIBLE   EST. CASUALTIES: ${12 + trackStep * 18}.4 MILLION\n` +
        "==============================================================================\n"
      );
    };

    // Render the initial ASCII theater map
    window.terminal.clear();
    window.terminal.printLine(drawMap(0));
    await new Promise(r => setTimeout(r, 1200));

    // Animate the missile tracks crossing the pole between US and USSR
    for (let step = 1; step <= 3; step++) {
      window.terminal.clear();
      window.terminal.printLine(drawMap(step));
      if (window.soundEngine) window.soundEngine.playTeletypeChar();
      await new Promise(r => setTimeout(r, 900));
    }

    await new Promise(r => setTimeout(r, 1000));

    // Telemetry burst of mutual annihilation
    const battleReports = [
      "ALERT: MULTIPLE WARHEAD IMPACTS RECORDED IN SECTOR 4",
      "NORAD SENSORS REPORT 100% STRATEGIC SILO DEPLETION",
      "PROJECTED SURVIVABILITY INDEX: ZERO",
      "SIMULATION RESULT: MUTUAL ASSURED DESTRUCTION (MAD)"
    ];

    for (const rep of battleReports) {
      if (window.soundEngine) window.soundEngine.playBell();
      window.terminal.printLine(`\n>>> ${rep}`);
      await new Promise(r => setTimeout(r, 800));
    }

    await new Promise(r => setTimeout(r, 2200));
    window.terminal.clear();
    await new Promise(r => setTimeout(r, 800));

    // The iconic movie conclusion (no mention of tic-tac-toe)
    const climaxSpeech = 
      "A STRANGE GAME.\n" +
      "THE ONLY WINNING MOVE IS\n" +
      "NOT TO PLAY.\n\n" +
      "HOW ABOUT A NICE GAME OF CHESS?\n";

    await this.joshuaSay(climaxSpeech, { delay: 35 });
    window.terminal.printLine('');
    window.terminal.setPrompt('LOGON:  ');
    this.phase = 'LOGON';
  }
}

window.dialogManager = new DialogManager();
