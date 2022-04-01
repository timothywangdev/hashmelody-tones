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
  hash: hashParam || '9d407d7c8df75e1b49433374b2c6f1557f986ce30f5619a23c50fb031921b55e',
};

var random = new Random(tokenData.hash);
window.random = random
window.tokenData = tokenData

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
const draw = (timestamp) => {
  renderer.render(width, height, timestamp);
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
    mainMelodyInstrument: settings.mainMelodyInstrument,
    palettes: settings.palettes,
    style: settings.style
  }
}

const props = {
  resetAnimation: async () => {
    const genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    window.location.search = `hash=${genRanHex(64)}`;
  },
  hash: tokenData.hash,
  ...getSongSetteings({...music.generatedSettings, ...renderer.generatedSettings})
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

gui.add(props, 'palettes').name('Color Palettes');
gui.add(props, 'style').name('Art Style');
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
