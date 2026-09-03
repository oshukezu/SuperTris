// SuperTris 棋盤管理模組 (Matrix、消行、十字爆破、重力塌陷、星星解體重力落砂)
class Board {
  constructor(cols = 10, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.grid = this.createGrid();
    this.themes = {
      underground: { main: '#34495e', dark: '#1a252f', highlight: '#7f8c8d', question: '#f1c40f' },
      castle: { main: '#c0392b', dark: '#78281f', highlight: '#e74c3c', question: '#f39c12' },
      classic: { main: '#c84c0c', dark: '#3d1a0a', highlight: '#fc9838', question: '#fce4a6' }
    };
  }

  createGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  reset() {
    this.grid = this.createGrid();
  }

  getCurrentTheme() {
    return this.themes.classic;
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
          isQuestion: b.isQuestion || false,
          isBomb: piece.isBomb || false,
          playerIndex: piece.playerIndex || 1
        };
      }
    });
  }

  // ⭐ 無敵星星：將方塊解體為 4 個獨立 1x1 方塊，各自垂直向下掉落填補底層凹洞
  shatterAndDropBlocks(piece) {
    const blocks = piece.getBlocks();
    // 由下至上排序處理 (y 大的先落底)
    blocks.sort((a, b) => b.y - a.y);

    blocks.forEach(b => {
      if (b.x < 0 || b.x >= this.cols) return;
      let targetY = Math.max(0, b.y);

      // 沿著自身欄位獨立向下垂直尋找最深可落位坐標
      while (targetY + 1 < this.rows && this.grid[targetY + 1][b.x] === null) {
        targetY++;
      }

      if (targetY >= 0 && targetY < this.rows) {
        this.grid[targetY][b.x] = {
          type: piece.type,
          isQuestion: b.isQuestion || false,
          isBomb: false,
          playerIndex: piece.playerIndex || 1
        };
      }
    });
  }

  explodeCross(cx, cy) {
    const offsets = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]];
    offsets.forEach(([dx, dy]) => {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        this.grid[y][x] = null;
      }
    });
  }

  clearHalfBoard() {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < this.cols; c++) this.grid[r][c] = null;
    }
    for (let r = 10; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (Math.random() < 0.5) this.grid[r][c] = null;
      }
    }
  }

  findFullLines() {
    const full = [];
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(cell => cell !== null)) full.push(r);
    }
    return full;
  }

  removeLines(lines) {
    let questionCount = 0;
    lines.forEach(r => {
      this.grid[r].forEach(cell => {
        if (cell && cell.isQuestion) questionCount++;
      });
      this.grid.splice(r, 1);
      this.grid.unshift(Array(this.cols).fill(null));
    });
    return questionCount;
  }

  applyGravity() {
    let moved = false;
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (writeRow !== r) {
            this.grid[writeRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            moved = true;
          }
          writeRow--;
        }
      }
    }
    return moved;
  }
}

window.Board = Board;
