import * as scales from "./scales";
import * as parts from "./parts";
import instruments from "./instruments";
import * as rythyms from "./rythyms";
import * as utils from "./utils";

class Song {
  constructor() {
    Tone.Master.volume.value = -32;

    // setup instruments
    this.possibleChordPads = [
      new instruments.pads.SimpleSine(),
      new instruments.pads.SwirlySawtoothChorusWithSubBass(),
      new instruments.presets.DelicateWindPart(),
      new instruments.presets.TreeTrunk(),
    ];
    this.possibleBassInstruments = [
      new instruments.bass.FastAttackSquare(),
      new instruments.presets.Bassy(),
    ];
    this.possibleMotifInstruments = [
      new instruments.presets.AM_Tiny(),
      new instruments.presets.Kalimba(),
      //new instruments.presets.Harmonics(),
      new instruments.presets.FM_ElectricCello(),
      new instruments.presets.BassGuitar(),
      new instruments.presets.Bah(),
      //new instruments.presets.Coolguy(),
      //new instruments.presets.Mono_Pizz(),
      //new instruments.presets.DelicateWindPart(),
    ];
    this.drumInstruments = {
      KickDrum: new instruments.drums.KickDrum(),
      Slap: new instruments.drums.Slap(),
      HiHat: new instruments.drums.HiHat(),
      Shaker: new instruments.drums.Shaker(),
      OpenHat: new instruments.drums.OpenHat(Tone.Frequency('C5').toFrequency())
    }
  }

  generate(automata, visCallback) {
    const keyType = scales.getRandomScaleType();
    const songKey = {
      root: scales.getRandomRootNote(),
      type: keyType.intervals,
      typeName: keyType.type,
      chordOctave: utils.randomIntBetween(2, 3),
    };

    const progressionIntervals = utils.randomFromArray(
      scales.chordProgressions
    );
    const chordTypesToUseInProgression =
      scales.getRandomChordTypesForProgression(progressionIntervals);
    const chordProgression = scales.getChordProgressionForKey(
      songKey,
      progressionIntervals,
      chordTypesToUseInProgression
    );
    const possibleChordSectionLengths = [1, 2];
    const chordProgressionBars = utils.randomFromArray(
      possibleChordSectionLengths
    );
    
    const kickRythym = rythyms.randomKickRythym();
    const hihatRythym = rythyms.randomHiHatRythym();
    
    const shakerRythym = rythyms.randomShakerRythym();
    const openHatRythym = rythyms.randomOpenHatRythym();
    const snareRythym = rythyms.randomSnareRythym();

    const bassLinePatterns = [];
    for (let i = 0; i < chordProgression.length; i++) {
      bassLinePatterns.push(rythyms.randomBassRythym());
    }
    const motifPatterns = [];
    for (let i = 0; i < chordProgression.length; i++) {
      motifPatterns.push(rythyms.randomMotifRythym());
    }
    const mainMelodyPatterns = scales.melodyForChordProgression(
      automata,
      chordProgressionBars,
      chordProgression,
      songKey
    );

    const chordInstrument = utils.randomFromArray(this.possibleChordPads);
    const bassInstrument = utils.randomFromArray(
      this.possibleBassInstruments
    );
    const motifInstrument = utils.randomFromArray(
      this.possibleMotifInstruments
    );
    const mainMelodyInstrument = utils.randomFromArray(
      this.possibleMotifInstruments
    );
    const openHatFrequency = Tone.Frequency(songKey.root + "3").toFrequency();
    const generatedSettings = {
      bpm: utils.randomIntBetween(70, 90),
      swing: window.random.random_num(0, 1),
      key: `${songKey.root} (${songKey.typeName})`,
      chordOctave: songKey.chordOctave,
      chordProgression: progressionIntervals,
      chordProgressionBars,
      chordTypesToUseInProgression,
      chordProgressionNotes:
        scales.rootNotesFromChordProgression(chordProgression),
      chordInstrument: chordInstrument,
      bassInstrument: bassInstrument,
      motifInstrument: motifInstrument,
      mainMelodyInstrument: mainMelodyInstrument,
      mainMelodyPatterns,
      kickRythym,
      hihatRythym,
      shakerRythym,
      openHatRythym,
      snareRythym
    };
    const changeRythym = (sequencer, newRythym) => {
      const originalLength = sequencer.length;
      newRythym.forEach((item, index) => {
        sequencer.at(index, item);
      });
      const numberToRemove = originalLength - newRythym.length;
      for (let i = numberToRemove; i > 0; i--) {
        sequencer.remove(newRythym.length + i - 1);
      }
    };

    parts.addDrums(
      "0:0:0",
      `${songKey.root}0`,
      this.drumInstruments.KickDrum,
      kickRythym,
      1,
      true
    )

    parts.addDrums(
      "0:0:0",
      undefined,
      this.drumInstruments.Slap,
      snareRythym,
      1.0,
      true
    )

   parts.addDrums(
      "0:0:0",
      undefined,
      this.drumInstruments.HiHat,
      hihatRythym,
      0.9,
      true
    );

    parts.addDrums(
      "0:0:0",
      undefined,
      this.drumInstruments.Shaker,
      shakerRythym,
      0.8,
      true
    );

    this.drumInstruments.OpenHat.setFrequency(Tone.Frequency(songKey.root + "3").toFrequency())
    parts.addDrums(
      "0:0:0",
      undefined,
      this.drumInstruments.OpenHat,
      openHatRythym,
      0.9,
      true
    );

    parts.addChordProgression(
      "0:0:0", chordProgression, chordInstrument, `${chordProgressionBars}m`, `${chordProgressionBars}m`, true
    )

    const notesPerChord = [];
    for (const bassLinePattern of bassLinePatterns) {
      notesPerChord.push(bassLinePattern.filter((hit) => hit === 1).length);
    }
    const bassOctave = songKey.chordOctave - 1;

    parts.addRepeatingSoloPart(
      "0:0:0",
      scales.smoothBassLineForChordProgression(
        notesPerChord,
        chordProgression,
        songKey,
        bassOctave
      ),
      bassInstrument,
      "4n",
      bassLinePatterns,
      chordProgressionBars,
      true
    );

    /* const motifOctave = songKey.chordOctave + 1;
    parts.addRepeatingSoloPart(
      '0:0:0',
      scales.motifForChordProgression(
        notesPerChord,
        chordProgression,
        songKey,
        motifOctave,
      ),
      motifInstrument,
      1.3,
      motifPatterns,
      chordProgressionBars,
      true,
    ); */

    parts.addSoloPart(
      "0:0:0",
      mainMelodyInstrument,
      mainMelodyPatterns,
      visCallback
    );
  
    return generatedSettings
  }
}

export default Song;
