import * as utils from './utils';

const roots = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const scales = {
  Major: [2, 2, 1, 2, 2, 2],
  Minor: [2, 1, 2, 2, 1, 2],
  HarmonicMinor: [2, 1, 2, 2, 1, 3],
  MelodicMinor: [2, 1, 2, 2, 2, 2],
  PentatonicMajor: [2, 2, 3, 2],
  PentatonicMinor: [3, 2, 2, 3],
  PentatonicBlues: [3, 2, 1, 1],
  PentatonicNeutral: [2, 3, 2],
  Ionian: [2, 2, 1, 2, 2, 2],
  Aeolian: [2, 1, 2, 2, 1, 2],
  Dorian: [2, 1, 2, 2, 2, 1],
  Mixolydian: [2, 2, 1, 2, 2, 1],
  Phrygian: [1, 2, 2, 2, 1, 2],
  Lydian: [2, 2, 2, 1, 2, 2],
  Locrian: [1, 2, 2, 1, 2, 2],
  Dominant7th: [2, 2, 1, 2, 2, 1],
  Blues: [3, 2, 1, 1, 3],
};

export const chordProgressions = [
  [1, 5, 4, 4, 1, 5, 1, 5],
  [1, 1, 1, 1, 4, 4, 1, 1, 5, 5, 1, 1],
  [1, 6, 4, 5],
  [1, 4, 7, 4],
  [2, 5, 1],
  [1, 5, 7, 4],
  [6, 2, 5, 1],
  [1, 5, 6, 3],
  [1, 4, 2, 5],
  [1, 5, 6, 3, 4, 1, 4, 5],
];

const chords = [[1, 3, 5], [1, 3, 5, 7], [1, 3, 5, 9]];

export const getRandomRootNote = () => roots[utils.randomIntBetween(0, roots.length - 1)];

export const actualNotesFromScale = (tonic, scale, lowOctave, highOctave) => {
  let notes = [];

  // Get just the note value without octaves
  if (!utils.isNumeric(tonic)) {
    tonic = tonic.replace(/[0-9]/g, '');
  } else {
    tonic = Tone.Frequency(tonic)
      .toNote()
      .replace(/[0-9]/g, '');
  }

  for (let octave = lowOctave; octave <= highOctave; octave++) {
    const octaveScale = scaleFromTonic(tonic + octave, scale);
    notes = [...notes, ...octaveScale];
  }
  return notes;
};

export const getRandomScaleType = () => {
  const keys = Object.keys(scales);
  const randomType = utils.randomFromArray(keys);
  return { type: randomType, intervals: scales[randomType] };
};

export const getChordProgressionForKey = (key, progression, chordTypesToUse) => {
  const progressionRootNotes = chordFromScale(progression, key.root, key.type, key.chordOctave);

  const progressionNotes = [];
  for (let index = 0; index < progressionRootNotes.length; index++) {
    const progressionIndex = progression[index];
    const chord = chordTypesToUse[index];
    progressionNotes.push(chordFromScale(chord, key.root, key.type, key.chordOctave, progressionIndex));
  }
  return progressionNotes;
};

export const getRandomChordTypesForProgression = (progressionRootNotes) => {
  const chordTypes = [];
  for (let index = 0; index < progressionRootNotes.length; index++) {
    chordTypes.push(utils.randomFromArray(chords));
  }
  return chordTypes;
};

export const chordFromScale = (chordToneIndexes, tonic, scale, mainOctave, indexOffset = 0) => {
  const fullScale = actualNotesFromScale(tonic, scale, mainOctave, mainOctave + 1);

  const filteredScale = [];
  for (const index of chordToneIndexes) {
    filteredScale.push(fullScale[index + indexOffset - 1]);
  }

  return filteredScale;
};

export const scaleFromTonic = (tonic, intervals) => {
  const scale = [];
  let note = Tone.Frequency(tonic);
  scale.push(tonic);

  for (const interval of intervals) {
    note = note.transpose(interval);
    scale.push(note.toFrequency());
  }

  return scale;
};

