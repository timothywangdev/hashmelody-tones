import * as bass from './bass';
import Instrument from './instrument';

export class SimpleSine extends Instrument {
  constructor() {
    super(new Tone.PolySynth(Tone.Synth), 0);
    this.synth.set({
      oscillator: {
        type: 'fatsine',
      },
      envelope: {
        attack: 0.2,
        decay: 0.1,
        sustain: 1,
        release: 1,
      },
      portamento: 0.2,
    });
    const filter = new Tone.Filter(250, "lowpass").toDestination();;

    const lfo = new Tone.LFO("4m", 550, 800);
    lfo.start();
    lfo.connect(filter.frequency);

    const reverb = new Tone.Freeverb()
    this.synth.chain(reverb, filter);
  }
}

export class SoftSquareFm extends Instrument {
  constructor(volume = 24) {
    super(new Tone.PolySynth(Tone.Synth), volume);
    this.synth.set({
      oscillator: {
        type: 'fmsquare2',
      },
      envelope: {
        attack: 0.2,
        decay: 0.1,
        sustain: 1,
        release: 1,
      },
      portamento: 0,
    });
    this.synth.volume.value = 8;

    const reverb = new Tone.Freeverb().toDestination();
    const filter = new Tone.Filter(400, 'lowpass');
    this.synth.chain(filter, reverb);
  }
}

export const SwirlySawtoothChorusWithSubBass = function() {
  try {
  const chordSynth = new Tone.PolySynth(Tone.Synth);
  chordSynth.set({
    oscillator: {
      type: "fatsawtooth"
    },
    envelope: {
      attack: 0.2,
      decay: 0.1,
      sustain: 1,
      release: 1
    },
    portamento: 0.2
  });
  const filter = new Tone.Filter(250, "lowpass").toMaster();

  const lfo = new Tone.LFO("8m", 550, 1500);
  lfo.start();
  lfo.connect(filter.frequency);

  const chorus = new Tone.Chorus("1:0:0", 2.5, 1);
  const reverb = new Tone.Freeverb();

  chordSynth.chain(chorus, reverb, filter);

  //Add bass for the root note
  const bassSynth = bass.subBass();
  bassSynth.volume.value = bassSynth.volume.value - 22;
  chordSynth.volume.value = 0;
  this.triggerAttackRelease = (chord, duration, time) => {
    const lowRootNote = Tone.Frequency(chord[0]).transpose(-12);
    chordSynth.triggerAttackRelease(chord, duration, time);
    bassSynth.triggerAttackRelease(lowRootNote, duration, time);
  };
  } catch(err) {
    console.log(err)
  }
}; 