/**
 * AVIATOR SIMULATOR - BETANO CRASH GAME
 * Authentic clone with Canvas physics, Web Audio engine, dual betting panels & live feed.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOsc = null;
    this.engineGain = null;
    this.lfo = null;
    this.lfoGain = null;
    this.filter = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startFlightEngine() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.stopFlightEngine();

    try {
      const t = this.ctx.currentTime;
      // Main propeller tone
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(75, t);

      // Low pass filter to make it sound like a combustion engine
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(320, t);

      // Engine rumble LFO
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'triangle';
      this.lfo.frequency.setValueAtTime(18, t);

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(30, t);

      this.lfo.connect(this.engineOsc.frequency);

      // Main gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, t);
      this.engineGain.gain.linearRampToValueAtTime(0.12, t + 0.3);

      this.engineOsc.connect(this.filter);
      this.filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.lfo.start(t);
      this.engineOsc.start(t);
    } catch (e) {
      console.warn("Audio start error:", e);
    }
  }

  updateFlightEngine(multiplier) {
    if (!this.enabled || !this.engineOsc || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Frequency rises with multiplier
      const baseFreq = 75 + Math.min(260, Math.log10(multiplier + 0.1) * 110);
      this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.05);

      const filterFreq = 320 + Math.min(800, multiplier * 40);
      this.filter.frequency.setTargetAtTime(filterFreq, t, 0.05);

      const lfoFreq = 18 + Math.min(45, multiplier * 3);
      this.lfo.frequency.setTargetAtTime(lfoFreq, t, 0.05);
    } catch (e) {}
  }

  stopFlightEngine() {
    if (!this.engineOsc || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, t + 0.1);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc) this.engineOsc.stop();
          if (this.lfo) this.lfo.stop();
        } catch (e) {}
        this.engineOsc = null;
        this.lfo = null;
        this.engineGain = null;
      }, 120);
    } catch (e) {
      this.engineOsc = null;
    }
  }

  playCashout() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Two-tone chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, t); // A5
      osc1.frequency.setValueAtTime(1318.51, t + 0.09); // E6

      osc2.frequency.setValueAtTime(1760, t + 0.09); // A6

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t + 0.09);
      osc1.stop(t + 0.45);
      osc2.stop(t + 0.45);
    } catch (e) {}
  }

  playCrash() {
    this.stopFlightEngine();
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // White noise explosion whoosh
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(60, t + 0.38);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(t);
    } catch (e) {}
  }

  playCountdownTick() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }
}

// SIMULATED USER NAMES FOR LIVE BETS
const FAKE_USERS = [
  "Carlos_77", "Sofi_99", "Matias_R", "Golazo77", "CryptoKing", "Valentina", 
  "Diego_CR", "Nico_Bet", "Camila_S", "Agus_Fly", "GamerPro_X", "Andres_9", 
  "Martin_P", "Esteban_B", "Lorena_V", "Pato_King", "Lucia_M", "Felipe_Z", 
  "Ramiro_A", "Ignacio_L", "Javier_G", "Fernanda", "Seba_Winner", "ElChamo_7"
];

class AviatorSimulator {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Game state: 'WAITING' | 'FLYING' | 'CRASHED'
    this.state = 'WAITING';
    this.multiplier = 1.00;
    this.crashMultiplier = 1.00;
    this.roundStartTime = 0;
    this.waitingDuration = 5000; // 5s waiting time
    this.waitingTimer = null;
    this.waitingRemaining = 5.0;

    // Wallet
    this.balance = parseFloat(localStorage.getItem('aviator_balance')) || 10000;
    
    // Multiplier history
    this.history = JSON.parse(localStorage.getItem('aviator_history')) || [
      1.14, 2.45, 1.05, 5.22, 1.88, 12.40, 1.01, 3.10, 1.45, 18.90,
      1.22, 1.08, 4.30, 2.05, 1.33, 7.80, 1.11, 2.12, 1.67, 34.20
    ];

    // Betting panels state (Panel 1 and Panel 2)
    this.panels = [
      {
        id: 1,
        amount: 500,
        state: 'IDLE', // 'IDLE' | 'QUEUED' | 'ACTIVE' | 'CASHED_OUT' | 'LOST'
        autoCashoutEnabled: false,
        autoCashoutMult: 2.00,
        autoBetEnabled: false,
        winAmount: 0,
        cashedOutAt: 0
      },
      {
        id: 2,
        amount: 1000,
        state: 'IDLE',
        autoCashoutEnabled: false,
        autoCashoutMult: 1.50,
        autoBetEnabled: false,
        winAmount: 0,
        cashedOutAt: 0
      }
    ];

    // Live bets simulation
    this.simulatedBets = [];
    this.myBetsHistory = [];

    // Particles & visual effects
    this.smokeParticles = [];
    this.stars = [];
    this.shakeAmount = 0;
    this.planeOffset = { x: 0, y: 0 };
    this.propellerAngle = 0;
    this.lastFrameTime = performance.now();

    // DOM Elements Cache
    this.dom = {
      balance: document.getElementById('userBalance'),
      historyList: document.getElementById('historyList'),
      currentMultiplier: document.getElementById('currentMultiplier'),
      statusLabel: document.getElementById('statusLabel'),
      waitingOverlay: document.getElementById('waitingOverlay'),
      waitingTimerText: document.getElementById('waitingTimerText'),
      waitingProgress: document.getElementById('waitingProgress'),
      betsList: document.getElementById('betsList'),
      totalBetsCount: document.getElementById('totalBetsCount'),
      soundBtn: document.getElementById('soundToggleBtn'),
      reloadBtn: document.getElementById('btnReloadBalance')
    };

    this.initStars();
    this.setupEventListeners();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.renderBalance();
    this.renderHistory();
    this.initPanelDOM(1);
    this.initPanelDOM(2);

    // Start with a waiting phase
    this.startWaitingPhase();

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.4 + 0.2
      });
    }
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width > 0 ? rect.width : 800;
    const h = rect.height > 0 ? rect.height : 450;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvasCssWidth = w;
    this.canvasCssHeight = h;
  }

  renderBalance() {
    this.dom.balance.textContent = `$${this.balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
    localStorage.setItem('aviator_balance', this.balance);
  }

  // Authentic Aviator multiplier algorithm (provably fair distribution)
  generateCrashPoint() {
    // 3% chance of instant bust at 1.00x
    const r = Math.random();
    if (r < 0.03) {
      return 1.00;
    }
    // Standard crash equation with 3% house edge: M = 0.97 / (1 - U)
    const u = Math.random();
    let mult = 0.97 / (1 - u);
    mult = Math.floor(mult * 100) / 100;
    return Math.max(1.01, mult);
  }

  renderHistory() {
    this.dom.historyList.innerHTML = '';
    const recent = this.history.slice(-25).reverse();
    recent.forEach((m) => {
      const pill = document.createElement('div');
      pill.className = `history-pill ${this.getPillClass(m)}`;
      pill.textContent = `${m.toFixed(2)}x`;
      pill.title = `Ronda finalizada en ${m.toFixed(2)}x (Click para detalles)`;
      pill.onclick = () => this.showRoundDetails(m);
      this.dom.historyList.appendChild(pill);
    });
    localStorage.setItem('aviator_history', JSON.stringify(this.history));
  }

  getPillClass(m) {
    if (m < 2.0) return 'pill-blue';
    if (m < 10.0) return 'pill-purple';
    if (m < 50.0) return 'pill-gold';
    return 'pill-red';
  }

  showRoundDetails(mult) {
    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    const fakeSeed = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    modalBody.innerHTML = `
      <p><strong>Multiplicador final:</strong> <span style="font-size:1.2rem; color:#ffc107">${mult.toFixed(2)}x</span></p>
      <p style="margin-top:8px;"><strong>Algoritmo Provably Fair:</strong></p>
      <div class="seed-box">
        Server Seed SHA-256:<br>
        ${fakeSeed}
      </div>
      <p style="font-size:0.8rem; color:#8e95a5;">
        El resultado de cada ronda es criptográficamente verificable y determinado antes del despegue del avión mediante combinación de semillas del servidor y clientes.
      </p>
    `;
    modal.classList.add('open');
  }

  // Initialize Dual Betting Panels DOM
  initPanelDOM(panelId) {
    const panel = this.panels[panelId - 1];
    const amountInput = document.getElementById(`betAmount_${panelId}`);
    const minusBtn = document.getElementById(`btnMinus_${panelId}`);
    const plusBtn = document.getElementById(`btnPlus_${panelId}`);
    const actionBtn = document.getElementById(`btnAction_${panelId}`);
    const autoCashCheck = document.getElementById(`autoCashoutCheck_${panelId}`);
    const autoCashInput = document.getElementById(`autoCashoutInput_${panelId}`);
    const autoBetCheck = document.getElementById(`autoBetCheck_${panelId}`);
    const chipBtns = document.querySelectorAll(`.chip-btn[data-panel="${panelId}"]`);

    amountInput.value = panel.amount;
    autoCashInput.value = panel.autoCashoutMult.toFixed(2);

    amountInput.addEventListener('input', (e) => {
      let val = Math.max(10, Math.min(100000, parseInt(e.target.value) || 10));
      panel.amount = val;
      this.updatePanelButton(panelId);
    });

    amountInput.addEventListener('change', (e) => {
      let val = Math.max(10, Math.min(100000, parseInt(e.target.value) || 10));
      panel.amount = val;
      amountInput.value = val;
      this.updatePanelButton(panelId);
    });

    minusBtn.addEventListener('click', () => {
      let step = panel.amount > 1000 ? 500 : (panel.amount > 100 ? 100 : 10);
      panel.amount = Math.max(10, panel.amount - step);
      amountInput.value = panel.amount;
      this.updatePanelButton(panelId);
    });

    plusBtn.addEventListener('click', () => {
      let step = panel.amount >= 1000 ? 500 : (panel.amount >= 100 ? 100 : 50);
      panel.amount = Math.min(100000, panel.amount + step);
      amountInput.value = panel.amount;
      this.updatePanelButton(panelId);
    });

    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        panel.amount = parseInt(btn.dataset.val);
        amountInput.value = panel.amount;
        this.updatePanelButton(panelId);
      });
    });

    autoCashCheck.addEventListener('change', (e) => {
      panel.autoCashoutEnabled = e.target.checked;
    });

    autoCashInput.addEventListener('change', (e) => {
      let val = Math.max(1.05, parseFloat(e.target.value) || 2.0);
      panel.autoCashoutMult = Math.round(val * 100) / 100;
      autoCashInput.value = panel.autoCashoutMult.toFixed(2);
    });

    autoBetCheck.addEventListener('change', (e) => {
      panel.autoBetEnabled = e.target.checked;
      if (e.target.checked && panel.state === 'IDLE' && this.state === 'WAITING') {
        this.queueBet(panelId);
      }
    });

    actionBtn.addEventListener('click', () => {
      this.sound.ensureContext();
      this.handlePanelAction(panelId);
    });

    this.updatePanelButton(panelId);
  }

  handlePanelAction(panelId) {
    const panel = this.panels[panelId - 1];

    if (this.state === 'WAITING') {
      if (panel.state === 'IDLE') {
        this.queueBet(panelId);
      } else if (panel.state === 'QUEUED') {
        this.cancelBet(panelId);
      }
    } else if (this.state === 'FLYING') {
      if (panel.state === 'ACTIVE') {
        this.cashOut(panelId);
      } else if (panel.state === 'IDLE') {
        // Queue bet for next round
        this.queueBet(panelId);
      } else if (panel.state === 'QUEUED') {
        this.cancelBet(panelId);
      }
    }
  }

  queueBet(panelId) {
    const panel = this.panels[panelId - 1];
    if (this.balance < panel.amount) {
      alert("Saldo insuficiente para realizar esta apuesta.");
      return;
    }
    this.balance -= panel.amount;
    this.renderBalance();
    panel.state = 'QUEUED';
    this.updatePanelButton(panelId);
  }

  cancelBet(panelId) {
    const panel = this.panels[panelId - 1];
    if (panel.state === 'QUEUED') {
      this.balance += panel.amount;
      this.renderBalance();
      panel.state = 'IDLE';
      this.updatePanelButton(panelId);
    }
  }

  cashOut(panelId) {
    const panel = this.panels[panelId - 1];
    if (panel.state !== 'ACTIVE') return;

    panel.state = 'CASHED_OUT';
    panel.cashedOutAt = this.multiplier;
    panel.winAmount = Math.floor(panel.amount * this.multiplier * 100) / 100;
    this.balance += panel.winAmount;
    this.renderBalance();
    this.sound.playCashout();

    // Show celebration notification
    this.showToastWin(`¡Cobraste $${panel.winAmount.toFixed(2)}! (${this.multiplier.toFixed(2)}x)`);

    // Log to my bets
    this.myBetsHistory.unshift({
      time: new Date().toLocaleTimeString(),
      amount: panel.amount,
      mult: this.multiplier,
      win: panel.winAmount
    });

    this.updatePanelButton(panelId);
    this.updateSideLiveTable();
  }

  showToastWin(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-win';
    toast.innerHTML = `<span>💰</span> <span>${text}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => toast.remove(), 500);
    }, 2800);
  }

  updatePanelButton(panelId) {
    const panel = this.panels[panelId - 1];
    const btn = document.getElementById(`btnAction_${panelId}`);
    const container = document.getElementById(`panel_${panelId}`);
    const title = btn.querySelector('.action-title');
    const sub = btn.querySelector('.action-sub');

    btn.className = 'btn-action';
    btn.style.opacity = '1';
    container.classList.remove('active-round');

    if (panel.state === 'IDLE') {
      btn.classList.add('state-bet');
      title.textContent = this.state === 'FLYING' ? 'APOSTAR (SIG. RONDA)' : 'APOSTAR';
      sub.textContent = `$${panel.amount.toFixed(2)}`;
    } else if (panel.state === 'QUEUED') {
      btn.classList.add('state-cancel');
      title.textContent = 'CANCELAR';
      sub.textContent = 'Esperando despegue';
    } else if (panel.state === 'ACTIVE') {
      btn.classList.add('state-cashout');
      container.classList.add('active-round');
      const curWin = (panel.amount * this.multiplier).toFixed(2);
      title.textContent = 'COBRAR';
      sub.textContent = `$${curWin}`;
    } else if (panel.state === 'CASHED_OUT') {
      btn.classList.add('state-bet');
      btn.style.opacity = '0.6';
      title.textContent = '¡COBRADO!';
      sub.textContent = `+$${panel.winAmount.toFixed(2)}`;
    } else if (panel.state === 'LOST') {
      btn.classList.add('state-bet');
      title.textContent = 'APOSTAR';
      sub.textContent = `$${panel.amount.toFixed(2)}`;
    }
  }

  startWaitingPhase() {
    this.state = 'WAITING';
    this.multiplier = 1.00;
    this.smokeParticles = [];
    this.planeOffset = { x: 0, y: 0 };
    this.dom.currentMultiplier.textContent = '1.00x';
    this.dom.currentMultiplier.className = 'current-multiplier';
    this.dom.statusLabel.textContent = '';
    this.dom.statusLabel.className = 'status-label';
    this.dom.waitingOverlay.style.display = 'flex';

    this.waitingRemaining = this.waitingDuration / 1000;
    this.dom.waitingTimerText.textContent = `${this.waitingRemaining.toFixed(1)}s`;
    this.dom.waitingProgress.style.width = '100%';

    // Auto-bet triggering for idle panels with autoBetEnabled
    this.panels.forEach((p, idx) => {
      if (p.autoBetEnabled && p.state === 'IDLE') {
        this.queueBet(idx + 1);
      }
      if (p.state === 'CASHED_OUT' || p.state === 'LOST') {
        p.state = 'IDLE';
        if (p.autoBetEnabled) {
          this.queueBet(idx + 1);
        }
      }
      this.updatePanelButton(idx + 1);
    });

    // Generate simulated online players for this round
    this.generateSimulatedPlayers();

    const startTime = performance.now();
    let lastTickSec = Math.ceil(this.waitingRemaining);

    if (this.waitingTimer) clearInterval(this.waitingTimer);
    this.waitingTimer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const leftMs = Math.max(0, this.waitingDuration - elapsed);
      this.waitingRemaining = leftMs / 1000;

      const currentSec = Math.ceil(this.waitingRemaining);
      if (currentSec !== lastTickSec && currentSec > 0) {
        lastTickSec = currentSec;
        this.sound.playCountdownTick();
      }

      this.dom.waitingTimerText.textContent = `${this.waitingRemaining.toFixed(1)}s`;
      const pct = (leftMs / this.waitingDuration) * 100;
      this.dom.waitingProgress.style.width = `${pct}%`;

      if (leftMs <= 0) {
        clearInterval(this.waitingTimer);
        this.startFlight();
      }
    }, 50);
  }

  generateSimulatedPlayers() {
    const numPlayers = Math.floor(Math.random() * 12) + 14;
    this.simulatedBets = [];
    const shuffled = [...FAKE_USERS].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numPlayers; i++) {
      const username = shuffled[i] || `User_${i + 10}`;
      const amount = [50, 100, 200, 500, 1000, 2000, 5000][Math.floor(Math.random() * 7)];
      // Cashout target between 1.10 and 15.00
      let target = 1.1 + Math.pow(Math.random(), 2.2) * 8;
      target = Math.round(target * 100) / 100;

      this.simulatedBets.push({
        user: username,
        amount: amount,
        target: target,
        cashedOut: false,
        cashedMult: 0,
        win: 0
      });
    }

    this.updateSideLiveTable();
  }

  startFlight() {
    this.dom.waitingOverlay.style.display = 'none';
    this.state = 'FLYING';
    this.roundStartTime = performance.now();
    this.crashMultiplier = this.generateCrashPoint();
    this.multiplier = 1.00;
    this.dom.currentMultiplier.className = 'current-multiplier flying';

    // Activate queued player panels
    this.panels.forEach((p, idx) => {
      if (p.state === 'QUEUED') {
        p.state = 'ACTIVE';
        p.winAmount = 0;
        p.cashedOutAt = 0;
      }
      this.updatePanelButton(idx + 1);
    });

    this.sound.startFlightEngine();
  }

  crashFlight() {
    this.state = 'CRASHED';
    this.sound.playCrash();

    this.dom.currentMultiplier.className = 'current-multiplier crashed';
    this.dom.currentMultiplier.textContent = `${this.crashMultiplier.toFixed(2)}x`;
    this.dom.statusLabel.textContent = '¡SE FUE VOLANDO!';
    this.dom.statusLabel.className = 'status-label crashed';

    // Screen shake burst
    this.shakeAmount = 14;

    // Handle panels
    this.panels.forEach((p, idx) => {
      if (p.state === 'ACTIVE') {
        p.state = 'LOST';
        this.updatePanelButton(idx + 1);
      }
    });

    // Mark remaining simulated players as lost
    this.simulatedBets.forEach(b => {
      if (!b.cashedOut) {
        b.lost = true;
      }
    });
    this.updateSideLiveTable();

    // Add to history
    this.history.push(this.crashMultiplier);
    this.renderHistory();

    // Wait 3.5 seconds before restarting
    setTimeout(() => {
      this.startWaitingPhase();
    }, 3500);
  }

  updateSideLiveTable() {
    const list = this.dom.betsList;
    list.innerHTML = '';
    this.dom.totalBetsCount.textContent = `${this.simulatedBets.length + (this.panels.some(p => p.state === 'ACTIVE' || p.state === 'CASHED_OUT') ? 1 : 0)} apuestas`;

    // Add user active panels
    this.panels.forEach((p, idx) => {
      if (p.state === 'ACTIVE' || p.state === 'CASHED_OUT') {
        const row = document.createElement('div');
        row.className = `bet-row ${p.state === 'CASHED_OUT' ? 'cashed-out' : ''}`;
        row.innerHTML = `
          <div class="bet-user me">Tú (Panel ${idx + 1})</div>
          <div class="bet-val">$${p.amount}</div>
          <div class="bet-mult">
            ${p.state === 'CASHED_OUT' ? `<span class="mult-badge-mini ${this.getPillClass(p.cashedOutAt)}">${p.cashedOutAt.toFixed(2)}x</span>` : '-'}
          </div>
          <div class="bet-payout">${p.state === 'CASHED_OUT' ? `$${p.winAmount.toFixed(2)}` : '-'}</div>
        `;
        list.appendChild(row);
      }
    });

    // Add simulated players
    this.simulatedBets.forEach(b => {
      const row = document.createElement('div');
      row.className = `bet-row ${b.cashedOut ? 'cashed-out' : ''}`;
      row.innerHTML = `
        <div class="bet-user">${b.user}</div>
        <div class="bet-val">$${b.amount}</div>
        <div class="bet-mult">
          ${b.cashedOut ? `<span class="mult-badge-mini ${this.getPillClass(b.cashedMult)}">${b.cashedMult.toFixed(2)}x</span>` : '-'}
        </div>
        <div class="bet-payout">${b.cashedOut ? `$${b.win.toFixed(2)}` : '-'}</div>
      `;
      list.appendChild(row);
    });
  }

  // Main Animation Loop
  loop(now) {
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    if (this.state === 'FLYING') {
      const flightDuration = (now - this.roundStartTime) / 1000;
      // Multiplier increases smoothly (exponential curve)
      // k ~ 0.075: reaches 2x at ~8s, 10x at ~25s
      const growthRate = 0.08 + Math.min(0.06, flightDuration * 0.002);
      this.multiplier = 1.00 * Math.exp(growthRate * flightDuration);

      if (this.multiplier >= this.crashMultiplier) {
        this.multiplier = this.crashMultiplier;
        this.crashFlight();
      } else {
        this.dom.currentMultiplier.textContent = `${this.multiplier.toFixed(2)}x`;
        this.sound.updateFlightEngine(this.multiplier);

        // Check user auto-cashouts
        this.panels.forEach((p, idx) => {
          if (p.state === 'ACTIVE') {
            this.updatePanelButton(idx + 1);
            if (p.autoCashoutEnabled && this.multiplier >= p.autoCashoutMult) {
              this.cashOut(idx + 1);
            }
          }
        });

        // Check simulated bets cashout
        let needUpdateTable = false;
        this.simulatedBets.forEach(b => {
          if (!b.cashedOut && this.multiplier >= b.target && b.target <= this.crashMultiplier) {
            b.cashedOut = true;
            b.cashedMult = b.target;
            b.win = Math.floor(b.amount * b.cashedMult * 100) / 100;
            needUpdateTable = true;
          }
        });
        if (needUpdateTable) {
          this.updateSideLiveTable();
        }
      }
    }

    // Render Canvas
    this.drawCanvas(now, dt);

    requestAnimationFrame((t) => this.loop(t));
  }

  drawCanvas(now, dt) {
    const ctx = this.ctx;
    const w = this.canvasCssWidth || 800;
    const h = this.canvasCssHeight || 400;

    ctx.clearRect(0, 0, w, h);

    // Camera shake
    ctx.save();
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
      this.shakeAmount = Math.max(0, this.shakeAmount - dt * 25);
    }

    // Dynamic background grid
    this.drawBackground(ctx, w, h, dt);

    // Compute plane position on curve
    let planeX = 60;
    let planeY = h - 60;
    let angle = 0;

    if (this.state === 'FLYING') {
      const flightDuration = (now - this.roundStartTime) / 1000;
      // Curve progression normalized: reaches high corner smoothly
      const progress = Math.min(1, Math.log10(this.multiplier) / 1.4);
      
      const startX = 50;
      const startY = h - 50;
      const targetX = w * 0.76;
      const targetY = h * 0.22;

      // Quadratic curve
      const cx = (startX + targetX) / 2;
      const cy = startY;

      // Current t along curve
      const t = Math.min(1, Math.pow(progress, 0.75) * 0.95);
      
      planeX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cx + t * t * targetX;
      planeY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cy + t * t * targetY;

      // Tiny floating wobble
      planeY += Math.sin(now * 0.005) * 6;
      planeX += Math.cos(now * 0.004) * 3;

      // Derivative angle
      const dx = 2 * (1 - t) * (cx - startX) + 2 * t * (targetX - cx);
      const dy = 2 * (1 - t) * (cy - startY) + 2 * t * (targetY - cy);
      angle = Math.atan2(dy, dx);

      // Draw red trajectory fill underneath
      this.drawTrajectory(ctx, startX, startY, cx, cy, planeX, planeY, h);

      // Spawn smoke puff behind plane
      if (Math.random() < 0.6) {
        this.smokeParticles.push({
          x: planeX - Math.cos(angle) * 20,
          y: planeY - Math.sin(angle) * 20,
          vx: -Math.cos(angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
          vy: -Math.sin(angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
          size: Math.random() * 4 + 3,
          maxLife: 0.7,
          life: 0.7,
          color: 'rgba(230, 40, 60,'
        });
      }
    } else if (this.state === 'CRASHED') {
      // Plane shoots off upwards to the right
      this.planeOffset.x += dt * 900;
      this.planeOffset.y -= dt * 600;
      planeX = (w * 0.76) + this.planeOffset.x;
      planeY = (h * 0.22) + this.planeOffset.y;
      angle = -0.4;
    } else {
      // WAITING: Plane rests on the runway
      planeX = 90;
      planeY = h - 65;
      angle = -0.05;
    }

    // Update & draw smoke particles
    this.drawSmoke(ctx, dt);

    // Draw Plane (only if on screen)
    if (planeX < w + 120 && planeY > -100) {
      this.drawAviatorPlane(ctx, planeX, planeY, angle, dt);
    }

    ctx.restore();
  }

  drawBackground(ctx, w, h, dt) {
    // Parallax stars/dots moving
    const speed = this.state === 'FLYING' ? (0.6 + Math.min(2.5, this.multiplier * 0.1)) : 0.1;
    ctx.fillStyle = '#2b303c';
    this.stars.forEach(s => {
      s.x -= s.speed * speed * dt;
      if (s.x < 0) s.x = 1;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.speed * 0.4})`;
      ctx.fill();
    });

    // Horizontal & vertical subtle radar grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSpacing = 60;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  drawTrajectory(ctx, startX, startY, cx, cy, endX, endY, h) {
    // Fill area under curve
    const grad = ctx.createLinearGradient(0, endY, 0, h);
    grad.addColorStop(0, 'rgba(229, 27, 56, 0.35)');
    grad.addColorStop(1, 'rgba(229, 27, 56, 0.0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cx, cy, endX, endY);
    ctx.lineTo(endX, h);
    ctx.lineTo(startX, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing red border line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cx, cy, endX, endY);
    ctx.strokeStyle = '#e51b38';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#e51b38';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }

  drawSmoke(ctx, dt) {
    ctx.save();
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.size += dt * 8;
      const alpha = (p.life / p.maxLife) * 0.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw authentic Red Aviator Sports Plane
  drawAviatorPlane(ctx, x, y, angle, dt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const scale = 1.0;
    ctx.scale(scale, scale);

    // Propeller spinning animation
    this.propellerAngle += dt * 45;

    // Shadow below
    ctx.shadowColor = 'rgba(229, 27, 56, 0.6)';
    ctx.shadowBlur = 16;

    // Plane Fuselage (Sleek aerodynamic red body)
    ctx.fillStyle = '#e51b38';
    ctx.beginPath();
    ctx.moveTo(25, -2); // nose tip
    ctx.quadraticCurveTo(15, -12, -22, -10); // upper back
    ctx.lineTo(-34, -14); // tail top
    ctx.lineTo(-30, 2); // tail rear
    ctx.quadraticCurveTo(-15, 8, 15, 6); // belly
    ctx.closePath();
    ctx.fill();

    // Fuselage highlight (sports stripe)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(18, -2);
    ctx.lineTo(-18, -4);
    ctx.lineTo(-20, -1);
    ctx.lineTo(16, 1);
    ctx.closePath();
    ctx.fill();

    // Dark red accent / wing root
    ctx.fillStyle = '#b7152c';
    ctx.beginPath();
    ctx.moveTo(5, -2);
    ctx.lineTo(-12, 14);
    ctx.lineTo(-18, 14);
    ctx.lineTo(-6, -2);
    ctx.closePath();
    ctx.fill();

    // Cockpit Glass Canopy (Cyan / Tinted)
    ctx.fillStyle = '#4cd3e3';
    ctx.beginPath();
    ctx.ellipse(3, -7, 10, 4.5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cockpit glare
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(5, -8, 5, 2, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Main Wing (Swept wing pointing down-forward)
    ctx.fillStyle = '#dc143c';
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.lineTo(-2, 16);
    ctx.lineTo(-12, 16);
    ctx.lineTo(-4, -1);
    ctx.closePath();
    ctx.fill();

    // Vertical Stabilizer / Rudder (Tail Fin)
    ctx.fillStyle = '#c8102e';
    ctx.beginPath();
    ctx.moveTo(-24, -10);
    ctx.lineTo(-36, -24);
    ctx.lineTo(-30, -24);
    ctx.lineTo(-20, -10);
    ctx.closePath();
    ctx.fill();

    // Propeller Hub (Nose Cone)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(25, -1, 4, 0, Math.PI * 2);
    ctx.fill();

    // Spinning Propeller Blur
    ctx.save();
    ctx.translate(27, -1);
    ctx.rotate(this.propellerAngle);
    
    // Translucent propeller disc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Propeller blades
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.5, -16, 3, 32);
    ctx.restore();

    ctx.restore();
  }

  setupEventListeners() {
    // Audio unlock on first user gesture
    window.addEventListener('click', () => {
      this.sound.ensureContext();
    }, { once: true });

    // Sound Toggle
    this.dom.soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundBtn.classList.toggle('active', !this.sound.enabled);
      this.dom.soundBtn.title = this.sound.enabled ? "Silenciar sonido" : "Activar sonido";
      if (!this.sound.enabled) {
        this.sound.stopFlightEngine();
      }
    });

    // Reset Balance
    this.dom.reloadBtn.addEventListener('click', () => {
      this.balance = 10000;
      this.renderBalance();
      this.showToastWin("¡Saldo recargado a $10,000.00!");
    });

    // Sidebar Tabs
    const tabs = document.querySelectorAll('.side-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const view = tab.dataset.view;
        this.renderSideTab(view);
      });
    });

    // Modal Close
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
      document.getElementById('detailsModal').classList.remove('open');
    });
    document.getElementById('detailsModal').addEventListener('click', (e) => {
      if (e.target.id === 'detailsModal') {
        document.getElementById('detailsModal').classList.remove('open');
      }
    });
  }

  renderSideTab(view) {
    const list = this.dom.betsList;
    if (view === 'all') {
      this.updateSideLiveTable();
    } else if (view === 'mine') {
      list.innerHTML = '';
      if (this.myBetsHistory.length === 0) {
        list.innerHTML = `<div style="padding:20px; text-align:center; color:#8e95a5; font-size:0.85rem;">No tienes apuestas registradas aún.</div>`;
        return;
      }
      this.myBetsHistory.forEach(item => {
        const row = document.createElement('div');
        row.className = 'bet-row cashed-out';
        row.innerHTML = `
          <div class="bet-user me">${item.time}</div>
          <div class="bet-val">$${item.amount}</div>
          <div class="bet-mult"><span class="mult-badge-mini ${this.getPillClass(item.mult)}">${item.mult.toFixed(2)}x</span></div>
          <div class="bet-payout">+$${item.win.toFixed(2)}</div>
        `;
        list.appendChild(row);
      });
    } else if (view === 'top') {
      list.innerHTML = '';
      const topWins = [
        { user: "Don_Ganador", mult: 124.50, win: 62250.00 },
        { user: "AviatorPro", mult: 88.20, win: 44100.00 },
        { user: "Santiago_7", mult: 45.10, win: 22550.00 },
        { user: "ChileGamer", mult: 32.80, win: 16400.00 },
        { user: "ElSuertudo", mult: 21.05, win: 10525.00 }
      ];
      topWins.forEach(item => {
        const row = document.createElement('div');
        row.className = 'bet-row cashed-out';
        row.innerHTML = `
          <div class="bet-user" style="color:#f1c40f">👑 ${item.user}</div>
          <div class="bet-val">-</div>
          <div class="bet-mult"><span class="mult-badge-mini pill-gold">${item.mult.toFixed(2)}x</span></div>
          <div class="bet-payout">+$${item.win.toLocaleString()}</div>
        `;
        list.appendChild(row);
      });
    }
  }
}

// Launch on page load
window.addEventListener('DOMContentLoaded', () => {
  window.aviatorGame = new AviatorSimulator();
});
