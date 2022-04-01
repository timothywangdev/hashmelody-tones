import * as tome from "chromotome";
import lerp from "../lerp";
import SimplexNoise from "simplex-noise";

// default 1000x1000 canvas
const DEFAULT_SIZE = 1000;

const randomPaletteColor = (random) => {
  const n = Math.floor(random.random_dec() * 16777215);
  const hex = n.toString(16);
  const paddedHex = hex.padStart(6, "0");

  return `#${paddedHex}`;
};

//distance between eye and view screen
let PERSPECTIVE; // The field of view of our 3D scene

var d = 500;

class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.polar = {
      radius: Math.sqrt(x * x + y * y),
      theta: Math.atan2(y, x),
    };
    this.config = {
      omega: 0,
      radiusV: 0,
      zV: 0,
    };
  }

  setConfig(config) {
    this.config = { ...this.config, config };
  }

  getPolarFromCartesian(polar) {
    const { theta, radius } = polar;
    return {
      x: Math.cos(theta) * radius,
      y: Math.sin(theta) * radius,
    };
  }

  update(timeDelta = 1) {}

  visible({ x, y, z }) {
    // when z -> -PERSPECTIVE, PERSPECTIVE + z -> inf and x, y -> inf
    // but change in z is not continuous, may never reach inf
    // we can only be sure it's passed inf in (x,y) when z > -PERSPECTIVE
    return z >= -PERSPECTIVE;
  }

  distance(p) {
    return Math.sqrt(
      Math.pow(this.x - p.x, 2) +
        Math.pow(this.y - p.y, 2) +
        Math.pow(this.z - p.z, 2)
    );
  }

  translate({ theta, radius, z }) {
    const _polar = {
      radius: this.polar.radius + radius,
      theta: this.polar.theta + theta,
    };
    const _z = this.z + z;
    return {
      ...this.getPolarFromCartesian(_polar),
      z: _z,
      polar: _polar
    };
  }

  project2d({ x, y, z }) {
    // The scaleProjected will store the scale of the element based on its distance from the 'camera'
    let scaleProjected = Math.abs(PERSPECTIVE / (PERSPECTIVE + z));
    if (z <= -PERSPECTIVE) {
      // set to scale to inf when PERSPECTIVE + z -> 0
      scaleProjected = 100000;
    }
    // The xProjected is the x position on the 2D world
    let xProjected = x * scaleProjected;
    // The yProjected is the y position on the 2D world
    let yProjected = y * scaleProjected;
    return new Point(xProjected, yProjected, z);
  }
}


class CircularSector {
  constructor(theta, radiusTop, radiusBottom, pos, config, style) {
    this.style = style;
    this.theta = theta;
    this.radiusTop = radiusTop;
    this.radiusBottom = radiusBottom;
    this.ulp = new Point(0, radiusTop, 0);
    this.urp = new Point(Math.cos(Math.PI*0.5 - theta) * radiusTop, Math.sin(Math.PI*0.5 - theta) * radiusTop, 0);
    this.llp = new Point(0, radiusBottom, 0);
    this.lrp = new Point(Math.cos(Math.PI*0.5 - theta) * radiusBottom, Math.sin(Math.PI*0.5 - theta) * radiusBottom, 0);
    this.points = [this.ulp, this.urp, this.lrp, this.llp];
    this.pos = pos;
    this.config = {
      visible: true,
      highlight: false,
      wiggle: false,
      simplex: undefined,
      omega: 0,
      radiusV: 0,
      zV: 0,
      // used to make wave animation
      ...config,
    };
  }

