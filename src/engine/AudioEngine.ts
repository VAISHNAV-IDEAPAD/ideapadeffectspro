export interface PeakLevels {
  left: number;       // linear 0.0 to 1.0 (or dB normalized)
  right: number;
  leftDb: number;     // -60 to 0 dB
  rightDb: number;
  peakLeft: number;
  peakRight: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  
  private trackGains: Map<string, GainNode> = new Map();
  private trackPanners: Map<string, StereoPannerNode> = new Map();
  
  // Synthetic generators for sample tracks
  private sampleOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isSyntheticPlaying = false;
  
  // Peak tracking
  private peakLeft = 0;
  private peakRight = 0;
  private lastPeakTime = 0;

  constructor() {
    // Lazy initialize on first interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    this.splitter = this.ctx.createChannelSplitter(2);
    this.analyserLeft = this.ctx.createAnalyser();
    this.analyserRight = this.ctx.createAnalyser();

    this.analyserLeft.fftSize = 256;
    this.analyserRight.fftSize = 256;
    this.analyserLeft.smoothingTimeConstant = 0.8;
    this.analyserRight.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.splitter);
    this.splitter.connect(this.analyserLeft, 0);
    this.splitter.connect(this.analyserRight, 1);

    this.masterGain.connect(this.ctx.destination);
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(val, 2)), this.ctx?.currentTime || 0, 0.05);
    }
  }

  public updateTrack(trackId: string, volume: number, pan: number, muted: boolean, solo: boolean, anySoloActive: boolean) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    let gainNode = this.trackGains.get(trackId);
    let panNode = this.trackPanners.get(trackId);

    if (!gainNode || !panNode) {
      gainNode = this.ctx.createGain();
      panNode = this.ctx.createStereoPanner();
      panNode.connect(gainNode);
      gainNode.connect(this.masterGain);
      this.trackGains.set(trackId, gainNode);
      this.trackPanners.set(trackId, panNode);
    }

    const effectiveMuted = muted || (anySoloActive && !solo);
    const targetVolume = effectiveMuted ? 0 : Math.max(0, Math.min(volume, 2));

    gainNode.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 0.04);
    panNode.pan.setTargetAtTime(Math.max(-1, Math.min(pan, 1)), this.ctx.currentTime, 0.04);
  }

  // Real-time Peak and RMS dB Calculation for Premiere Dual Meter
  public getPeakLevels(): PeakLevels {
    if (!this.analyserLeft || !this.analyserRight) {
      return { left: 0, right: 0, leftDb: -60, rightDb: -60, peakLeft: 0, peakRight: 0 };
    }

    const bufferLeft = new Uint8Array(this.analyserLeft.frequencyBinCount);
    const bufferRight = new Uint8Array(this.analyserRight.frequencyBinCount);
    
    this.analyserLeft.getByteTimeDomainData(bufferLeft);
    this.analyserRight.getByteTimeDomainData(bufferRight);

    let maxL = 0;
    let maxR = 0;

    for (let i = 0; i < bufferLeft.length; i++) {
      const sampleL = Math.abs((bufferLeft[i] - 128) / 128);
      const sampleR = Math.abs((bufferRight[i] - 128) / 128);
      if (sampleL > maxL) maxL = sampleL;
      if (sampleR > maxR) maxR = sampleR;
    }

    // Convert linear amplitude to dB: 20 * log10(max)
    const computeDb = (val: number) => {
      if (val < 0.001) return -60;
      const db = 20 * Math.log10(val);
      return Math.max(-60, Math.min(0, db));
    };

    const leftDb = computeDb(maxL);
    const rightDb = computeDb(maxR);

    // Peak hold decay
    const now = performance.now();
    if (now - this.lastPeakTime > 1500) {
      this.peakLeft = Math.max(0, this.peakLeft - 0.02);
      this.peakRight = Math.max(0, this.peakRight - 0.02);
    }
    if (maxL > this.peakLeft) {
      this.peakLeft = maxL;
      this.lastPeakTime = now;
    }
    if (maxR > this.peakRight) {
      this.peakRight = maxR;
      this.lastPeakTime = now;
    }

    return {
      left: maxL,
      right: maxR,
      leftDb,
      rightDb,
      peakLeft: this.peakLeft,
      peakRight: this.peakRight,
    };
  }

  // Synthesize rhythmic backing ambient sound for demo sequence preview
  public playDemoAudio(currentTime: number, isPlaying: boolean) {
    if (!isPlaying) {
      this.stopDemoAudio();
      return;
    }

    this.resume();
    if (!this.ctx || this.isSyntheticPlaying) return;

    try {
      this.isSyntheticPlaying = true;
      const beatInterval = 60 / 124; // 124 BPM house/cinematic groove
      
      // We will modulate a dual filter synth on track 'a1'
      const track1Gain = this.trackGains.get('a1') || this.masterGain!;

      // Bass oscillator
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
      bassGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(track1Gain);
      bassOsc.start();

      // Atmospheric pad on track 'a2'
      const track2Gain = this.trackGains.get('a2') || this.masterGain!;
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(220, this.ctx.currentTime);
      padGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      padOsc.connect(padGain);
      padGain.connect(track2Gain);
      padOsc.start();

      this.sampleOscillators.push(
        { osc: bassOsc, gain: bassGain },
        { osc: padOsc, gain: padGain }
      );
    } catch {
      // Audio autoplay restriction fallback
    }
  }

  public stopDemoAudio() {
    this.sampleOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0.0001, (this.ctx?.currentTime || 0) + 0.05);
        osc.stop((this.ctx?.currentTime || 0) + 0.06);
      } catch {
        // Safe disconnect
      }
    });
    this.sampleOscillators = [];
    this.isSyntheticPlaying = false;
  }

  public getDestination(): MediaStreamAudioDestinationNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const dest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(dest);
    return dest;
  }
}

export const audioEngine = new AudioEngine();
