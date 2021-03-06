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
      instruments.pads.SimpleSine,
      instruments.pads.SwirlySawtoothChorusWithSubBass,
      //instruments.presets.DelicateWindPart,
      instruments.presets.TreeTrunk,
    ];
    this.possibleBassInstruments = [
      instruments.bass.FastAttackSquare,
      instruments.presets.Bassy,
      //instruments.presets.BassGuitar,
    ];
    this.possibleMotifInstruments = [
      instruments.presets.AM_Tiny,
      instruments.presets.Kalimba,
      //new instruments.presets.Harmonics(),
      instruments.presets.FM_ElectricCello,
      //instruments.presets.BassGuitar,
      instruments.presets.Bah,
      instruments.presets.Marimba,
      instruments.presets.Piano,
      instruments.presets.SteelPan,
      //new instruments.presets.Coolguy(),
      //new instruments.presets.Mono_Pizz(),
      //new instruments.presets.DelicateWindPart(),
    ];
    this.drumInstruments = {
      KickDrum: instruments.drums.KickDrum,
      Slap: instruments.drums.Slap,
      HiHat: instruments.drums.HiHat,
      Shaker: instruments.drums.Shaker,
      OpenHat: instruments.drums.OpenHat
    }
  }

  generate(automata, visCallback) {
    const keyType = scales.getRandomScaleType();
    const songKey = {
      root: scales.getRandomRootNote(),
      type: keyType.intervals,
      typeName: keyType.type,
      chordOctave: utils.randomIntBetween(3,3),
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

    const notesPerChord = [];
    for (const bassLinePattern of bassLinePatterns) {
      notesPerChord.push(bassLinePattern.filter((hit) => hit === 1).length);
    }
    const bassOctave = songKey.chordOctave - 1;

    const chordInstrument = new (utils.randomFromArray(this.possibleChordPads))();
    const bassInstrument = new (utils.randomFromArray(
      this.possibleBassInstruments
    ))();
    const motifInstrument = new (utils.randomFromArray(
      this.possibleMotifInstruments
    ))();
    const mainMelodyInstrument = new (utils.randomFromArray(
      this.possibleMotifInstruments
    ))();
    //const openHatFrequency = Tone.Frequency(songKey.root + "3").toFrequency();
    const generatedSettings = {
      bpm: utils.randomIntBetween(70, 90),
      swing: window.random.random_num(0, 1),
      key: `${songKey.root} (${songKey.typeName})`,
      chordOctave: songKey.chordOctave,
      chordProgression,
      chordProgressionBars,
      chordTypesToUseInProgression,
      chordProgressionNotes:
        scales.rootNotesFromChordProgression(chordProgression),
      chordInstrument: chordInstrument.constructor.name,
      bassInstrument: bassInstrument.constructor.name,
      motifInstrument: motifInstrument.constructor.name,
      mainMelodyInstrument: mainMelodyInstrument.constructor.name,
      mainMelodyPatterns,
      bassLinePatterns,
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
      new this.drumInstruments.KickDrum(),
      kickRythym,
      1,
      true
    )

    parts.addDrums(
      "0:0:0",
      undefined,
      new this.drumInstruments.Slap(),
      snareRythym,
      1.0,
      true
    )

  //  parts.addDrums(
  //     "0:0:0",
  //     undefined,
  //     this.drumInstruments.HiHat,
  //     hihatRythym,
  //     0.9,
  //     true
  //   );

    // parts.addDrums(
    //   "0:0:0",
    //   undefined,
    //   new this.drumInstruments.Shaker(),
    //   shakerRythym,
    //   0.8,
    //   true
    // );

    // this.drumInstruments.OpenHat.setFrequency(Tone.Frequency(songKey.root + "3").toFrequency())
    // parts.addDrums(
    //   "0:0:0",
    //   undefined,
    //   this.drumInstruments.OpenHat,
    //   openHatRythym,
    //   0.9,
    //   true
    // );

    parts.addChordProgression(
      "0:0:0", chordProgression, chordInstrument, `${chordProgressionBars}m`, `${chordProgressionBars}m`, true
    )

  
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
