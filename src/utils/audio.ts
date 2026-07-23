/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 高级感 UI 音效系统 —— 以正弦波为主，柔和纯净，带有智能科技感
// 参考导航栏 C 大调琶音风格，所有音效统一为同一设计语言

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('Audio Context is not supported by your browser', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  /* ---- 工具：柔和正弦音色播放 ---- */
  private tone(
    freq: number,
    endFreq: number,
    gain: number,
    duration: number,
    delay: number = 0,
    type: OscillatorType = 'sine',
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), now + duration);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /* ---- 导航标签切换 —— C 大调琶音，清脆高级（保留原始设计） ---- */
  public playChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  /* ---- 公共微型琶音工具 ---- */
  private hoverArp(freqs: [number, number], gain: number = 0.04, gap: number = 0.03, dur: number = 0.16) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * gap);
      g.gain.setValueAtTime(0, now + i * gap);
      g.gain.linearRampToValueAtTime(gain, now + i * gap + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * gap + dur);
      osc.connect(g); g.connect(this.ctx!.destination);
      osc.start(now + i * gap);
      osc.stop(now + i * gap + dur + 0.01);
    });
  }

  /* ---- 通用悬停（保留作为默认） ---- */
  public playHover() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([523.25, 783.99], 0.04, 0.03, 0.16);
  }

  /* ---- 首页悬停 —— 温暖低音，G3→C4 端庄沉稳 ---- */
  public playHoverHome() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([196, 261.63], 0.045, 0.04, 0.2);
  }

  /* ---- 个人简介悬停 —— 清亮中音，C4→E4 专业知性 ---- */
  public playHoverAbout() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([261.63, 329.63], 0.04, 0.035, 0.17);
  }

  /* ---- 创意作品拖拽页悬停 —— 轻快跳音，G4→C5 活泼创意 ---- */
  public playHoverWorks() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([392, 523.25], 0.04, 0.03, 0.15);
  }

  /* ---- 创意作品掉落页悬停 —— 和声叠音，C5+E5 厚实精致 ---- */
  public playHoverPortfolio() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([523.25, 659.25], 0.042, 0.025, 0.16);
  }

  /* ---- 设计工程悬停 —— 科技六度，C5→A5 智能未来感 ---- */
  public playHoverDesign() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([523.25, 880], 0.038, 0.03, 0.16);
  }

  /* ---- IP 视频悬停 —— 愉悦四度，D5→G5 轻松灵动 ---- */
  public playHoverIP() {
    if (this.isMuted) return;
    this.initCtx();
    this.hoverArp([587.33, 783.99], 0.04, 0.03, 0.15);
  }

  /* ---- 卡片点击弹出 —— 柔和厚实，C 大调和声 ---- */
  public playPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // C4+E4 纯律和声，如钢琴轻触
    [523.25, 659.25].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.012);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.04, now + i * 0.012 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.012 + 0.15);
      osc.connect(g); g.connect(this.ctx!.destination);
      osc.start(now + i * 0.012);
      osc.stop(now + i * 0.012 + 0.18);
    });
  }

  /* ---- 卡片散开 —— 细腻气流掠过 ---- */
  public playWhoosh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.5);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3000;
    bp.Q.value = 1.5;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.012, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + 0.12);
  }

  /* ---- 卡片入场揭示 —— 轻柔升调琶音（保留原始设计） ---- */
  public playReveal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, now + i * 0.06);
      g.gain.linearRampToValueAtTime(0.03, now + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  }

  /* ---- 轻巧切换（保留备用） ---- */
  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.tone(1600, 1200, 0.015, 0.04);
  }

  /* ---- AI 气泡音 —— 科技感上升 ---- */
  public playBubble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 双层：基音 + 高八度泛音，模拟数字气泡
    [1046.5, 2093].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.015);
      osc.frequency.exponentialRampToValueAtTime(f * 1.8, now + i * 0.015 + 0.14);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(i === 0 ? 0.025 : 0.012, now + i * 0.015 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.015 + 0.16);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now + i * 0.015);
      osc.stop(now + i * 0.015 + 0.18);
    });
  }

  /* ---- 通用轻点 ---- */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.tone(800, 600, 0.025, 0.06);
  }
}

export const sounds = new SoundSystem();
