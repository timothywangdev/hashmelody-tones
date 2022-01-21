import Automata from './automata';
import Random from './random';
import Renderer from './interceptors/renderer';
import Music from './interceptors/music';

let tmp = window.location.search.split('=')
var hashParam
if (tmp.length == 2) {
  hashParam = tmp[1]
}
let tokenData = {
  hash: hashParam || '0x95c138f8b54949c12d05105cfc01960fc496813cbc3495b277aeed748549631',
};

var random = new Random(tokenData.hash);
window.random = random

let automata = new Automata(16, 12, 8, 1, random);
automata.generate();

const W = window;
const D = document;
const canvas = D.body.appendChild(D.createElement('canvas'));
const context = canvas.getContext('2d');
let renderer = new Renderer(automata, context, random);
let music = new Music(automata, renderer);

let width; let height; let
  pixelRatio;

// setup gui
const gui = new dat.GUI({ autoPlace: true, width: 400 });

let id;
const draw = () => {
  renderer.render(width, height);
  gui.updateDisplay();
  id = requestAnimationFrame(draw);
};

const getSongSetteings = settings => {
  return {
    key: settings.key,
    bpm: settings.bpm,
    chordOctave: settings.chordOctave,
    chordProgressionBars: settings.chordProgressionBars,
    chordProgressionNotes: settings.chordProgressionNotes,
    chordInstrument: settings.chordInstrument,
    bassInstrument: settings.bassInstrument,
    mainMelodyInstrument: settings.mainMelodyInstrument
  }
}

const props = {
  resetAnimation: async () => {
    const genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    window.location.search = `hash=${genRanHex(64)}`;
  },
  hash: tokenData.hash,
  ...getSongSetteings(music.generatedSettings)
};

gui.add(props, 'resetAnimation')
  .name('Randomize Hash');
gui.add(props, 'hash').name('Token ID').listen();
gui.add(props, 'key').name('Key');
gui.add(props, 'bpm').name('BPM');
gui.add(props, 'chordOctave').name('Chord Octave');
gui.add(props, 'chordProgressionBars').name('Chord Progression Bars');
gui.add(props, 'chordProgressionNotes').name('Chord Progression');
gui.add(props, 'mainMelodyInstrument').name('Main Melody Instrument');
gui.add(props, 'bassInstrument').name('Bass Instrument');
gui.add(props, 'chordInstrument').name('Chord Instrument');
gui.show();

const resize = () => {
  width = W.innerWidth;
  height = W.innerHeight;
  pixelRatio = W.devicePixelRatio;
  canvas.width = ~~(width * pixelRatio);
  canvas.height = ~~(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.save();
  context.scale(pixelRatio, pixelRatio);
  context.restore();
};

canvas.addEventListener('click', () => {
  music.togglePlay();
});
W.addEventListener('resize', resize);
resize();
draw();
