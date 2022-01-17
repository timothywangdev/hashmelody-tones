import * as Tone from 'tone';
import scale from '../scales/minor';
import { triad } from './chord';

const synth = new Tone.PolySynth({ voice: Tone.Synth, maxPolyphony: 4 }).toDestination();
const time = 4;
let currentProgression;

const progression = [
  [0, 4, 5, 3],
  [0, 3, 4, 0],
  [0, 3, 0, 4],
  [0, 3, 4, 0],
  [3, 4, 0, 2],
  [3, 4, 0, 5],
  [3, 4, 1, 2],
  [3, 4, 1, 5],
];

const playNote = (lines, offset) => {
  const line = lines[0];
  const nextLine = lines[1];

  const init = (line.length / 2) - 2;
  const end = (line.length / 2) + 1;
  const index = parseInt(line.slice(init, end).join(''), 2);
  synth.volume.value = -12;
  synth.triggerAttackRelease(scale[1][index], '2n');
  /* if (offset % time === 0) {
    if (offset % (time * 4) === 0) {
      currentProgression = index;
    }
    synth.set('volume', 5);
    synth.triggerAttackRelease(triad(scale[0], progression[currentProgression][(offset / time) % time]), `${time}n`);
  } */
};

export default playNote;