export const rootNotesFromChordProgression = (chordProgression) => chordProgression
  .map((chord) => Tone.Frequency(chord[0])
    .toNote()
    .replace(/[0-9]/g, ''))
  .join(', ');

export const bassLineForChordProgression = (notesPerChord, chordProgression, key, octave) => {
  const transposeSemiTones = -1 * octave * 12;
  const notes = [];

  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i];
    const noteCountForChord = notesPerChord[i];
    const chordRoot = Tone.Frequency(chord[0]).transpose(transposeSemiTones);
    const scaleForCurrentChord = actualNotesFromScale(key.root, key.type, octave, octave);

    const notesForChord = [chordRoot];
    for (let i = 0; i < noteCountForChord - 1; i++) {
      notesForChord.push(utils.randomFromArray(scaleForCurrentChord));
    }
    notes.push(notesForChord);
  }

  return notes;
};

export const smoothBassLineForChordProgression = (notesPerChord, chordProgression, key, octave) => {
  const transposeSemiTones = -1 * octave * 12;
  const notes = [];

  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i];
    const noteCountForChord = notesPerChord[i];
    const chordRoot = Tone.Frequency(chord[0]).transpose(transposeSemiTones);
    const scaleForCurrentChord = actualNotesFromScale(key.root, key.type, octave, octave);

    const notesForChord = [chordRoot];
    let previousNoteIndex = 0;
    for (let i = 0; i < noteCountForChord - 1; i++) {
      // get a note not too far away from the last
      const newNote = utils.randomIntBetween(Math.max(previousNoteIndex - 2, 0), Math.min(previousNoteIndex + 2, scaleForCurrentChord.length));
      notesForChord.push(scaleForCurrentChord[newNote]);

      previousNoteIndex = newNote;
    }
    notes.push(notesForChord);
  }

  return notes;
};

export const motifForChordProgression = (notesPerChord, chordProgression, key, octave) => {
  const notes = [];

  for (let i = 0; i < chordProgression.length; i++) {
    const noteCountForChord = notesPerChord[i];
    const scaleForCurrentChord = actualNotesFromScale(key.root, key.type, octave, octave);
    const notesForChord = [];
    let previousNoteIndex = 0;
    for (let i = 0; i < noteCountForChord; i++) {
      // get a note not too far away from the last
      const newNote = utils.randomIntBetween(Math.max(previousNoteIndex - 2, 0), Math.min(previousNoteIndex + 2, scaleForCurrentChord.length));
      notesForChord.push(scaleForCurrentChord[newNote]);

      previousNoteIndex = newNote;
    }
    notes.push(notesForChord);
  }

  return notes;
};

export const melodyForChordProgression = (automata, chordProgressionBars, chordProgression, key) => {
    // generate final sequence
    const mainMelodySequence = [];

    const melodyOctave = key.chordOctave + 1;
    const transposeSemiTones = melodyOctave - key.chordOctave * 12;

    for(let i = 0; i < automata.config.size * automata.config.timestamps; i+=1) {
      const chunkIdx = Math.floor(i / (8 * chordProgressionBars))
      const chord = chordProgression[chunkIdx % chordProgression.length]
      const chordRoot = Tone.Frequency(chord[0]).transpose(transposeSemiTones);
      const chordRootToNote = Tone.Frequency(chordRoot).toNote();
      const scaleForCurrentChord = actualNotesFromScale(chordRootToNote, key.type, melodyOctave, melodyOctave+1);
      const cell = automata.getCell(i);
      mainMelodySequence.push({
          idx: i,
          begin: cell.begin,
          val: cell.val,
          note: scaleForCurrentChord[cell.val - 1],
          duration: cell.begin && Tone.Time('8n').toSeconds() * cell.len
      })
    }

  //debugger
  return mainMelodySequence;
};
