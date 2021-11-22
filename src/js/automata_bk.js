class Automata {
  constructor(cellsLength, linesLength, ruleNumber, r) {
    this.r = r;
    this.world = [];
    this.ruleNumber = ruleNumber;
    this.interceptors = {};
    this.pointer = {
      line: 0,
      cell: 0,
    };

    this.boundaries = {
      cellsLength,
      linesLength,
    };
  }

  start(seed = this.randomSeed()) {
    this.world.push(seed);
  }

  randomSeed() {
    const arr = new Uint8Array(this.boundaries.cellsLength);
    arr[arr.length / 2] = 1;
    return arr;
    // return new Uint8Array(this.boundaries.cellsLength).map((cell) => (Math.random() >= 0.5 ? 1 : 0));
  }

  rule(window) {
    const idx = parseInt(window.join(''), 2);
    // eslint-disable-next-line no-bitwise
    return (this.ruleNumber & (1 << idx)) >> idx;
  }

  generateLine() {
    const linePointer = this.pointer.line;
    const nextLine = [];
    for (let i = 0; i < this.boundaries.cellsLength; i += 1) {
      const window = [];
      for (let j = i - this.r; j <= i + this.r; j += 1) {
        if (j >= 0 && j < this.boundaries.cellsLength) {
          window.push(this.world[linePointer][j]);
        } else {
          window.push(0);
        }
      }
      nextLine.push(this.rule(window));
    }
    this.world.push(nextLine);
    console.log(nextLine);
    // execute on the last two lines
    this.executeInterceptors('line', this.world.slice(-2), this.pointer.line);
    // update line pointerappend
    this.pointer.line += 1;
  }

  registryInterceptor(event, fn) {
    if (!this.interceptors[event]) {
      this.interceptors[event] = [];
    }

    this.interceptors[event].push(fn);
  }

  executeInterceptors(event, value, offset) {
    this.interceptors[event].forEach((fn) => fn(value, offset));
  }
}

export default Automata;
