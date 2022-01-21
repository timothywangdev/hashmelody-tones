// http://tonejs.github.io/Presets/
import Instrument from "./instrument";

export class Tiny extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 24, true);
    this.synth.set({
      harmonicity: 2,
      oscillator: {
        type: "amsine2",
        modulationType: "sine",
        harmonicity: 1.01,
      },
      envelope: {
        attack: 0.006,
        decay: 4,
        sustain: 0.04,
        release: 1.2,
      },
      modulation: {
        volume: 13,
        type: "amsine2",
        modulationType: "sine",
        harmonicity: 12,
      },
      modulationEnvelope: {
        attack: 0.006,
        decay: 0.2,
        sustain: 0.2,
        release: 0.4,
      },
    });
    this.synth.volume.value = 10;

    //this.synth.send('reverb', -12);
  }
}

export class AM_Tiny extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.AMSynth), 24, true);
    this.synth.set({
      harmonicity: 2,
      oscillator: {
        type: "amsine2",
        modulationType: "sine",
        harmonicity: 1.01,
      },
      envelope: {
        attack: 0.006,
        decay: 4,
        sustain: 0.04,
        release: 1.2,
      },
      modulation: {
        volume: 13,
        type: "amsine2",
        modulationType: "sine",
        harmonicity: 12,
      },
      modulationEnvelope: {
        attack: 0.006,
        decay: 0.2,
        sustain: 0.2,
        release: 0.4,
      },
    });
    //this.synth.volume.value = 24;

    //this.synth.send('reverb', -12);
  }
}

export class FM_ElectricCello extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.FMSynth), 14);
    this.synth.set({
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: {
        type: "triangle",
      },
      envelope: {
        attack: 0.2,
        decay: 0.3,
        sustain: 0.9,
        release: 1.2,
      },
      modulation: {
        type: "square",
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.2,
        release: 0.1,
      },
    });
    const reverb = new Tone.Freeverb().toDestination();
    this.synth.chain(reverb);
  }
}

export class Kalimba extends Instrument {
  constructor() {
    super(
      new Tone.FMSynth({
        harmonicity: 8,
        modulationIndex: 2,
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.001,
          decay: 2,
          sustain: 0.1,
          release: 2,
        },
        modulation: {
          type: "square",
        },
        modulationEnvelope: {
          attack: 0.002,
          decay: 0.2,
          sustain: 0,
          release: 0.2,
        },
      }),
      10
    );
    const reverb = new Tone.Freeverb().toDestination();
    this.synth.chain(reverb);
  }
}

export class BassGuitar extends Instrument {
  constructor() {
    super(
      new Tone.MonoSynth({
        oscillator: {
          type: "fmsquare5",
          modulationType: "triangle",
          modulationIndex: 2,
          harmonicity: 0.501,
        },
        filter: {
          Q: 1,
          type: "lowpass",
          rolloff: -24,
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.4,
          release: 2,
        },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 1.5,
          baseFrequency: 50,
          octaves: 4.4,
        },
      }),
      2
    );
    const freeverb = new Tone.Freeverb().toDestination();
    this.synth.connect(freeverb);
  }
}

export class Bassy extends Instrument {
  constructor() {
    super(
      new Tone.MonoSynth({
        portamento: 0.08,
        oscillator: {
          partials: [2, 1, 3, 2, 0.4],
        },
        filter: {
          Q: 4,
          type: "lowpass",
          rolloff: -48,
        },
        envelope: {
          attack: 0.04,
          decay: 0.06,
          sustain: 0.4,
          release: 1,
        },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.6,
          release: 1.5,
          baseFrequency: 50,
          octaves: 3.4,
        },
      }),
      16,
      true
    );
  }
}

export class Bah extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.MonoSynth), 30, true);
    this.synth.set({
      oscillator: {
        type: "sawtooth",
      },
      filter: {
        Q: 2,
        type: "bandpass",
        rolloff: -24,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.6,
      },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.4,
        sustain: 1,
        release: 0.7,
        releaseCurve: "linear",
        baseFrequency: 20,
        octaves: 5,
      },
    });
  }
}

export class AlienChorus extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 16, true);
    this.synth.set({
      volume: -15,
      oscillator: {
        type: "fatsine4",
        spread: 60,
        count: 10,
      },
      envelope: {
        attack: 0.4,
        decay: 0.01,
        sustain: 1,
        attackCurve: "sine",
        releaseCurve: "sine",
        release: 0.4,
      },
    });

    //this.synth.send('reverb', -12);
  }
}

export class DelicateWindPart extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 20);
    this.synth.set({
      portamento: 0.0,
      oscillator: {
        type: "square4",
      },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.2,
        release: 2,
      },
    });
    const comp = new Tone.Compressor(-20, 3).toDestination();
    this.synth.chain(comp);
  }
}

export class TreeTrunk extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 24, true);
    this.synth.set({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.1,
        release: 1.2,
      },
    });
    //this.synth.volume.value = 10;

    //this.synth.send('reverb', -12);
  }
}

export class Marimba extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 14, true);
    this.synth.set({
      oscillator: {
        partials: [1, 0, 2, 0, 3],
      },
      envelope: {
        attack: 0.001,
        decay: 1.2,
        sustain: 0,
        release: 1.2,
      },
    });
  }
}

export class Gravel extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.NoiseSynth), 24, true);
    this.synth.set({
      noise: {
        type: "pink",
        playbackRate: 0.1,
      },
      envelope: {
        attack: 0.5,
        decay: 2,
        sustain: 0.5,
        release: 3,
      },
    });
    this.synth.volume.value = 10;

    //this.synth.send('reverb', -12);
  }
}

export class Piano extends Instrument {
  constructor() {
    super(
      new Tone.PolySynth(Tone.Synth, {
        volume: 1,
        oscillator: {
          partials: [1, 2, 1],
        },
        portamento: 0.05,
      }),
      20,
      true
    );
  }
}

export class SteelPan extends Instrument {
  constructor() {
    super(
      new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "fatcustom",
          partials: [0.2, 1, 0, 0.5, 0.1],
          spread: 40,
          count: 3,
        },
        envelope: {
          attack: 0.001,
          decay: 1.6,
          sustain: 0,
          release: 1.6,
        },
      }),
      14,
      true
    );
  }
}
