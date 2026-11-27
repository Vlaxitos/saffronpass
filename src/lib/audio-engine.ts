"use client";

import type { MusicTrackType } from "@/types/database";

interface WebkitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * SaffronPass Web Audio API + Custom MP3 Background Music Engine.
 * Generates 5 pleasant, royalty-free ambient musical loops directly in the browser
 * (zero external MP3 links that could break) and supports custom uploaded MP3 tracks.
 * Designed to be started synchronously inside the guest's opening tap gesture
 * so iOS Safari and Android Chrome allow audio playback cleanly.
 */
export class SaffronAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneNodes: AudioNode[] = [];
  private stepTimer: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private playing = false;
  private activeTrack: MusicTrackType = "none";
  private customUrl: string | null = null;
  private stepIndex = 0;

  public configure(track: MusicTrackType, customUrl?: string | null) {
    this.activeTrack = track;
    this.customUrl = customUrl ?? null;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public start(): boolean {
    if (this.activeTrack === "none") return false;
    if (this.playing) return true;

    if (this.activeTrack === "custom") {
      if (!this.customUrl) return false;
      try {
        if (!this.customAudio || this.customAudio.src !== this.customUrl) {
          this.customAudio?.pause();
          this.customAudio = new Audio(this.customUrl);
          this.customAudio.loop = true;
          this.customAudio.volume = 0.45;
          this.customAudio.preload = "auto";
        }
        const promise = this.customAudio.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            this.playing = false;
          });
        }
        this.playing = true;
        return true;
      } catch {
        this.playing = false;
        return false;
      }
    }

    // Built-in Web Audio API synthesizer loop
    const AudioCtx =
      window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AudioCtx) return false;

    try {
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.9);
      this.masterGain.connect(this.ctx.destination);

      this.stepIndex = 0;
      this.startSynthTrack(this.activeTrack);
      this.playing = true;
      return true;
    } catch {
      this.playing = false;
      return false;
    }
  }

  public stop() {
    this.playing = false;

    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch {
        // Ignore pause errors
      }
    }

    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }

    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setTargetAtTime(0.0001, now, 0.12);
      } catch {
        // Ignore fadeout errors
      }
    }

    for (const node of this.droneNodes) {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore stop errors
      }
    }
    this.droneNodes = [];
    this.masterGain = null;
  }

  public toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    }
    return this.start();
  }

  public dispose() {
    this.stop();
    if (this.customAudio) {
      this.customAudio.src = "";
      this.customAudio = null;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  private startDrone(freqs: number[], gainLevel = 0.09) {
    if (!this.ctx || !this.masterGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = gainLevel;

    filter.connect(droneGain);
    droneGain.connect(this.masterGain);
    this.droneNodes.push(filter, droneGain);

    for (const freq of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      this.droneNodes.push(osc);
    }
  }

  private playTone(opts: {
    freq: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    cutoff?: number;
    attack?: number;
    detune?: number;
    vibratoHz?: number;
    vibratoDepth?: number;
  }) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const attack = opts.attack ?? 0.04;
    const volume = opts.volume ?? 0.18;

    const osc = this.ctx.createOscillator();
    osc.type = opts.type ?? "triangle";
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.detune) osc.detune.setValueAtTime(opts.detune, now);

    if (opts.vibratoHz && opts.vibratoDepth) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = opts.vibratoHz;
      lfoGain.gain.value = opts.vibratoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + opts.duration + 0.15);
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(opts.cutoff ?? 1600, now);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + opts.duration + 0.08);
  }

  private startSynthTrack(track: MusicTrackType) {
    switch (track) {
      case "royal_shehnai": {
        // Raga Bhupali pentatonic (C D E G A C) over soft Sa-Pa tanpura drone
        this.startDrone([130.81, 196.0, 261.63], 0.075);
        const melody = [
          523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 0,
          659.25, 783.99, 880.0, 1046.5, 880.0, 783.99, 659.25, 587.33,
        ];
        const tick = () => {
          const f = melody[this.stepIndex % melody.length];
          this.stepIndex += 1;
          if (f > 0) {
            this.playTone({
              freq: f,
              duration: 0.95,
              type: "sawtooth",
              volume: 0.11,
              cutoff: 1350,
              attack: 0.1,
              vibratoHz: 5.2,
              vibratoDepth: 6,
            });
            this.playTone({
              freq: f * 0.5,
              duration: 0.95,
              type: "sine",
              volume: 0.07,
              cutoff: 900,
              attack: 0.1,
            });
          }
        };
        tick();
        this.stepTimer = window.setInterval(tick, 680);
        break;
      }

      case "romantic_piano": {
        // Warm Fmaj7 -> Dm9 -> Bbmaj7 -> Csus2 gentle arpeggio
        const notes = [
          261.63, 329.63, 392.0, 523.25, 440.0, 392.0,
          293.66, 349.23, 440.0, 587.33, 523.25, 440.0,
          233.08, 293.66, 349.23, 466.16, 440.0, 349.23,
          261.63, 293.66, 392.0, 523.25, 392.0, 329.63,
        ];
        const tick = () => {
          const f = notes[this.stepIndex % notes.length];
          this.stepIndex += 1;
          this.playTone({
            freq: f,
            duration: 1.5,
            type: "triangle",
            volume: 0.18,
            cutoff: 1400,
            attack: 0.025,
          });
          this.playTone({
            freq: f * 2,
            duration: 0.9,
            type: "sine",
            volume: 0.045,
            cutoff: 1800,
            attack: 0.02,
          });
        };
        tick();
        this.stepTimer = window.setInterval(tick, 520);
        break;
      }

      case "sitar_bliss": {
        // Soft plucked raga Yaman (D E F# G# A B C# D) with resonant shimmer & drone
        this.startDrone([146.83, 220.0], 0.065);
        const notes = [
          293.66, 329.63, 369.99, 440.0, 493.88, 554.37, 587.33, 493.88,
          440.0, 415.3, 369.99, 329.63, 293.66, 0, 440.0, 369.99,
        ];
        const tick = () => {
          const f = notes[this.stepIndex % notes.length];
          this.stepIndex += 1;
          if (f > 0) {
            this.playTone({
              freq: f,
              duration: 1.35,
              type: "sawtooth",
              volume: 0.1,
              cutoff: 1850,
              attack: 0.012,
              detune: 4,
            });
            this.playTone({
              freq: f * 2,
              duration: 0.8,
              type: "triangle",
              volume: 0.055,
              cutoff: 2200,
              attack: 0.01,
              detune: -5,
            });
          }
        };
        tick();
        this.stepTimer = window.setInterval(tick, 620);
        break;
      }

      case "celebration_chimes": {
        // Golden temple/wedding chimes over a warm major-9th shimmer pad
        this.startDrone([196.0, 246.94, 293.66], 0.055);
        const chimes = [
          783.99, 987.77, 1174.66, 880.0, 1318.51, 987.77, 1174.66, 1567.98,
        ];
        const tick = () => {
          const f = chimes[this.stepIndex % chimes.length];
          this.stepIndex += 1;
          this.playTone({
            freq: f,
            duration: 2.2,
            type: "sine",
            volume: 0.12,
            cutoff: 3200,
            attack: 0.01,
          });
          this.playTone({
            freq: f * 1.5,
            duration: 1.4,
            type: "sine",
            volume: 0.04,
            cutoff: 3600,
            attack: 0.015,
          });
        };
        tick();
        this.stepTimer = window.setInterval(tick, 900);
        break;
      }

      case "acoustic_warmth": {
        // Warm Dmaj -> Bm -> Gmaj -> A7sus4 plucked progression
        const chords: number[][] = [
          [146.83, 220.0, 293.66, 369.99],
          [123.47, 185.0, 246.94, 293.66],
          [196.0, 246.94, 293.66, 392.0],
          [220.0, 277.18, 329.63, 440.0],
        ];
        const tick = () => {
          const chord = chords[Math.floor(this.stepIndex / 4) % chords.length];
          const f = chord[this.stepIndex % 4];
          this.stepIndex += 1;
          this.playTone({
            freq: f,
            duration: 1.25,
            type: "triangle",
            volume: 0.19,
            cutoff: 1200,
            attack: 0.015,
          });
        };
        tick();
        this.stepTimer = window.setInterval(tick, 440);
        break;
      }

      default:
        break;
    }
  }
}