  depth() {
    return (this.points[0].translate(this.pos)).z
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  update(timestamp) {
    let timeDelta = this.lastTimestamp ? timestamp - this.lastTimestamp : 0;
    this.lastTimestamp = timestamp;
    this.pos.theta += this.config.omega * timeDelta;
    this.pos.radius += this.config.radiusV * timeDelta;
    this.pos.z += this.config.zV * timeDelta;
  }

  draw(ctx, timestamp) {
    // first update all points
    // this.points.forEach((point) => point.update(timeDelta));
    // update this shape's base position
    this.update(timestamp);

    // mark the shape as visible is at least one point is visible
    this.config.visible = this.points.some((point) =>
      point.visible(point.translate(this.pos))
    );
    if (!this.config.visible) return;

    const pointsProjected = this.points.map((point) =>
      //point.project2d({ x: point.x, y: point.y, z: point.z})
      point.project2d(point.translate(this.pos))
    );

    ctx.fillStyle = this.style.color;
    ctx.strokeStyle = this.style.strokeStyle;
    const maxDepth = 12 * 200 * 1.2;
    const lineWidthMultiplier = (maxDepth - this.pos.z) / maxDepth;
    const modifiedLineWidth = Math.min(this.style.lineWidth, this.style.lineWidth*lineWidthMultiplier);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    if (this.highlight) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.style.strokeColor;
    }

    ctx.lineWidth = modifiedLineWidth;

    const radiusTop = Math.sqrt(pointsProjected[0].x * pointsProjected[0].x + pointsProjected[0].y * pointsProjected[0].y)
    const radiusBottom = Math.sqrt(pointsProjected[3].x * pointsProjected[3].x + pointsProjected[3].y * pointsProjected[3].y)

    ctx.beginPath();
    ctx.arc(0, 0, pointsProjected[0].polar.radius, 2*Math.PI - pointsProjected[0].polar.theta, 2*Math.PI - pointsProjected[1].polar.theta);
    //ctx.moveTo(pointsProjected[1].x, pointsProjected[1].y);
    //ctx.lineTo(pointsProjected[3].x, pointsProjected[3].y);
    ctx.arc(0, 0, pointsProjected[2].polar.radius, 2*Math.PI-pointsProjected[2].polar.theta, 2*Math.PI -pointsProjected[3].polar.theta, true);
    //ctx.lineTo(pointsProjected[0].x, pointsProjected[0].y);

    ctx.closePath();
    if (this.style.lineWidth > 0) {
      ctx.stroke();
    }
    ctx.fill();

    // if (this.config.triangle) {
    //   ctx.lineWidth = modifiedLineWidth * 0.5;
    //   let ulp = this.points[0];
    //   let lrp = this.points[2];
    //   ulp = ulp.project2d(ulp.translate(this.pos));
    //   lrp = lrp.project2d(lrp.translate(this.pos));
    //   ctx.beginPath();
    //   ctx.moveTo(ulp.x, ulp.y);
    //   ctx.lineTo(lrp.x, lrp.y);
    //   ctx.stroke();
    // }
  }
}


// width: dist(ulp, urp)
// height: dist(ulp, llp)
class Rectangle {
  constructor({w, h, d, theta},  pos, config, style) {
    this.style = style;
    this.theta = theta;
    this.h = h;
    this.ulp = new Point(0, h, 0);
    this.urp = new Point(w, h, 0);
    this.llp = new Point(0, h, d);
    this.lrp = new Point(w, h, d);
    this.points = [this.ulp, this.urp, this.lrp, this.llp];
    this.pos = pos;
    this.config = {
      type: 'RECTANGLE',
      visible: true,
      highlight: false,
      wiggle: false,
      simplex: undefined,
      omega: 0,
      radiusV: 0,
      zV: 0,
      // used to make wave animation
      ...config,
    };

    if (this.config.wiggle) {
      this.config.wiggleConfig = {
        offset: this.points.map((point) => {
          return { z: 0 };
        }),
        original: this.points.map((point) => {
          return { z: point.z };
        }),
      };
    }
  }

  depth() {
    return (this.points[0].translate(this.pos)).z
  }

  setConfig(config) {
    if (config.highlight && !this.config.highlight) {
      this.config.radiusV = 0.1;
    }
    this.config = { ...this.config, ...config };
  }

