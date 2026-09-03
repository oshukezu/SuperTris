// SuperTris 畫面渲染模組 (Renderer Module) - 適配 34px 大單格與 💥 炸彈方塊
class Renderer {
  constructor(canvas, nextCanvas, cellSize = 34) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
    this.cellSize = cellSize;
    this.cols = 10;
    this.rows = 20;
  }

  drawBrick(ctx, x, y, theme, isQuestion = false, playerIndex = 1, isBomb = false) {
    const size = this.cellSize;
    const mainColor = (isBomb || isQuestion) ? theme.question : (playerIndex === 2 ? '#3498db' : theme.main);
    const darkColor = theme.dark;
    const lightColor = theme.highlight;

    ctx.fillStyle = mainColor;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    if (isBomb) {
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💥', x + size / 2, y + size / 2 + 8);
    } else if (isQuestion) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Cubic 11", "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', x + size / 2, y + size / 2 + 7);
    } else {
      ctx.fillStyle = darkColor;
      ctx.fillRect(x, y + size / 2, size, 2);
      ctx.fillRect(x + size / 2, y, 2, size / 2);
      ctx.fillRect(x + size / 4, y + size / 2, 2, size / 2);
      ctx.fillRect(x + (size * 3) / 4, y + size / 2, 2, size / 2);

      ctx.fillStyle = lightColor;
      ctx.fillRect(x + 2, y + 2, size - 4, 2);
      ctx.fillRect(x + 2, y + 2, 2, size - 4);
    }
  }

  drawGhostBlock(ctx, x, y, theme, isBomb = false) {
    const size = this.cellSize;
    ctx.strokeStyle = theme.highlight;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    ctx.setLineDash([]);
    if (isBomb) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💥', x + size / 2, y + size / 2 + 6);
    }
  }

  renderSidePreview(ctx, piece, theme) {
    if (!ctx) return;
    ctx.fillStyle = '#0f0f1b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!piece) return;
    const blocks = piece.getBlocks(0, 0);
    const miniSize = 11;
    const offsetX = (ctx.canvas.width - piece.shape[0].length * miniSize) / 2;
    const offsetY = (ctx.canvas.height - piece.shape.length * miniSize) / 2;

    blocks.forEach(b => {
      ctx.fillStyle = (piece.isBomb || piece.isQuestion) ? theme.question : theme.main;
      ctx.fillRect(offsetX + b.x * miniSize, offsetY + b.y * miniSize, miniSize - 1, miniSize - 1);
    });
  }

  render(board, p1Piece, p2Piece, nextPiece, mode) {
    const theme = board.getCurrentTheme();

    this.ctx.fillStyle = '#0f0f1b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = board.grid[r][c];
        if (cell !== null) {
          this.drawBrick(this.ctx, c * this.cellSize, r * this.cellSize, theme, cell.isQuestion, cell.playerIndex, cell.isBomb);
        }
      }
    }

    if (p1Piece) {
      let ghostY = p1Piece.y;
      while (!board.isCollision(p1Piece.getBlocks(p1Piece.x, ghostY + 1))) {
        ghostY++;
      }
      p1Piece.getBlocks(p1Piece.x, ghostY).forEach(b => {
        this.drawGhostBlock(this.ctx, b.x * this.cellSize, b.y * this.cellSize, theme, p1Piece.isBomb);
      });

      p1Piece.getBlocks().forEach(b => {
        this.drawBrick(this.ctx, b.x * this.cellSize, b.y * this.cellSize, theme, b.isQuestion, 1, p1Piece.isBomb);
      });
    }

    if (mode === 'coop' && p2Piece) {
      p2Piece.getBlocks().forEach(b => {
        this.drawBrick(this.ctx, b.x * this.cellSize, b.y * this.cellSize, theme, b.isQuestion, 2, p2Piece.isBomb);
      });
    }

    this.renderSidePreview(this.nextCtx, nextPiece, theme);
  }
}

window.Renderer = Renderer;
