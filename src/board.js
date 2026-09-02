// SuperTris 棋盤管理、色階切換、垂直重力塌陷與消行動畫 (Board Module)

const THEME_PHASES = {
  SAFE: {
    main: '#8B3A1A',
    highlight: '#C46B3A',
    dark: '#3D1A0A',
    question: '#E8A020',
    special: '#4A7A3A'
  },
  WARNING: {
    main: '#7A4A2A',
    highlight: '#A06840',
    dark: '#2A1000',
    question: '#E07020',
    special: '#5C8A3A'
  },
  CRITICAL: {
    main: '#2A6A9A',
    highlight: '#4A9AD0',
    dark: '#0D2A40',
    question: '#40C0E0',
    special: '#3A9A6A'
  }
};

class Board {
  constructor(cols = 10, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  reset() {
    this.grid = this.createEmptyGrid();
  }

  getStackHeight() {
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].some(cell => cell !== null)) {
        return this.rows - r;
      }
    }
    return 0;
  }

  getCurrentTheme() {
    const height = this.getStackHeight();
    const ratio = height / this.rows;

    if (ratio >= 0.8 || (this.rows - height) <= 4) {
      return THEME_PHASES.CRITICAL;
    } else if (ratio >= 0.5) {
      return THEME_PHASES.WARNING;
    }
    return THEME_PHASES.SAFE;
  }

  isCollision(blocks) {
    for (const b of blocks) {
      if (b.x < 0 || b.x >= this.cols || b.y >= this.rows) return true;
      if (b.y >= 0 && this.grid[b.y][b.x] !== null) return true;
    }
    return false;
  }

  lockPiece(piece) {
    const blocks = piece.getBlocks();
    blocks.forEach(b => {
      if (b.y >= 0 && b.y < this.rows && b.x >= 0 && b.x < this.cols) {
        this.grid[b.y][b.x] = {
          type: piece.type,
          isQuestion: b.isQuestion,
          playerIndex: b.playerIndex
        };
      }
    });
  }

  findFullLines() {
    const full = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        full.push(r);
      }
    }
    return full;
  }

  removeLines(lines) {
    let questionBlockCount = 0;
    lines.forEach(lineIdx => {
      this.grid[lineIdx].forEach(cell => {
        if (cell && cell.isQuestion) {
          questionBlockCount++;
        }
      });
      this.grid.splice(lineIdx, 1);
      this.grid.unshift(Array(this.cols).fill(null));
    });
    return questionBlockCount;
  }

  clearHalfBoard() {
    const startRow = Math.floor(this.rows / 2);
    for (let r = startRow; r < this.rows; r++) {
      this.grid[r] = Array(this.cols).fill(null);
    }
  }

  // 火焰花引爆 3x3 區域，並觸發垂直重力塌陷
  explodeAround(cx, cy) {
    let destroyed = 0;
    for (let r = cy - 1; r <= cy + 1; r++) {
      for (let c = cx - 1; c <= cx + 1; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          if (this.grid[r][c] !== null) {
            this.grid[r][c] = null;
            destroyed++;
          }
        }
      }
    }
    // 引爆後執行重力塌陷
    this.applyGravity();
    return destroyed;
  }

  // 垂直重力塌陷演算法：讓懸空的磚塊垂直掉落填補下方空洞
  applyGravity() {
    for (let c = 0; c < this.cols; c++) {
      // 收集該列中所有存在的磚塊
      const colBlocks = [];
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[r][c] !== null) {
          colBlocks.push(this.grid[r][c]);
        }
      }

      // 由底向上重新填入
      for (let r = this.rows - 1; r >= 0; r--) {
        if (colBlocks.length > 0) {
          this.grid[r][c] = colBlocks.pop();
        } else {
          this.grid[r][c] = null;
        }
      }
    }
  }

  // 無敵星星垂直貫穿消除整列到底，並執行重力塌陷
  laserClearDown(blocks) {
    let count = 0;
    blocks.forEach(b => {
      for (let r = Math.max(0, b.y); r < this.rows; r++) {
        if (this.grid[r][b.x] !== null) {
          this.grid[r][b.x] = null;
          count++;
        }
      }
    });
    this.applyGravity();
    return count;
  }
}

window.Board = Board;
window.THEME_PHASES = THEME_PHASES;
