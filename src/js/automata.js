class Automata {
  constructor(size = 50, k = 3, r = 1, random) {
    const ruleString = [];
    for (let i = 0; i < (r + 2) * (k - 1) + 1; i += 1) {
      // 20% prob empty
      if (random.random_num(0, 1) < 0.35) {
        ruleString.push(0);
      } else {
        ruleString.push(random.random_int(1, k - 1));
      }
    }
    this.config = {
      size,
      timestamps: size,
      k,
      r,
      ruleString,
      random,
    };
  }

  static totalisticRule(neighbourhood, k, ruleString) {
    const n = neighbourhood.length;
    const ruleStringLength = n * (k - 1) + 1;
    const sum = neighbourhood.reduce((partialSum, a) => partialSum + a, 0);
    return Number(ruleString[ruleStringLength - 1 - sum]);
  }

  generate() {
    this.grid = [
      Array(this.config.size)
        .fill(0)
        .map(() => this.config.random.random_int(0, this.config.k - 1)),
    ];
    for (let t = 0; t < this.config.timestamps; t += 1) {
      const nextRow = [];
      for (let i = 0; i < this.config.size; i += 1) {
        const neighbourhood = [];
        for (let j = i - this.config.r; j <= i + this.config.r; j += 1) {
          neighbourhood.push(
            j >= 0 && j < this.config.size
              ? this.grid[this.grid.length - 1][j]
              : 0,
          );
        }
        nextRow.push(
          Automata.totalisticRule(neighbourhood, this.config.k, this.config.ruleString),
        );
      }
      this.grid.push(nextRow);
    }
    // this.grid = this.grid.slice(1);
  }

  getCell(idx) {
    if (idx < 0 || idx >= this.config.size * this.config.size) return null;
    return this.grid[Math.floor(idx / this.config.size)][idx % this.config.size];
  }
}

export default Automata;
