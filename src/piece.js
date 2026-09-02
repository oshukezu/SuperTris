// SuperTris Tetromino 方塊定義、SRS Wall Kick 與 1x1 特殊問號磚支援 (Piece Module)

const TETROMINOES = {
  I: {
    shape: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    type: 'I'
  },
  J: {
    shape: [
      [1,0,0],
      [1,1,1],
      [0,0,0]
    ],
    type: 'J'
  },
  L: {
    shape: [
      [0,0,1],
      [1,1,1],
      [0,0,0]
    ],
    type: 'L'
  },
  O: {
    shape: [
      [1,1],
      [1,1]
    ],
    type: 'O'
  },
  S: {
    shape: [
      [0,1,1],
      [1,1,0],
      [0,0,0]
    ],
    type: 'S'
  },
  T: {
    shape: [
      [0,1,0],
      [1,1,1],
      [0,0,0]
    ],
    type: 'T'
  },
  Z: {
    shape: [
      [1,1,0],
      [0,1,1],
      [0,0,0]
    ],
    type: 'Z'
  },
  // 1x1 單顆特殊問號磚
  Q: {
    shape: [
      [1]
    ],
    type: 'Q'
  }
};

const PIECE_TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// 標準 SRS Wall Kick 偏移表
const WALL_KICK_DATA = {
  NORMAL: [
    [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]], // 0->1
    [[0,0], [1,0], [1,-1], [0,2], [1,2]],     // 1->2
    [[0,0], [1,0], [1,1], [0,-2], [1,-2]],    // 2->3
    [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]]   // 3->0
  ],
  I: [
    [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],   // 0->1
    [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],   // 1->2
    [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],   // 2->3
    [[0,0], [1,0], [-2,0], [1,-2], [-2,1]]    // 3->0
  ]
};

class Piece {
  constructor(type, isQuestion = false, playerIndex = 1) {
    this.type = type;
    this.shape = TETROMINOES[type].shape.map(row => [...row]);
    this.rotation = 0;
    this.isQuestion = isQuestion || (type === 'Q'); // 若為 Q 必然是問號磚
    this.playerIndex = playerIndex;

    this.x = Math.floor((10 - this.shape[0].length) / 2);
    this.y = 0;
  }

  getRotatedMatrix(dir = 1) {
    const N = this.shape.length;
    if (N <= 1) return this.shape.map(r => [...r]);
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (dir === 1) {
          result[c][N - 1 - r] = this.shape[r][c];
        } else {
          result[N - 1 - c][r] = this.shape[r][c];
        }
      }
    }
    return result;
  }

  getBlocks(offsetX = this.x, offsetY = this.y, shape = this.shape) {
    const blocks = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          blocks.push({
            x: offsetX + c,
            y: offsetY + r,
            isQuestion: this.isQuestion,
            playerIndex: this.playerIndex
          });
        }
      }
    }
    return blocks;
  }
}

// 7-Bag 隨機抽取器 (有機率額外抽出 1x1 特殊問號磚)
class RandomBag {
  constructor() {
    this.bag = [];
  }

  next() {
    // 8% 機率直接掉落 1x1 問號磚
    if (Math.random() < 0.08) {
      return new Piece('Q', true);
    }

    if (this.bag.length === 0) {
      this.bag = [...PIECE_TYPES].sort(() => Math.random() - 0.5);
    }
    const type = this.bag.pop();
    // 預設一般方塊為純磚塊
    return new Piece(type, false);
  }
}

window.Piece = Piece;
window.RandomBag = RandomBag;
window.WALL_KICK_DATA = WALL_KICK_DATA;
window.TETROMINOES = TETROMINOES;