  update(timestamp) {
    let timeDelta = this.lastTimestamp ? timestamp - this.lastTimestamp : 0;
    this.lastTimestamp = timestamp;
    this.pos.theta += this.config.omega * timeDelta;
    this.pos.radius += this.config.radiusV * timeDelta;
    this.pos.z += this.config.zV * timeDelta;

    if (this.config.wiggle) {
      const frequencyTimestamp = 0.0003;
      const frequencyTheta = 0.5;
      const amplitude = 50;

      const pointThetaList = this.points.map(
        (point) => point.polar.theta + this.pos.theta
      );
      this.config.wiggleConfig.offset[0].z =
        this.config.simplex.noise2D(
          pointThetaList[0] * frequencyTheta,
          timestamp * frequencyTimestamp
        ) * amplitude;
      this.config.wiggleConfig.offset[1].z =
        this.config.simplex.noise2D(
          pointThetaList[1] * frequencyTheta,
          timestamp * frequencyTimestamp
        ) * amplitude;
      this.config.wiggleConfig.offset[2].z =
        this.config.simplex.noise2D(
          -pointThetaList[2] * frequencyTheta,
          timestamp * frequencyTimestamp
        ) * amplitude;
      this.config.wiggleConfig.offset[3].z =
        this.config.simplex.noise2D(
          -pointThetaList[3] * frequencyTheta,
          timestamp * frequencyTimestamp
        ) * amplitude;

      this.points.forEach((point, i) => {
        point.z =
          this.config.wiggleConfig.original[i].z +
          this.config.wiggleConfig.offset[i].z;
      });

      // this.points.forEach((point, idx) => {
      //   if (
      //     point.z > this.config.wiggleConfig[idx].max ||
      //     point.z < this.config.wiggleConfig[idx].min
      //     // randomly change zV direction in the middle
      //     //window.random.random_bool(0.01)
      //   ) {
      //     this.config.wiggleConfig[idx].zV = -this.config.wiggleConfig[idx].zV;
      //   }
      //   point.z += this.config.wiggleConfig[idx].zV * timeDelta;
      // });
    }
  }

  draw(ctx, timestamp) {
    // first update all points
    // this.points.forEach((point) => point.update(timeDelta));
    // update this shape's base position
    this.update(timestamp);

    // mark the shape as visible is at least one point is visible
    this.config.visible = this.points.some((point) =>
      point.visible(point.translate(this.pos))
    );
    if (!this.config.visible) return;

    const pointsProjected = this.points.map((point) =>
      point.project2d(point.translate(this.pos))
    );

    ctx.fillStyle = this.style.color;
    ctx.strokeStyle = this.style.strokeColor;
    const maxDepth = 12 * 200 * 1.2;
    const lineWidthMultiplier = (maxDepth - this.pos.z) / maxDepth;
    const modifiedLineWidth = Math.min(this.style.lineWidth, this.style.lineWidth*lineWidthMultiplier);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    if (this.highlight) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.style.strokeColor;
    }

    ctx.lineWidth = modifiedLineWidth;
    ctx.beginPath();
    if(this.config.type === 'RECTANGLE') {
      ctx.moveTo(pointsProjected[0].x, pointsProjected[0].y);
      for (let point of pointsProjected) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.lineTo(pointsProjected[0].x, pointsProjected[0].y);
    } else if (this.config.type === 'SECTOR') {
      ctx.arc(0, 0, pointsProjected[0].polar.radius, 2*Math.PI - pointsProjected[0].polar.theta, 2*Math.PI - pointsProjected[1].polar.theta);
      ctx.arc(0, 0, pointsProjected[2].polar.radius, 2*Math.PI-pointsProjected[2].polar.theta, 2*Math.PI -pointsProjected[3].polar.theta, true);
      ctx.closePath(); 
    }
    if (this.style.lineWidth > 0) {
      ctx.stroke();
    }
    ctx.fill();

    if (this.config.triangle && this.config.type === 'RECTANGLE') {
      ctx.lineWidth = modifiedLineWidth * 0.5;
      let ulp = this.points[0];
      let lrp = this.points[2];
      ulp = ulp.project2d(ulp.translate(this.pos));
      lrp = lrp.project2d(lrp.translate(this.pos));
      ctx.beginPath();
      ctx.moveTo(ulp.x, ulp.y);
      ctx.lineTo(lrp.x, lrp.y);
      ctx.stroke();
    }
  }
}

