// SuperTris Canvas 畫面渲染器 (1985瑪利歐像素交錯磚紋、四角鉚釘問號方塊、城堡石磚)
class Renderer {
  constructor(canvas, nextCanvas, cellSize = 34) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext('2d');
    this.cellSize = cellSize;
    this.colors = {
      I: { main: '#00ffff', light: '#a6ffff', dark: '#008b8b' },
      J: { main: '#2980b9', light: '#5dade2', dark: '#1b4f72' },
      L: { main: '#e67e22', light: '#f5b041', dark: '#935116' },
      O: { main: '#f1c40f', light: '#f9e79f', dark: '#9a7d0a' },
      S: { main: '#2ecc71', light: '#82e0aa', dark: '#196f3d' },
      T: { main: '#9b59b6', light: '#d2b4de', dark: '#5b2c6f' },
      Z: { main: '#e74c3c', light: '#f1948a', dark: '#922b21' },
      BRICK: { main: '#c84c0c', light: '#fc9838', dark: '#682000' }
    };
    this.animations = [];
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
    this.drawBoard(board);
    if (p1Piece && level < 3) this.drawGhost(board, p1Piece);
    if (p1Piece) this.drawPiece(p1Piece);
    if (this.nextCtx && nextPiece) this.drawNextPiece(nextPiece);
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

  drawBoard(board) {
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.grid[r][c];
        if (cell) {
          this.drawCell(this.ctx, c * this.cellSize, r * this.cellSize, this.cellSize, cell.type, false, cell.isQuestion, cell.isBomb, isStar);
        }
      }
    }
  }

  drawGhost(board, piece) {
    if (!piece || piece.type === 'Q') return;
    let ghostY = piece.y;
    while (!board.isCollision(piece.getBlocks(piece.x, ghostY + 1))) ghostY++;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks(piece.x, ghostY);
    blocks.forEach(b => {
      this.drawCell(this.ctx, b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, true, b.isQuestion, hasBomb, isStar);
    });
  }

  drawPiece(piece) {
    if (!piece) return;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks();
    blocks.forEach(b => {
      this.drawCell(this.ctx, b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, false, b.isQuestion, hasBomb, isStar);
    });
  }

  drawCell(ctx, x, y, size, type, isGhost = false, isQuestion = false, isBomb = false, isStar = false) {
    ctx.save();
    if (isGhost) ctx.globalAlpha = 0.28;

    if (isStar) {
      this.drawStarBlock(ctx, x, y, size);
    } else if (isBomb) {
      this.drawCastleBlock(ctx, x, y, size);
    } else if (isQuestion) {
      this.drawQuestionBlock(ctx, x, y, size, isGhost);
    } else {
      this.drawMarioBrick(ctx, x, y, size, type, isGhost);
    }
    ctx.restore();
  }

  // 1. 經典 1985 瑪利歐交錯像素磚紋 (4-segment Brick)
  drawMarioBrick(ctx, x, y, size, type, isGhost) {
    const theme = this.colors[type] || this.colors.BRICK;
    ctx.fillStyle = theme.main;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    if (isGhost) return;

    // 頂部高光
    ctx.fillStyle = theme.light;
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
    ctx.fillRect(x + 2, y + 2, 2, size - 4);

    // 底部與右側暗部
    ctx.fillStyle = theme.dark;
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
    ctx.fillRect(x + size - 4, y + 2, 2, size - 4);

    // 經典交錯橫豎磚縫 (Mortar Lines)
    const midY = Math.floor(y + size / 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2, midY - 1, size - 4, 2); // 中間橫縫

    // 上排中豎縫
    const midX = Math.floor(x + size / 2);
    ctx.fillRect(midX - 1, y + 2, 2, midY - y - 3);

    // 下排兩側 1/4 與 3/4 錯位豎縫
    const q1X = Math.floor(x + size * 0.28);
    const q3X = Math.floor(x + size * 0.72);
    ctx.fillRect(q1X - 1, midY + 1, 2, y + size - midY - 4);
    ctx.fillRect(q3X - 1, midY + 1, 2, y + size - midY - 4);
  }

  // 2. 經典 1985 暖金問號方塊 (4 Corner Rivets + ?)
  drawQuestionBlock(ctx, x, y, size, isGhost) {
    ctx.fillStyle = '#fc9838'; // 1985 原版暖金色
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    if (isGhost) return;

    // 雙層邊框與暗橘陰影
    ctx.fillStyle = '#b84418';
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
    ctx.fillRect(x + size - 4, y + 2, 2, size - 4);

    // 4 個角落 2x2 像素深色小鉚釘 (Corner Rivets)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + size - 5, y + 3, 2, 2);
    ctx.fillRect(x + 3, y + size - 5, 2, 2);
    ctx.fillRect(x + size - 5, y + size - 5, 2, 2);

    // 中央粗體 8-Bit 白色像素問號
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + size / 2 + 1, y + size / 2 + 1); // 陰影
    ctx.fillStyle = '#ffffff';
    ctx.fillText('?', x + size / 2, y + size / 2);
  }

  // 3. 經典 1985 城堡石磚 / 炸彈方塊 (Castle Stone 💥)
  drawCastleBlock(ctx, x, y, size) {
    ctx.fillStyle = '#707070';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
    ctx.fillStyle = '#303030';
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', x + size / 2, y + size / 2);
  }

  // 4. ⭐ 無敵星星彩虹流光磚塊
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

  drawNextPiece(piece) {
    if (!this.nextCtx) return;
    const ctx = this.nextCtx;
    ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    const size = 5.5;
    const shape = piece.shape;
    const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
    const offsetY = (this.nextCanvas.height - shape.length * size) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const theme = this.colors[piece.type] || this.colors.BRICK;
          ctx.fillStyle = theme.main;
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
