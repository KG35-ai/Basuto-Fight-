/**
 * Web Audio API procedural sound synthesizer for Basuto Fighting Game.
 * Features traditional African percussion patterns (moropa drums, shakers),
 * authentic Melamu stick clashes, heavy blanket whooshes, and elemental combat SFX.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.45;
  private sfxVolume: number = 0.7;
  private drumLoopInterval: number | null = null;
  private isBGMPlaying: boolean = false;
  private drumStep: number = 0;
  private drumTempoMs: number = 135; // ~110 bpm sixteenth-ish steps
  private isDangerMusic: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  // --- African Percussion Drum Loop ---
  public startBGM(isDanger: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    this.isDangerMusic = isDanger;
    this.drumTempoMs = isDanger ? 100 : 135;

    if (this.isBGMPlaying) return;
    this.isBGMPlaying = true;
    this.drumStep = 0;

    this.drumLoopInterval = window.setInterval(() => {
      this.tickDrums();
    }, this.drumTempoMs);
  }

  public updateBGMDanger(isDanger: boolean) {
    if (this.isDangerMusic === isDanger) return;
    this.isDangerMusic = isDanger;
    if (this.drumLoopInterval) {
      clearInterval(this.drumLoopInterval);
      this.drumTempoMs = isDanger ? 100 : 135;
      this.drumLoopInterval = window.setInterval(() => {
        this.tickDrums();
      }, this.drumTempoMs);
    }
  }

  public stopBGM() {
    this.isBGMPlaying = false;
    if (this.drumLoopInterval) {
      clearInterval(this.drumLoopInterval);
      this.drumLoopInterval = null;
    }
  }

  private tickDrums() {
    if (this.isMuted || !this.ctx) return;
    const step = this.drumStep % 16;
    this.drumStep++;

    const now = this.ctx.currentTime;

    // Bass / Morapa deep drum on beats 0, 4, 7, 10, 12
    if ([0, 4, 7, 10, 12].includes(step)) {
      this.playMoropaBass(now, step === 0 ? 1.0 : 0.75);
    }

    // Mid Tone Djembe Slap on beats 2, 6, 8, 14
    if ([2, 6, 8, 14].includes(step)) {
      this.playDjembeSlap(now, step === 8 ? 0.9 : 0.65);
    }

    // High Rim Tap / Wood block on polyrhythm 3, 5, 9, 11, 15
    if ([3, 5, 9, 11, 15].includes(step)) {
      this.playWoodRim(now, 0.45);
    }

    // Gourd Shaker / Shekere on every even step
    if (step % 2 === 0) {
      this.playShaker(now, step % 4 === 0 ? 0.4 : 0.25);
    }
  }

  private playMoropaBass(time: number, accent: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.isDangerMusic ? 120 : 100, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);

    const baseVol = 0.7 * this.musicVolume * accent;
    gain.gain.setValueAtTime(baseVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  private playDjembeSlap(time: number, accent: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.08);

    const baseVol = 0.5 * this.musicVolume * accent;
    gain.gain.setValueAtTime(baseVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playWoodRim(time: number, accent: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, time);
    osc.frequency.exponentialRampToValueAtTime(450, time + 0.04);

    const baseVol = 0.35 * this.musicVolume * accent;
    gain.gain.setValueAtTime(baseVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playShaker(time: number, accent: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.035;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * this.musicVolume * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.04);
  }

  // --- Authentic Combat SFX ---

  // 1. Traditional Melamu Stick Clack (Wood-on-wood sharp strike)
  public playMelamuClack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1150, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.06);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(580, now);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.9 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.1);
  }

  // 2. Heavy Blade Slash / Impact
  public playHeavySlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Low rumble + metal shimmer
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.85 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 3. Cultural Kobo Blanket Swish / Whoosh
  public playBlanketWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.19);
  }

  // 4. Shield / Melamu Parry Clack
  public playParry() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

    gain.gain.setValueAtTime(1.0 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  // 5. Block Impact (Thud)
  public playBlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.09);

    gain.gain.setValueAtTime(0.7 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 6. Lightning Special Strike
  public playLightning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Crackle noise + sub zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.3);

    gain.gain.setValueAtTime(0.9 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 7. Fire Eruption
  public playFire() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);

    gain.gain.setValueAtTime(0.85 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 8. Super Ascension Art Activation (Screen freeze boom)
  public playSuperFlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Gong-like royal bass gong
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.8);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(320, now);
    osc2.frequency.exponentialRampToValueAtTime(90, now + 0.6);

    gain.gain.setValueAtTime(1.0 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  // 9. Announcer Chime / Voice Callout
  public announce(text: string) {
    if (this.isMuted) return;
    // Play herald harmonic tone
    this.initContext();
    if (this.ctx) {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.08); // C#
      osc.frequency.setValueAtTime(659.25, now + 0.16); // E

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    }

    // Use Web Speech Synthesis if available for dramatic fighting announcer
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.8;
        utterance.volume = this.sfxVolume;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback tone already played
      }
    }
  }
}

export const soundEngine = new SoundEngine();
