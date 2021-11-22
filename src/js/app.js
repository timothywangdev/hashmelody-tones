import Automata from './automata';
import Random from './random';
import Renderer from './interceptors/renderer';
import Music from './interceptors/music';

let tokenData = {
  hash: '0x95c138f8b54949c12d05105cfc01960fc496813cbc3495b277aeed748549631',
};

let random = new Random(tokenData.hash);

let automata = new Automata(32, 15, 1, random);
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
const gui = new dat.GUI({ autoPlace: true, width: 300 });

let id;
const draw = () => {
  renderer.render(width, height);
  gui.updateDisplay();
  id = requestAnimationFrame(draw);
};

const props = {
  resetAnimation: async () => {
    music.stop();

    const genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    tokenData = {
      hash: `0x${genRanHex(64)}`,
    };
    random = new Random(tokenData.hash);
    automata = new Automata(32, 15, 1, random);
    automata.generate();
    renderer = new Renderer(automata, context, random);
    music = new Music(automata, renderer);
    cancelAnimationFrame(id);
    draw();

    props.hash = tokenData.hash;
    gui.updateDisplay();
  },
  hash: tokenData.hash,
};
// gui.add(props, 'hash').name('Token ID').listen();
gui.add(props, 'resetAnimation')
  .name('Randomize Hash');

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
