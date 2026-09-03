// SuperTris 棋盤管理模組 (Matrix、消行、十字爆破、⭐星星重力落砂、全清檢測)
class Board {
  constructor(cols = 10, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.grid = this.createGrid();
  }

  createGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  reset() {
    this.grid = this.createGrid();
  }

  isBoardEmpty() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== null) return false;
      }
    }
    return true;
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

  // ⭐ 無敵星星解體演算法：將 piece 拆為 4 個獨立 1x1 方塊各自垂直落底
  shatterAndDropBlocks(piece) {
    const blocks = piece.getBlocks();
    blocks.sort((a, b) => b.y - a.y);

    blocks.forEach(b => {
      if (b.x < 0 || b.x >= this.cols) return;
      let targetY = Math.max(0, b.y);

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
    const destroyedQuestions = [];
    offsets.forEach(([dx, dy]) => {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        const cell = this.grid[y][x];
        if (cell && cell.isQuestion) {
          destroyedQuestions.push({ x, y });
        }
        this.grid[y][x] = null;
      }
    });
    return destroyedQuestions;
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
    const qPositions = [];
    lines.forEach(r => {
      this.grid[r].forEach((cell, c) => {
        if (cell && cell.isQuestion) {
          questionCount++;
          qPositions.push({ x: c, y: r });
        }
      });
      this.grid.splice(r, 1);
      this.grid.unshift(Array(this.cols).fill(null));
    });
    return { questionCount, qPositions };
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
