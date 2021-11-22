// default 1000x1000 canvas
const DEFAULT_SIZE = 1000;

const randomPaletteColor = (random) => {
  const n = Math.floor(random.random_dec() * 16777215);
  const hex = n.toString(16);
  const paddedHex = hex.padStart(6, '0');

  return `#${paddedHex}`;
};

class Renderer {
  constructor(automata, context, random) {
    this.context = context;
    this.automata = automata;
    this.random = random;
    this.activeNoteIdx = null;

    this.palette = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722',
    ];

    const backgroundPalette = [
      '#C51F33',
      '#F38316',
      '#F9B807',
      '#FBD46A',
      '#2D5638',
      '#418052',
      '#58B271',
      '#9ED78E',
      '#1B325F',
      '#2A4DA8',
      '#2B94E1',
      '#92C7D3',
      '#E84A62',
      '#ED7889',
      '#F3A5B0',
      '#0E0F0D',
      '#E5E5E5',
    ];
    // this.backgroundColor = backgroundPalette[random.random_int(0, backgroundPalette.length - 1)];
    this.backgroundColor = backgroundPalette[10];
  }

  setDim(width, height) {
    this.width = width;
    this.height = height;
  }

  getScaleParam(width, height) {
    const DIM = Math.min(width, height);
    const M = DIM / DEFAULT_SIZE;
    const CELL_SIZE = DEFAULT_SIZE / this.automata.config.size;

    const scale = width / height <= 1 ? width : height;

    return {
      CELL_SIZE,
      M,
      scale,
      DIM,
    };
  }

  render(width, height) {
    const {
      CELL_SIZE, M, DIM, scale,
    } = this.getScaleParam(width, height);
    const tx = (width - scale) * 0.5;
    const ty = (height - scale) * 0.5;

    this.context.clearRect(0, 0, width, height);
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, width, height);
    const radius = CELL_SIZE / 2.5;
    this.automata.grid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val > 0) {
          const x = c * CELL_SIZE + radius;
          const y = r * CELL_SIZE + radius;
          this.context.fillStyle = this.palette[val];
          this.context.beginPath();
          this.context.arc(
            tx + x * M,
            ty + y * M,
            radius * M,
            0,
            2 * Math.PI,
          );
          this.context.fill();
          // this.context.fillRect(x * M, y * M, CELL_SIZE * M + 1, CELL_SIZE * M + 1);
        }
      });
    });

    if (this.activeNoteIdx !== null && this.activeNoteIdx < this.automata.config.size * this.automata.config.size) {
      const automataSize = this.automata.config.size;
      const r = Math.floor(this.activeNoteIdx / automataSize);
      const c = this.activeNoteIdx % automataSize;
      const x = c * CELL_SIZE + radius;
      const y = r * CELL_SIZE + radius;
      const val = this.automata.getCell(this.activeNoteIdx);
      if (val > 0) {
        this.context.fillStyle = this.palette[val];
        this.context.beginPath();
        this.context.arc(
          tx + x * M,
          ty + y * M,
          radius * M * 1.5,
          0,
          2 * Math.PI,
        );
        this.context.fill();
      }
    }
  }

  setActiveNode(idx) {
    this.activeNoteIdx = idx;
  }
}

export default Renderer;
