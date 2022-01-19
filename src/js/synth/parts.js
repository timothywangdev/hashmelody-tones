export const addChordProgression = (startTime, chordProgression, instrument, noteLength, interval, shouldLoop, visCallback) => {
  const loop = new Tone.Loop(((time) => {
    // Take first chord
    const currentChord = chordProgression.shift();
    // add chord to back of queue
    chordProgression.push(currentChord);
    // play it
    instrument.triggerAttackRelease(currentChord, noteLength, time);
  }), interval);

  loop.loop = shouldLoop;
  loop.start(startTime);
  return loop;
};

export const addDrums = (startTime, note, instrument, pattern, probability, shouldLoop) => {
  const sequencer = new Tone.Sequence(
    ((time, hit) => {
      if (hit === 1) {
        instrument.triggerAttackRelease(note, '16n', time);
      }
    }),
    pattern,
    '16n',
  );
  sequencer.probability = probability;
  sequencer.loop = shouldLoop;
  sequencer.start(startTime);

  return sequencer;
};

export const addSoloPart = (startTime, instrument, pattern, visCallback) => {
  const sequencer = new Tone.Sequence(
    ((time, {idx, begin, val, note, duration}) => {
      if (val > 0 && note && begin) {
        instrument.triggerAttackRelease(note, duration, time);
      }
      Tone.Draw.schedule(() => {
      // the callback synced to the animation frame at the given time
        visCallback(idx);
      }, time);
    }),
    pattern,
    '8n',
  );
  sequencer.loop = false;
  sequencer.start(startTime);
  return sequencer;
};

export const addRepeatingSoloPart = (startTime, notes, instrument, noteLength, patterns, repeatTimes, shouldLoop) => {
  const expandedSequence = [];
  for (const section of notes) {
    for (let ri = 0; ri < repeatTimes; ri++) {
      for (let ni = 0; ni < section.length; ni++) {
        const note = section[ni];
        expandedSequence.push(note);
      }
    }
  }

  const expandedPattern = [];
  for (const section of patterns) {
    for (let ri = 0; ri < repeatTimes; ri++) {
      for (let ni = 0; ni < section.length; ni++) {
        const rythym = section[ni];
        expandedPattern.push(rythym);
      }
    }
  }

  const sequencer = new Tone.Sequence(
    ((time, hit) => {
      if (hit === 1) {
        const note = expandedSequence.shift();
        expandedSequence.push(note);
        instrument.triggerAttackRelease(note, noteLength, time);
      }
    }),
    expandedPattern,
    '16n',
  );

  sequencer.loop = shouldLoop;
  sequencer.start(startTime);
  return sequencer;
};

export function Part(mutationPayload, mutationFunction) {
  this.mutationFunction = mutationFunction;
  this.mutate = function () {
    this.mutationFunction(mutationPayload);
  };
}