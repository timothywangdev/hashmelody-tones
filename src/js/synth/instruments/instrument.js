export class Instrument {
  constructor(synth, volume, connect = false) {
    this.synth = synth;
    //this.synth.connect(Tone.getDestination())
    if (connect) {
      this.synth.toDestination();
    }
    this.synth.volume.value = volume;
  }
  triggerAttackRelease(note, duration, time) {
    try {
      if (note) {
        this.synth.triggerAttackRelease(note, duration, time);
      } else {
        this.synth.triggerAttackRelease(duration, time);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
