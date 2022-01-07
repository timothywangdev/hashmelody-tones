import * as tome from 'chromotome';

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

    const PALETTE_NAME = 'roygbiv-toned';
    this.palette = tome.get(PALETTE_NAME).colors;
    this.strokeColor = tome.get(PALETTE_NAME).stroke;

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
    // this.backgroundColor = backgroundPalette[10];
    this.backgroundColor = tome.get(PALETTE_NAME).background;
  }

  setDim(width, height) {
    this.context.fillStyle = this.palette[1];
    this.width = width;
    this.height = height;
  }

  getScaleParam(width, height) {
    const DIM = Math.min(width, height);
    const M = DIM / DEFAULT_SIZE;
    const CELL_SIZE_HEIGHT = DEFAULT_SIZE / this.automata.config.size;

    const scale = width / height <= 1 ? width : height;

    return {
      CELL_SIZE_HEIGHT,
      M,
      scale,
      DIM,
    };
  }

  render(width, height) {
    const {
      CELL_SIZE_HEIGHT, M, DIM, scale,
    } = this.getScaleParam(width, height);

    this.context.translate(width / 2, height / 2);

    this.context.clearRect(0, 0, width, height);

    const radius = CELL_SIZE / 2.5;

    const triangleTypeList = ['UL', 'LR', 'LL', 'UR'];

    const drawLine = (fromX, fromY, toX, toY, color) => {
      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.moveTo(tx + fromX * M, ty + fromY * M);
      this.context.lineTo(tx + toX * M, ty + toY * M);
      this.context.stroke();
    };
    this.automata.grid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val >= 0) {
          const triangleType = r % 2 === 0 ? triangleTypeList[c % 4] : triangleTypeList[(c + 2) % 4];
          const x = Math.floor(c / 2) * CELL_SIZE;
          const y = r * CELL_SIZE * 0.5;
          // fill
          this.context.fillStyle = this.palette[val % this.palette.length];
          this.context.beginPath();
          this.context.moveTo(tx + x * M, ty + y * M);
          if (triangleType === 'UL') {
            this.context.lineTo(tx + x * M, ty + (y + CELL_SIZE * 0.5) * M);
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + y * M);
          } else if (triangleType === 'UR') {
            this.context.lineTo(tx + x * M, ty + (y + CELL_SIZE * 0.5) * M);
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + (y + CELL_SIZE * 0.5) * M);
          } else if (triangleType === 'LL') {
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + (y + CELL_SIZE * 0.5) * M);
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + y * M);
          } else if (triangleType === 'LR') {
            this.context.moveTo(tx + x * M, ty + (y + CELL_SIZE * 0.5) * M);
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + (y + CELL_SIZE * 0.5) * M);
            this.context.lineTo(tx + (x + CELL_SIZE) * M, ty + y * M);
          }
          this.context.closePath();
          this.context.fill();
        // this.context.fillRect(x * M, y * M, CELL_SIZE * M + 1, CELL_SIZE * M + 1);
        }
      });
    });

    this.automata.grid.forEach((row, r) => {
      row.forEach((val, c) => {
        const triangleType = r % 2 === 0 ? triangleTypeList[c % 4] : triangleTypeList[(c + 2) % 4];
        const x = Math.floor(c / 2) * CELL_SIZE;
        const y = r * CELL_SIZE * 0.5;
        let prevColor = -1;

        // draw top line
        if (triangleType === 'UL' || triangleType === 'UR') {
          prevColor = r === 0 ? -1 : this.automata.grid[r - 1][c];
          drawLine(x, y, x + CELL_SIZE, y, prevColor === val ? val : 'black');
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
