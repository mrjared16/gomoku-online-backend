export class GameModel {
  constructor(size: number) {
    this.board = new Array(size * size).fill(-1);
    this.turn = 0;
  }
  public board: (-1 | 0 | 1)[];
  public turn: number;

  hit(index: number, value: 0 | 1) {
    this.board[index] = value;
    this.turn = (this.turn + 1) % 2;
  }

  isFinish() {
    return false;
  }

  getTurn(): 0 | 1 {
    return this.turn as 0 | 1;
  }
}
