import { GameSide, GameResult } from './game.dto';

export class GameHelper {
  static isFinish(
    board: (null | GameSide)[],
    boardSize: number,
    numberOfWinLine = 5,
  ):
    | {
        status: 'finish';
        result: GameResult;
        winLine: (null | GameSide)[];
      }
    | {
        status: 'not finish';
      } {
    const getValue = (i, j) => {
      const value = board[i * boardSize + j];
      return value;
    };

    const isValid = (i, j) => {
      const result =
        i >= 0 &&
        i < boardSize &&
        j >= 0 &&
        j < boardSize &&
        getValue(i, j) != null;
      return result;
    };

    let winLine: (null | GameSide)[] = [];
    let gameResult: GameResult = null;

    let isWon = false;
    const direction = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (!isValid(i, j)) {
          continue;
        }

        const currentPlayer = getValue(i, j);

        direction.forEach(([row, col]) => {
          const currentLine = [i * boardSize + j];

          for (let k = 1; k < numberOfWinLine; k++) {
            const [nextX, nextY] = [i + row * k, j + col * k];
            if (
              !isValid(nextX, nextY) ||
              getValue(nextX, nextY) != currentPlayer
            ) {
              return;
            }
            currentLine.push(nextX * boardSize + nextY);
          }

          const isValidTop = isValid(i + row * -1, j + col * -1);
          const top = getValue(i + row * -1, j + col * -1);
          const isBlockTop = isValidTop && top != currentPlayer;

          const isValidBot = isValid(
            i + row * numberOfWinLine,
            j + col * numberOfWinLine,
          );
          const bot = getValue(
            i + row * numberOfWinLine,
            j + col * numberOfWinLine,
          );
          const isBlockBot = isValidBot && bot != currentPlayer;
          if (!isBlockBot || !isBlockTop) {
            isWon = true;
            winLine = [...currentLine];
            gameResult = currentPlayer as 0 | 1;
          }
        });

        if (isWon) {
          return {
            status: 'finish',
            winLine: winLine,
            result: gameResult,
          };
        }
      }
    }
    return {
      status: 'not finish',
    };
  }
}
