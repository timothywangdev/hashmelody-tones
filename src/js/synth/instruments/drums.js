import { Instrument } from './instrument';

export class KickDrum extends Instrument {
  constructor() {
    super(new Tone.MembraneSynth({ pitchDecay: 0.1 }), 10, true);
  }
}
export class HiHat extends Instrument {
  constructor() {
    super(new Tone.NoiseSynth(), 16);
    const filter = new Tone.Filter(8000, 'highpass').toDestination();
    this.synth.connect(filter);
  }
}

export class Slap extends Instrument {
  constructor(addReverb) {
    super(
      new Tone.NoiseSynth({
        noise: {
          type: 'white',
          playbackRate: 5,
        },
        envelope: {
          attack: 0.001,
          decay: 0.3,
          sustain: 0,
          release: 0.3,
        },
      }),
      0
    );

    const filter = new Tone.Filter(500, 'lowpass').toDestination();
    this.synth.connect(filter);
  }
}

export class OpenHat extends Instrument {
  constructor(frequency) {
    super(
      new Tone.MetalSynth({
        frequency,
      }),
      0,
      true
    );
  }
  setFrequency(frequency) {
    this.synth.set({frequency})
  }
}

export class Shaker extends Instrument {
  constructor(frequency) {
    super(
      new Tone.MetalSynth({
        envelope: {
          attack: 0.1,
          decay: 0.4,
          release: 0.3,
        },
        frequency,
        // harmonicity: 5.1,
        modulationIndex: 64,
        resonance: 3000,
        octaves: 1.5,
      }),
      0,
      true
    );
  }
}

export class DampenedOpenHat extends Instrument {
  constructor(frequency) {
    super(
      new Tone.MetalSynth({
        frequency,
        // harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 1000,
        octaves: 1.5,
      }),
      0,
      true
    );
  }
}
