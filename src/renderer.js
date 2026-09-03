// SuperTris Canvas 畫面渲染器 (LV3隱藏Ghost、1985金幣拋跳、道具冒出動畫)
class Renderer {
  constructor(canvas, nextCanvas, cellSize = 34) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext('2d');
    this.cellSize = cellSize;
    this.colors = {
      I: '#00ffff', J: '#2980b9', L: '#e67e22',
      O: '#f1c40f', S: '#2ecc71', T: '#9b59b6', Z: '#e74c3c',
      Q: '#d4ac0d', BOMB: '#e74c3c', STAR: '#f1c40f'
    };
    this.animations = []; // 浮動金幣與冒出道具特效池
  }

  addCoinAnimation(gridX, gridY) {
    const px = gridX * this.cellSize + this.cellSize / 2;
    const py = gridY * this.cellSize;
    this.animations.push({
      type: 'coin',
      x: px,
      startY: py,
      currentY: py,
      vy: -7, // 向上彈起初速
      gravity: 0.35,
      rotation: 0,
      alpha: 1.0,
      life: 0
    });
  }

  addItemRiseAnimation(gridX, gridY, itemType) {
    const px = gridX * this.cellSize;
    const py = gridY * this.cellSize;
    this.animations.push({
      type: 'item_rise',
      itemType: itemType,
      x: px,
      targetY: py - this.cellSize,
      currentY: py,
      alpha: 1.0,
      life: 0,
      duration: 30 // 約 0.5 秒冒出
    });
  }

  render(board, p1Piece, p2Piece, nextPiece, mode = 'single', level = 1) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBoard(board);

    // 規則：等級 < 3 (消 < 40 行) 顯示 Ghost 投影；等級 >= 3 自動隱藏
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
        const progress = Math.min(1, anim.life / anim.duration);
        anim.currentY = anim.currentY + (anim.targetY - anim.currentY) * 0.12;

        this.ctx.save();
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(anim.x, anim.currentY, this.cellSize, this.cellSize);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(anim.x, anim.currentY, this.cellSize, this.cellSize);

        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        let icon = '🍄';
        if (anim.itemType === 'fire_flower') icon = '🌸';
        if (anim.itemType === 'super_star') icon = '⭐';
        if (anim.itemType === 'green_mushroom') icon = '🍄';
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
          this.drawCell(c * this.cellSize, r * this.cellSize, this.cellSize, cell.type, false, cell.isQuestion, cell.isBomb, isStar);
        }
      }
    }
  }

  drawGhost(board, piece) {
    if (!piece || piece.type === 'Q') return;
    let ghostY = piece.y;
    while (!board.isCollision(piece.getBlocks(piece.x, ghostY + 1))) {
      ghostY++;
    }
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks(piece.x, ghostY);
    blocks.forEach(b => {
      this.drawCell(b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, true, b.isQuestion, hasBomb, isStar);
    });
  }

  drawPiece(piece) {
    if (!piece) return;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    const blocks = piece.getBlocks();
    blocks.forEach(b => {
      this.drawCell(b.x * this.cellSize, b.y * this.cellSize, this.cellSize, piece.type, false, b.isQuestion, hasBomb, isStar);
    });
  }

  drawCell(x, y, size, type, isGhost = false, isQuestion = false, isBomb = false, isStar = false) {
    const ctx = this.ctx;
    ctx.save();
    if (isGhost) ctx.globalAlpha = 0.28;

    let baseColor = this.colors[type] || '#3498db';
    if (isStar) baseColor = '#f39c12';
    if (isBomb) baseColor = '#e74c3c';

    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    if (!isGhost) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x + 2, y + 2, size - 4, 3);
      ctx.fillRect(x + 2, y + 2, 3, size - 4);
    }

    if (isStar) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', x + size / 2, y + size / 2);
    } else if (isBomb) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', x + size / 2, y + size / 2);
    } else if (isQuestion) {
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + size / 2, y + size / 2);
    }
    ctx.restore();
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
          ctx.fillStyle = this.colors[piece.type] || '#fff';
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
