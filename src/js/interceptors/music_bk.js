const AMinorScale = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const addOctaveNumbers = (scale, octaveNumber) => scale.map((note) => {
  const firstOctaveNoteIndex = scale.indexOf('C') !== -1 ? scale.indexOf('C') : scale.indexOf('C#');
  const noteOctaveNumber = scale.indexOf(note) < firstOctaveNoteIndex
    ? octaveNumber - 1
    : octaveNumber;
  return `${note}${noteOctaveNumber}`;
});
const scale = [null, ...addOctaveNumbers(AMinorScale, 3), ...addOctaveNumbers(AMinorScale, 4)];

const NOTE_DURATION_MAP = ['8n', '4n', '4n.', '2n', '2n', '2n.', '2n.', '1n'];

let currIdx = 0;

class Music {
  constructor(automata, renderer) {
    this.automata = automata;
    this.renderer = renderer;
    this.state = {
      toneStarted: false,
      playing: false,
      rowIdx: 0,
      colIdx: 0,
    };
    this.instruments = {};
  }

  getSequence() {
    let mainMelodySequence = Array(this.automata.config.size * this.automata.config.size)
      .fill(0)
      .map((item, idx) => ({
        idx,
        val: this.automata.getCell(idx),
        note: scale[this.automata.getCell(idx)],
      }));

    const sliceIntoChunks = (arr, chunkSize) => {
      const res = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
      }
      return res;
    };

    const chunks = sliceIntoChunks(mainMelodySequence, 8);
    
    
    




    // generate final sequence
    mainMelodySequence = [];
    let t = Tone.Time(0);

    chunks.map((chunk) => {
      let i = 0; let
        j = 0;
      while (i < chunk.length && j < chunk.length) {
        j = i + 1;
        while (j < chunk.length && chunk[i].note === chunk[j].note) {
          j += 1;
        }
        const noteDuration = j - i; // * 8n
        mainMelodySequence.push({
          startIdx: chunk[i].idx,
          endIdx: chunk[j - 1].idx,
          val: chunk[i].val,
          note: chunk[i].note,
          time: t.toBarsBeatsSixteenths(),
          duration: NOTE_DURATION_MAP[noteDuration - 1],
        });
        t = Tone.Time(t + Tone.Time(NOTE_DURATION_MAP[noteDuration - 1]));
        i = j;
      }
    });

    // drums
    // use first two chunks to loop
    const drumChunks = chunks.slice(0, 4);

    t = Tone.Time(0);
    const drumSequence = [];

    drumChunks.map((chunk) => {
      chunk.map(({ val }) => {
        if (val >= 1 && val <= 5) {
          drumSequence.push({
            note: 'C1',
            time: t.toBarsBeatsSixteenths(),
            duration: '8n',
          });
        }
        t = Tone.Time(t + Tone.Time('8n'));
      });
    });

    // snare
    // chunks[2:3] to loop
    const snareChunks = chunks.slice(2, 6);

    t = Tone.Time(0);
    const snareSequence = [];

    snareChunks.map((chunk) => {
      chunk.map(({ val }) => {
        if (val >= 6 && val <= 10) {
          snareSequence.push({
            time: t.toBarsBeatsSixteenths(),
            duration: '4n',
          });
        }
        t = Tone.Time(t + Tone.Time('8n'));
      });
    });

    // bass
    // chunks[3:4] to loop
    const bassChunks = chunks.slice(4, 8);

    t = Tone.Time(0);
    const bassSequence = [];

    const bassScale = [null, ...addOctaveNumbers(AMinorScale, 2)];

    bassChunks.map((chunk) => {
      chunk.map(({ val }, idx) => {
        if (val >= 1 && val <= 7) {
          bassSequence.push({
            note: bassScale[val],
            time: t.toBarsBeatsSixteenths(),
            duration: '4n',
          });
        }
        t = Tone.Time(t + Tone.Time('4n'));
      });
    });

    return {
      mainMelodySequence, drumSequence, snareSequence, bassSequence,
    };
  }

  async prepareAudio() {
    Tone.Transport.bpm.value = 120;

    this.state.toneStarted = true;
    this.instruments.synth = new Tone.PolySynth({
      voice: Tone.Synth,
      maxPolyphony: 20,
    }).toDestination();

    this.instruments.synth2 = new Tone.Synth({
      oscillator: {
        volume: 3,
        count: 3,
        spread: 40,
        type: 'fatsawtooth',
      },
    }).toDestination();

    const {
      mainMelodySequence, drumSequence, snareSequence, bassSequence,
    } = this.getSequence();

    const piano = new Tone.PolySynth(Tone.Synth, {
      volume: 1,
      oscillator: {
        partials: [1, 2, 1],
      },
      portamento: 0.05,
    }).toDestination();

    const bass = new Tone.FMSynth({
      harmonicity: 1,
      modulationIndex: 3.5,
      oscillator: {
        type: 'custom',
        partials: [0, 1, 0, 2],
      },
      envelope: {
        attack: 0.08,
        decay: 0.3,
        sustain: 0,
      },
      modulation: {
        type: 'square',
      },
      modulationEnvelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.3,
        release: 0.01,
      },
    }).toDestination();

    const mainMelodyPart = new Tone.Part(
      (time, {
        startIdx, endIdx, val, note, duration,
      }) => {
        piano.triggerAttackRelease(note, duration, time);
      },
      mainMelodySequence,
    ).start(0);

    const kickDrum = new Tone.MembraneSynth({
      volume: 6,
    }).toDestination();

    const drumPart = new Tone.Part(
      (time, {
        note, duration,
      }) => {
        kickDrum.triggerAttackRelease(note, duration, time);
      },
      drumSequence,
    ).start(0);
    drumPart.loop = true;

    // snare
    const lowPass = new Tone.Filter({
      frequency: 8000,
    }).toDestination();

    const snareDrum = new Tone.NoiseSynth({
      volume: -5,
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.02,
      },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
      },
    }).connect(lowPass);

    const snarePart = new Tone.Part(
      (time, {
        note, duration,
      }) => {
        snareDrum.triggerAttackRelease(duration, time);
      },
      snareSequence,
    ).start(0);
    snarePart.loop = true;

    const bassPart = new Tone.Part(
      (time, {
        note, duration,
      }) => {
        bass.triggerAttackRelease(note, duration, time);
      },
      bassSequence,
    ).start(0);
    bassPart.loop = true;

    const loop = new Tone.Loop((time) => {
	    this.renderer.setActiveNode(currIdx);
      currIdx += 1;
      if (currIdx > this.automata.config.size * this.automata.config.size) {
        this.stop();
      }
    }, '8n').start(0);
    await Tone.start();
  }

  togglePlay() {
    if (Tone.Transport.state === 'started') {
      this.stop();
    } else {
      this.play();
    }
  }

  async play() {
    currIdx = 0;
    await this.prepareAudio();
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }
}

export default Music;
