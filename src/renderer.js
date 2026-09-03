// SuperTris Canvas 畫面渲染器 (3階堆疊高度原創安全磚色、LV3隱藏Ghost、1985動畫)
class Renderer {
  constructor(canvas, nextCanvas, cellSize = 34) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext('2d');
    this.cellSize = cellSize;
    // 3 階原創非侵權安全調色盤
    this.palettes = {
      low: { main: '#d35400', light: '#e67e22', dark: '#935116' },    // 暖磚紅系 (< 8 行)
      mid: { main: '#b9770e', light: '#d4ac0d', dark: '#7d5a0a' },    // 暖棕土系 (8-14 行)
      high: { main: '#2980b9', light: '#5dade2', dark: '#1b4f72' }   // 冷鋼藍系 (≥ 15 行)
    };
    this.animations = [];
  }

  getStackHeight(board) {
    if (!board || !board.grid) return 0;
    for (let r = 0; r < board.rows; r++) {
      if (board.grid[r].some(cell => cell !== null)) {
        return board.rows - r;
      }
    }
    return 0;
  }

  getActivePalette(board) {
    const height = this.getStackHeight(board);
    if (height >= 15) return this.palettes.high;
    if (height >= 8) return this.palettes.mid;
    return this.palettes.low;
  }

  addCoinAnimation(gridX, gridY) {
    const px = gridX * this.cellSize + this.cellSize / 2;
    const py = gridY * this.cellSize;
    this.animations.push({
      type: 'coin', x: px, startY: py, currentY: py,
      vy: -7, gravity: 0.35, rotation: 0, alpha: 1.0, life: 0
    });
  }

  addItemRiseAnimation(gridX, gridY, itemType) {
    const px = gridX * this.cellSize;
    const py = gridY * this.cellSize;
    this.animations.push({
      type: 'item_rise', itemType: itemType, x: px,
      targetY: py - this.cellSize, currentY: py, alpha: 1.0, life: 0, duration: 30
    });
  }

  render(board, p1Piece, p2Piece, nextPiece, mode = 'single', level = 1) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const activePalette = this.getActivePalette(board);
    this.drawBoard(board, activePalette);

    if (p1Piece && level < 3) this.drawGhost(board, p1Piece, activePalette);
    if (p1Piece) this.drawPiece(p1Piece, activePalette);
    if (this.nextCtx && nextPiece) this.drawNextPiece(nextPiece, activePalette);

    this.renderAnimations();
  }

  renderAnimations() {
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      anim.life++;
      if (anim.type === 'coin') {
        anim.currentY += anim.vy;
        anim.vy += anim.gravity;
        anim.rotation += 0.25;
        if (anim.life > 15) anim.alpha = Math.max(0, anim.alpha - 0.08);

        this.ctx.save();
        this.ctx.globalAlpha = anim.alpha;
        this.ctx.translate(anim.x, anim.currentY);
        this.ctx.scale(Math.cos(anim.rotation), 1);
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
        if (anim.alpha <= 0) this.animations.splice(i, 1);
      } else if (anim.type === 'item_rise') {
        anim.currentY = anim.currentY + (anim.targetY - anim.currentY) * 0.12;
        this.ctx.save();
        this.drawQuestionBlock(this.ctx, anim.x, anim.currentY, this.cellSize, false);
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        let icon = '🍄';
        if (anim.itemType === 'fire_flower') icon = '🌸';
        if (anim.itemType === 'super_star') icon = '⭐';
        this.ctx.fillText(icon, anim.x + this.cellSize / 2, anim.currentY + this.cellSize / 2);
        this.ctx.restore();
        if (anim.life >= anim.duration) this.animations.splice(i, 1);
      }
    }
  }

  drawBoard(board, palette) {
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.grid[r][c];
        if (cell) {
          this.drawCell(this.ctx, c * this.cellSize, r * this.cellSize, this.cellSize, cell.type, false, cell.isQuestion, cell.isBomb, isStar, palette);
        }
      }
    }
  }

  drawGhost(board, piece, palette) {
    if (!piece || piece.type === 'Q') return;
    let ghostY = piece.y;
    while (!board.isCollision(piece.getBlocks(piece.x, ghostY + 1))) ghostY++;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks(piece.x, ghostY);
    blocks.forEach(b => {
      this.drawCell(this.ctx, b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, true, b.isQuestion, hasBomb, isStar, palette);
    });
  }

  drawPiece(piece, palette) {
    if (!piece) return;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks();
    blocks.forEach(b => {
      this.drawCell(this.ctx, b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, false, b.isQuestion, hasBomb, isStar, palette);
    });
  }

  drawCell(ctx, x, y, size, type, isGhost = false, isQuestion = false, isBomb = false, isStar = false, palette) {
    ctx.save();
    if (isGhost) ctx.globalAlpha = 0.28;

    if (isStar) {
      this.drawStarBlock(ctx, x, y, size);
    } else if (isBomb) {
      this.drawCastleBlock(ctx, x, y, size);
    } else if (isQuestion) {
      this.drawQuestionBlock(ctx, x, y, size, isGhost);
    } else {
      this.drawBrick(ctx, x, y, size, palette, isGhost);
    }
    ctx.restore();
  }

  // 1. 原創 3 階交錯像素磚紋 (依高度自動切換暖磚紅 / 暖棕土 / 冷鋼藍)
  drawBrick(ctx, x, y, size, palette, isGhost) {
    const p = palette || this.palettes.low;
    ctx.fillStyle = p.main;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    if (isGhost) return;

    // 頂部左側高光
    ctx.fillStyle = p.light;
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
    ctx.fillRect(x + 2, y + 2, 2, size - 4);

    // 底部右側陰影
    ctx.fillStyle = p.dark;
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
    ctx.fillRect(x + size - 4, y + 2, 2, size - 4);

    // 4 段交錯磚縫刻痕
    const midY = Math.floor(y + size / 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2, midY - 1, size - 4, 2); // 橫縫

    const midX = Math.floor(x + size / 2);
    ctx.fillRect(midX - 1, y + 2, 2, midY - y - 3); // 上中豎縫

    const q1X = Math.floor(x + size * 0.28);
    const q3X = Math.floor(x + size * 0.72);
    ctx.fillRect(q1X - 1, midY + 1, 2, y + size - midY - 4); // 下左豎縫
    ctx.fillRect(q3X - 1, midY + 1, 2, y + size - midY - 4); // 下右豎縫
  }

  // 2. 原創暖金問號方塊
  drawQuestionBlock(ctx, x, y, size, isGhost) {
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    if (isGhost) return;

    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
    ctx.fillRect(x + size - 4, y + 2, 2, size - 4);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + size - 5, y + 3, 2, 2);
    ctx.fillRect(x + 3, y + size - 5, 2, 2);
    ctx.fillRect(x + size - 5, y + size - 5, 2, 2);

    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + size / 2 + 1, y + size / 2 + 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('?', x + size / 2, y + size / 2);
  }

  // 3. 城堡暗曜石石磚
  drawCastleBlock(ctx, x, y, size) {
    ctx.fillStyle = '#34495e';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    ctx.fillStyle = '#5dade2';
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
    ctx.fillStyle = '#1b4f72';
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', x + size / 2, y + size / 2);
  }

  // 4. ⭐ 星星方塊
  drawStarBlock(ctx, x, y, size) {
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', x + size / 2, y + size / 2);
  }

  drawNextPiece(piece, palette) {
    if (!this.nextCtx) return;
    const ctx = this.nextCtx;
    ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    const size = 5.5;
    const shape = piece.shape;
    const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
    const offsetY = (this.nextCanvas.height - shape.length * size) / 2;
    const p = palette || this.palettes.low;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          ctx.fillStyle = p.main;
          ctx.fillRect(offsetX + c * size, offsetY + r * size, size, size);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.strokeRect(offsetX + c * size, offsetY + r * size, size, size);
        }
      }
    }
  }
}

window.Renderer = Renderer;
