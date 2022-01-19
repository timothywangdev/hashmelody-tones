import * as tome from "chromotome";
import lerp from "../lerp";

// default 1000x1000 canvas
const DEFAULT_SIZE = 1000;

const randomPaletteColor = (random) => {
  const n = Math.floor(random.random_dec() * 16777215);
  const hex = n.toString(16);
  const paddedHex = hex.padStart(6, "0");

  return `#${paddedHex}`;
};

class Renderer {
  constructor(automata, context, random) {
    this.context = context;
    this.automata = automata;
    this.random = random;
    this.activeNoteIdx = null;

    const palettesNames = [
      "retro",
      "retro-washedout",
      "roygbiv-warm",
      "roygbiv-toned",
      "present-correct",
      "tundra3",
      "kov_06",
      "kov_06b",
      "empusa",
      "delphi",
      "mably",
      "nowak",
      "jupiter",
      "hersche",
      "cherfi",
      "harvest",
      "honey",
      "jungle",
      "giftcard",
      "giftcard_sub",
      "dale_paddle",
      "exposito",
    ];
    const idx = this.random.random_int(0, palettesNames.length-1);
    this.palette = tome.get(palettesNames[idx]);
    console.log(this.palette, this.palette.background)
    this.paletteColors = this.palette.colors;
    this.strokeColor = this.palette.stroke;

    // this.backgroundColor = backgroundPalette[random.random_int(0, backgroundPalette.length - 1)];
    // this.backgroundColor = backgroundPalette[10];
    this.backgroundColor = this.palette.background;

    // generate boxes
    // y: relative to CELL_SIZE_HEIGHT, 0 <= y + h <= CELL_SIZE_HEIGHT
    /* const boxList = [[
      {
        x: 0, y: 0, w: 10, h: 50,
      },
      {
        x: 10, y: 0, w: 30, h: 20,
      },
      {
        x: 60, y: 0, w: 50, h: 100,
      }],
    ];
     */

    const automataConfig = automata.config;
    this.boxConfig = {
      MIN_WIDTH: 1,
      MAX_WIDIH: Math.floor(automataConfig.size / 10),
      MIN_HEIGHT: 10,
      MAX_HEIGHT: 100,
      MAX_GAP: Math.floor(automataConfig.size / 10),
      MAX_ROW: 12,
    };
    const boxList = [];
    for (const [r, gridRow] of this.automata.grid.entries()) {
      const row = {
        startingTheta: 0,
        omega: 0.0,
        alpha: 0.0,
        cumulativeArea: 0.0,
        boxRow: [],
      };
      let lastEndingX = 0;
      for (const [c, { val, len, begin }] of gridRow.entries()) {
        if (val === 0) {
          // empty
          lastEndingX += this.boxConfig.MIN_WIDTH;
        } else if (begin) {
          const y = this.random.random_num(0, this.boxConfig.MIN_HEIGHT)
          const box = {
            x: lastEndingX + this.random.random_num(0, this.boxConfig.MAX_GAP),
            y,
            w: len,
            h: this.random.random_num(
              this.boxConfig.MIN_HEIGHT,
              this.boxConfig.MAX_HEIGHT - y
            ),
            gapAfter:
              c === gridRow.length - 1
                ? this.random.random_num(0, this.boxConfig.MAX_GAP)
                : 0,
            color: this.paletteColors[val],
            radiusDelta: 0,
            radiusV: 0,
            radiusA: 0,
            shown: true,
            idx: r * this.automata.config.size + c,
          };
          lastEndingX = box.x + box.w + box.gapAfter;
          row.cumulativeArea += box.w * box.h;
          row.boxRow.push(box);
        }
      }
      row.omega = lerp(
        0,
        0.01,
        row.cumulativeArea / (lastEndingX * this.boxConfig.MAX_HEIGHT)
      );
      boxList.push(row);
    }
    this.boxList = boxList;
    this.currRow = 0;
    console.log(boxList);
  }

