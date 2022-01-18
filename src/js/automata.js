class Automata {
  constructor(size = 50, timestamps=50, k = 3, r = 1, random) {
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
      timestamps,
      k,
      r,
      ruleString,
      random,
      chunkSize: 8
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
        .map(() => {
          return {
            val: this.config.random.random_int(0, this.config.k - 1),
            len: 1,
            begin: false
          };
        }),
    ];

    for (let t = 0; t < this.config.timestamps; t += 1) {
      const nextRow = [];
      for (let i = 0; i < this.config.size; i += 1) {
        const neighbourhood = [];
        for (let j = i - this.config.r; j <= i + this.config.r; j += 1) {
          neighbourhood.push(
            j >= 0 && j < this.config.size
              ? this.grid[this.grid.length - 1][j].val
              : 0
          );
        }
        nextRow.push({
          val: Automata.totalisticRule(
            neighbourhood,
            this.config.k,
            this.config.ruleString
          ),
          len: 1,
          begin: false,
        });
      }
      this.grid.push(nextRow);
    }

    const generateSegments = (row, start, end, isLastRow) => {
      let consecutiveVal = 0;
      for (let i = end; i >= start; i--) {
        if (i + 1 <= end && row[i].val !== row[i + 1].val) {
          row[i + 1].begin = true;
          consecutiveVal = 1;
        } else {
          consecutiveVal += 1;
        }
        row[i].len = consecutiveVal;
      }
      row[start].begin = true;
    }

    for (let t = 0; t < this.config.timestamps; t += 1) {
      for(let i = 0; i < this.config.size; i += this.config.chunkSize) {
        generateSegments(this.grid[t], i, Math.min(i+this.config.chunkSize, this.config.size-1))
      }
    }
    console.log(this.grid)
    //this.grid = this.grid.slice(1);
  }

  getCell(idx) {
    if (idx < 0 || idx >= this.config.size * this.config.timestamps) return null;
    return this.grid[Math.floor(idx / this.config.size)][
      idx % this.config.size
    ];
  }
}

export default Automata;