class Renderer {
  constructor(automata, context, random) {
    this.context = context;
    this.automata = automata;
    this.random = random;
    this.activeNoteIdx = null;

    // const palettesNames = [
    //   "retro",
    //   "retro-washedout",
    //   "roygbiv-warm",
    //   "roygbiv-toned",
    //   "present-correct",
    //   "tundra3",
    //   "kov_06",
    //   "kov_06b",
    //   "empusa",
    //   "delphi",
    //   "mably",
    //   "nowak",this.context
    //   "hersche",100
    //   "honey",
    //   "jungle",
    //   "giftcard",
    //   "giftcard_sub",
    //   "dale_paddle",
    //   "exposito",
    // ];
   // const palettesBlackList = ["kov_06b", "skyspider", "tsu_arcade", "sprague"];
   const palettesBlackList=[]
    const palettesNames = tome
      .getAll()
      .filter(
        (item) =>
          !!item.background &&
          item.size >= 5 &&
          !palettesBlackList.includes(item.name)
      )
      .map((item) => item.name);
    const idx = this.random.random_int(0, palettesNames.length - 1);
    this.palette = tome.get(palettesNames[idx]);
   
    this.paletteColors = this.palette.colors.filter(color => color != this.palette.background);
    this.strokeColor = this.palette.stroke;
    console.log(this.palette, this.palette.background);

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
      MAX_WIDTH: Math.floor(automataConfig.size / 10),
      MIN_HEIGHT: 10,
      MAX_HEIGHT: 100,
      MAX_GAP: Math.floor(automataConfig.size / 10),
      MAX_ROW: 12,
      LAYER_DEPTH: 200,
    };

    this.baseStyle = {
      lineWidth: window.random.random_choice([2, 5, 8]),
    };

    const styleOverride = [
      'BORDER_ONLY', 'BORDER_COLOR_ONLY', 'COLOR_ONLY', 'BORDER_AND_COLOR', 'MIXED'
    ]

   this.selectedStyle = this.random.random_choice_weighted(
      styleOverride,
      [0.2, 0.2, 0.2, 0.2, 0.2]
    );
    
    this.generatedSettings = {
      style: this.selectedStyle,
      palettes: this.palette.name
    }

