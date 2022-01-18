import Song from '../synth/funkyDownTempo';

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
    this.song = new Song()
    this.visCallback = idx => {
      this.renderer.setActiveNode(idx)
      console.log(idx)
      if (idx >= this.automata.config.timestamps * this.automata.config.size - 1) {
        // after last one, stop
        this.stop()
      }
    }
    this.generatedSettings = this.song.generate(this.automata, this.visCallback)
    console.log('setting generated')
    console.log(this.generatedSettings)
  }

  async play() {
    try {
    console.log('play')
    await Tone.start();
    Tone.Transport.bpm.value = this.generatedSettings.bpm;
    Tone.Transport.swing = this.generatedSettings.swing;

    Tone.Transport.start();
    console.log(this.generatedSettings);
    this.state.playing = true
    } catch(err) {
      console.log('err', err)
    }
  }

  async stop() {
    await Tone.getContext().close();
    this.state.playing = false;
    
  }

  togglePlay() {
    if (this.state.playing) {
      this.stop();
    } else {
      this.play();
    }
  }
}

export default Music;