  setDim(width, height) {
    this.context.fillStyle = this.palette[1];
    this.width = width;
    this.height = height;
  }

  getScaleParam(width, height) {
    const DIM = Math.min(width, height);
    const M = DIM / DEFAULT_SIZE;
    const availableHeight = (0.8 * DEFAULT_SIZE) / 2.0;
    const CELL_SIZE_HEIGHT = availableHeight / this.boxConfig.MAX_ROW;
    const BASE_RADIUS = DEFAULT_SIZE / 2.0 - availableHeight;

    const scale = width / height <= 1 ? width : height;

    return {
      CELL_SIZE_HEIGHT,
      M,
      scale,
      DIM,
      BASE_RADIUS,
    };
  }
  // render(width, height) {
  // }
  render(width, height) {
    const { CELL_SIZE_HEIGHT, M, DIM, scale, BASE_RADIUS } = this.getScaleParam(
      width,
      height
    );
    const ratio = window.devicePixelRatio

    // refer to
    // https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    
    this.context.clearRect(0, 0, width, height);

    // set background
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, width, height);

    this.context.translate(width / 2, height / 2);

    const drawBox = (thetaLeft, thetaRight, radiusTop, radiusBottom, color) => {
      const p1 = [
        Math.cos(thetaLeft) * radiusTop,
        Math.sin(thetaLeft) * radiusTop,
      ];
      const p2 = [
        Math.cos(thetaLeft) * radiusBottom,
        Math.sin(thetaLeft) * radiusBottom,
      ];
      const p3 = [
        Math.cos(thetaRight) * radiusBottom,
        Math.sin(thetaRight) * radiusBottom,
      ];
      const p4 = [
        Math.cos(thetaRight) * radiusTop,
        Math.sin(thetaRight) * radiusTop,
      ];
      this.context.fillStyle = color;
      this.context.beginPath();
      this.context.moveTo(p1[0] * M, p1[1 * M]);
      this.context.lineTo(p2[0] * M, p2[1] * M);
      this.context.arc(0, 0, radiusBottom * M, thetaLeft, thetaRight);
      this.context.lineTo(p4[0] * M, p4[1] * M);
      this.context.arc(0, 0, radiusTop * M, thetaRight, thetaLeft, true);
      this.context.closePath();
      this.context.fill();
    };

    for (const [r, rowData] of this.boxList
      .slice(this.currRow, this.currRow + this.boxConfig.MAX_ROW)
      .entries()) {
      let totalLen = 0;
      for (const [c, box] of rowData.boxRow.entries()) {
        totalLen = Math.max(totalLen, box.x + box.w + box.gapAfter);
      }

      const currRadius =
        (this.boxConfig.MAX_ROW - r - 1) * CELL_SIZE_HEIGHT + BASE_RADIUS * 0.6;
      for (const [c, box] of rowData.boxRow.entries()) {
        if (this.activeNoteIdx === box.idx) {
          // make it fly away
          if (box.radiusV === 0) {
            box.radiusV = 5;
          }
        }
        box.radiusDelta += box.radiusV;

        const thetaLeft = (Math.PI * 2 * box.x) / totalLen;
        const thetaRight = (Math.PI * 2 * (box.x + box.w)) / totalLen;

        const radiusTop =
          currRadius +
          lerp(
            0,
            CELL_SIZE_HEIGHT,
            ((box.y + box.h) * 1.0) / this.boxConfig.MAX_HEIGHT
          );
        const radiusBottom =
          currRadius +
          lerp(0, CELL_SIZE_HEIGHT, (box.y * 1.0) / this.boxConfig.MAX_HEIGHT);

        drawBox(
          rowData.startingTheta + thetaLeft,
          rowData.startingTheta + thetaRight,
          1.5 * box.radiusDelta + radiusTop,
          box.radiusDelta + radiusBottom,
          box.color
        );
      }

      rowData.startingTheta += rowData.omega;
    }
  }

  setActiveNode(idx) {
    this.activeNoteIdx = idx;
    //console.log(idx);
  }
}

export default Renderer;