    const ROW_STYLE = {
      rectangleRandomWidthAndHeight: {
        getSizes: (notes) => {
          const getConfig = () => {
            const CONFIG_LIST = [
              {
                MIN_SHAPE_WIDTH: 2,
                MAX_SHAPE_WIDTH: 2,
                MIN_SHAPE_DEPTH: 150,
                MAX_SHAPE_DEPTH: 150,
                wiggle: window.random.random_bool(0.2),
                type: window.random.random_bool(0.5) ? 'RECTANGLE' : 'SECTOR',
                color: idx => this.paletteColors[idx % this.paletteColors.length],
                strokeColor: idx => 'black',
                lineWidth: this.baseStyle.lineWidth,
              },
              {
                MIN_SHAPE_WIDTH: 100,
                MAX_SHAPE_WIDTH: 150,
                MIN_SHAPE_DEPTH: 150,
                MAX_SHAPE_DEPTH: 200,
                wiggle: window.random.random_bool(0.33),
                triangle: window.random.random_bool(0.33),
                color: idx => this.paletteColors[idx % this.paletteColors.length],
                strokeColor: idx => 'black',
                lineWidth: this.baseStyle.lineWidth,
                type: window.random.random_bool(0.5) ? 'RECTANGLE' : 'SECTOR'
              },
              {
                MIN_SHAPE_WIDTH: 200,
                MAX_SHAPE_WIDTH: 450,
                MIN_SHAPE_DEPTH: 150,
                MAX_SHAPE_DEPTH: 200,
                wiggle: window.random.random_bool(0.33),
                triangle: window.random.random_bool(0.33),
                color: idx => this.paletteColors[idx % this.paletteColors.length],
                strokeColor: idx => 'black',
                lineWidth: this.baseStyle.lineWidth,
                type: 'SECTOR'
              },
              {
                MIN_SHAPE_WIDTH: 50,
                MAX_SHAPE_WIDTH: 50,
                MIN_SHAPE_DEPTH: 15,
                MAX_SHAPE_DEPTH: 15,
                type: window.random.random_bool(0.5) ? 'RECTANGLE' : 'SECTOR',
                color: idx => this.paletteColors[idx % this.paletteColors.length],
                strokeColor: idx => 'black',
                lineWidth: this.baseStyle.lineWidth,
              },
            ];

            const CONFIG_LIST_PROB = [0.2, 0.4, 0.3, 0.1];
            //return CONFIG_LIST[1]
            return this.random.random_choice_weighted(
              CONFIG_LIST,
              CONFIG_LIST_PROB
            );
          };
          
          let selectedStyleOverride = this.selectedStyle;
          if (this.selectedStyle === 'MIXED') {
            selectedStyleOverride = this.random.random_choice_weighted(
              styleOverride,
              [0.2, 0.2, 0.2, 0.2, 0.2]
            );
          }

          let config = getConfig();
          if (selectedStyleOverride === 'BORDER_ONLY') {
            config = {
              ...config,
              strokeColor: idx => this.strokeColor,
              color: idx => 'transparent'
            }
          } else if (selectedStyleOverride === 'BORDER_COLOR_ONLY') {
            config = {
              ...config,
              strokeColor: idx => this.paletteColors[idx % this.paletteColors.length],
              color: idx => 'transparent'
            }
          } else if (selectedStyleOverride === 'COLOR_ONLY') {
            config = {
              ...config,
              lineWidth: 0,
              color: idx => this.paletteColors[idx % this.paletteColors.length],
              triangle: false
            }
          } else if (selectedStyleOverride === 'BORDER_AND_COLOR') {
            config = {
              ...config,
              strokeColor: idx => this.strokeColor
            }
          }
          console.log(config)

          const {
            MIN_SHAPE_WIDTH,
            MAX_SHAPE_WIDTH,
            MIN_SHAPE_DEPTH,
            MAX_SHAPE_DEPTH,
          } = config;

          const MIN_SHAPE_GAP = 10;
          const MAX_SHAPE_GAP = 50;
          const MIN_SHAPE_HEIGHT = 200;
          const MAX_SHAPE_HEIGHT = 200;

          let lastEndingX = 0;
          let sizes = [];
          for (let note of notes) {
            const gap = this.random.random_int(MIN_SHAPE_GAP, MAX_SHAPE_GAP);
            lastEndingX += gap;

            const shapeWidth = this.random.random_int(
              MIN_SHAPE_WIDTH,
              MAX_SHAPE_WIDTH
            );

            sizes.push({
              x: lastEndingX,
              w: shapeWidth,
              h: this.random.random_int(MIN_SHAPE_HEIGHT, MAX_SHAPE_HEIGHT),
              d: this.random.random_int(MIN_SHAPE_DEPTH, MAX_SHAPE_DEPTH),
            });
            lastEndingX += shapeWidth;
          }

          // last gap
          lastEndingX += this.random.random_int(
            MIN_SHAPE_GAP / 2,
            MAX_SHAPE_GAP / 2
          );

          // avoid shape being too wide when only have a few notes
          lastEndingX = Math.max(
            lastEndingX,
            8 * (MAX_SHAPE_WIDTH + MAX_SHAPE_GAP)
          );

          // normalize
          sizes = sizes.map((size) => {
            return {
              ...size,
              x: size.x / lastEndingX,
              w: size.w / lastEndingX,
            };
          });
          return { sizes, config };
        },
      },
      // circularSector: {
      //   getSizes: (notes) => {
      //     const getConfig = () => {
      //       const CONFIG_LIST = [
      //         {
      //           MIN_SHAPE_WIDTH: 100,
      //           MAX_SHAPE_WIDTH: 150,
      //           MIN_SHAPE_HEIGHT: 10,
      //           MAX_SHAPE_HEIGHT: 50,
      //           MIN_RADIUS_BOTTOM: 100,
      //           MAX_RADIUS_BOTTOM: 150,
      //           MIN_SHAPE_DEPTH: 0,
      //           MAX_SHAPE_DEPTH: 0,
      //           wiggle: window.random.random_bool(0.33),
      //           triangle: window.random.random_bool(0.33),
      //           color: window.random.random_bool(0.33)
      //             ? "transparent"
      //             : undefined,
      //           strokeColor: this.palette.stroke,
      //           lineWidth: this.baseStyle.lineWidth,
      //         },
      //       ];

      //       const CONFIG_LIST_PROB = [1.0];
      //       //return CONFIG_LIST[1]
      //       return this.random.random_choice_weighted(
      //         CONFIG_LIST,
      //         CONFIG_LIST_PROB
      //       );
      //     };

      //     const config = getConfig();
      //     const {
      //       MIN_SHAPE_WIDTH,
      //       MAX_SHAPE_WIDTH,
      //       MIN_SHAPE_HEIGHT,
      //       MAX_SHAPE_HEIGHT,
      //       MIN_SHAPE_DEPTH,
      //       MAX_SHAPE_DEPTH,
      //       MIN_RADIUS_BOTTOM,
      //       MAX_RADIUS_BOTTOM
      //     } = config;

      //     const MIN_SHAPE_GAP = 10;
      //     const MAX_SHAPE_GAP = 50;
          

      //     let lastEndingX = 0;
      //     let sizes = [];
      //     for (let note of notes) {
      //       const gap = this.random.random_int(MIN_SHAPE_GAP, MAX_SHAPE_GAP);
      //       lastEndingX += gap;

      //       const shapeWidth = this.random.random_int(
      //         MIN_SHAPE_WIDTH,
      //         MAX_SHAPE_WIDTH
      //       );

      //       sizes.push({
      //         x: lastEndingX,
      //         w: shapeWidth,
      //         h: this.random.random_int(MIN_SHAPE_HEIGHT, MAX_SHAPE_HEIGHT),
      //         d: this.random.random_int(MIN_SHAPE_DEPTH, MAX_SHAPE_DEPTH),
      //         radiusBottom: this.random.random_int(MIN_RADIUS_BOTTOM, MAX_RADIUS_BOTTOM)
      //       });
      //       lastEndingX += shapeWidth;
      //     }

      //     // last gap
      //     lastEndingX += this.random.random_int(
      //       MIN_SHAPE_GAP / 2,
      //       MAX_SHAPE_GAP / 2
      //     );

      //     // avoid shape being too wide when only have a few notes
      //     lastEndingX = Math.max(
      //       lastEndingX,
      //       8 * (MAX_SHAPE_WIDTH + MAX_SHAPE_GAP)
      //     );

      //     // normalize
      //     sizes = sizes.map((size) => {
      //       return {
      //         ...size,
      //         x: size.x / lastEndingX,
      //         w: size.w / lastEndingX,
      //       };
      //     });
      //     return { sizes, config };
      //   },
      // }
    };

    const generateRectangleShapesForRow = (r, row, rowStyleSetting) => {
      const boxRowList = [];

      // first calculate number of notes in a row
      const notes = row.filter((note) => !!note.begin);
      const { sizes, config } = rowStyleSetting.getSizes(notes);

      const omega = this.random.random_num(-0.0001, 0.0001);
      const rowSimplex = new SimplexNoise(window.tokenData.hash + String(r));

      sizes.forEach((size, idx) => {
        const zOffset = (this.boxConfig.LAYER_DEPTH - size.d) / 2;
        const thetaLeft = Math.PI * 2 * size.x;
        const thetaRight = Math.PI * 2 * (size.x + size.w);

        const radiusTop = size.h;
        const ulp = new Point(
          Math.cos(thetaLeft) * radiusTop,
          Math.sin(thetaLeft) * radiusTop,
          0
        );

        const urp = new Point(
          Math.cos(thetaRight) * radiusTop,
          Math.sin(thetaRight) * radiusTop,
          0
        );
        
        boxRowList.push({
          note: notes[idx],
          shape: new Rectangle(
            {
            w: ulp.distance(urp),
            h: size.h,
            d: size.d
            },
            {
              theta: thetaLeft,
              radius: size.h,
              z: r * this.boxConfig.LAYER_DEPTH * 1.2 + zOffset,
            },
            {
              idx,
              zV: 0,
              omega,
              wiggle: !!config.wiggle,
              simplex: rowSimplex,
              triangle: config.triangle,
              type: config.type
            },
            {
              color: config.color(notes[idx].val),
              strokeColor: config.strokeColor(notes[idx].val),
              lineWidth: config.lineWidth || 0,
            }
          ),
        });
      });
      return boxRowList;
    };

    const generateCircularSectorShapesForRow = (r, row, rowStyleSetting) => {
      const boxRowList = [];

      // first calculate number of notes in a row
      const notes = row.filter((note) => !!note.begin);
      const { sizes, config } = rowStyleSetting.getSizes(notes);

      const omega = 0 //this.random.random_num(-0.0001, 0.0001);
      const rowSimplex = new SimplexNoise(window.tokenData.hash + String(r));

      sizes.forEach((size, idx) => {
        const zOffset = (this.boxConfig.LAYER_DEPTH - size.d) / 2;
        const thetaLeft = Math.PI * 2 * size.x;
        const thetaRight = Math.PI * 2 * (size.x + size.w);

        boxRowList.push({
          note: notes[idx],
          shape: new CircularSector(
            thetaRight - thetaLeft,
            size.radiusBottom + size.h,
            size.radiusBottom,
            {
              theta: thetaLeft,
              radius: size.h,
              z: r * this.boxConfig.LAYER_DEPTH * 1.2 + zOffset,
            },
            {
              idx,
              zV: -0.05,
              omega,
              wiggle: !!config.wiggle,
              simplex: rowSimplex,
              triangle: config.triangle,
            },
            {
              color: config.color(notes[idx].val),
              strokeColor: config.strokeColor(notes[idx].val),
              lineWidth: config.lineWidth || 0,
            }
          ),
        });
      });

      return boxRowList;
    };

    const generateShapesForRow = (r, row) => {
      const [rowStyleName, rowStyleSetting] = random.random_choice(
        Object.entries(ROW_STYLE)
      );
      if (
        ["rectangleRandomWidthAndHeight", "rectangleFixedWidth"].includes(
          rowStyleName
        )
      ) {
        return generateRectangleShapesForRow(r, row, rowStyleSetting);
      } else if (['circularSector'].includes(rowStyleName)) {
        return generateCircularSectorShapesForRow(r, row, rowStyleSetting);
      }
    };

    this.boxList = [];
    for (const [r, gridRow] of this.automata.grid.entries()) {
      this.boxList.push(generateShapesForRow(r, gridRow));
    }

    this.currRow = 0;
    console.log(this.boxList);
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
  render(width, height, timestamp = 0.0) {
    //PERSPECTIVE = width * 0.3;
    PERSPECTIVE = 1920 * 0.3;
    const { CELL_SIZE_HEIGHT, M, DIM, scale, BASE_RADIUS } = this.getScaleParam(
      width,
      height
    );
    const ratio = window.devicePixelRatio;

    // refer to
    // https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.context.clearRect(0, 0, width, height);

    // set background
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, width, height);

    this.context.translate(width / 2, height / 2);
    
    let shapes = []
    for (const [r, rowData] of this.boxList
      .slice(this.currRow, this.currRow + this.boxConfig.MAX_ROW)
      .entries()) {
      for (const [c, box] of rowData.entries()) {
        box.shape.setConfig({ highlight: this.activeNoteIdx === box.note.idx,
          // 48 seconds song
          // 12 timestamps => 4 seconds per layer
          // layer depth = 200 * 1.2 = 240
          // 240 z units / 4 s = 60 z units / s = 0.06 z units / ms
          // approximate 60 z units per seconds
          zV: this.activeNoteIdx >= 16 ? -0.04 : 0
        });
        shapes.push(box.shape)
      }
    }

    shapes = shapes.sort((a, b) => a.depth() > b.depth());
    for(const shape of shapes) {
      shape.draw(this.context, timestamp);
    }
  }

  

  setActiveNode(idx) {
    this.activeNoteIdx = idx;
  }
}

export default Renderer;