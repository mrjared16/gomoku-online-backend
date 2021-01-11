import { GameSide, GomokuGamePlayer } from 'src/game/game.dto';
import { GameEndingType, GameEntity } from 'src/game/game.entity';
import { MoveRecordDTO, RankRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameOption, GameResult } from './game.dto';
import { GameHelper } from './game.helper';
import { GameEndResponse } from './game.interface';

export class GameModel {
  private boardSize: number;
  private time: number;

  private board: (null | GameSide)[];

  private remainingTime: number;
  private turn: GameSide;

  private moves: MoveRecordDTO[];

  constructor(gameOption: GameOption, private gameEntity: GameEntity) {
    const { boardSize, time } = gameOption;

    this.boardSize = boardSize;
    this.board = new Array(boardSize * boardSize).fill(null);

    this.time = time;

    this.moves = [];

    this.turn = GameSide.X;
    this.remainingTime = this.time;
  }

  hit(position: number, value: GameSide): boolean {
    if (!this.isValidHit(position, value)) {
      return false;
    }
    this.addMove(position, value);

    this.board[position] = value;

    this.turn = (this.turn + 1) % 2;
    this.remainingTime = this.time;

    return true;
  }

  isValidHit(position: number, value: GameSide): boolean {
    if (position < 0 || position >= this.boardSize * this.boardSize)
      return false;
    if (value !== this.turn) return false;
    if (this.remainingTime <= 0) {
      return false;
    }
    return true;
  }

  isFinish(): boolean {
    const gameResult = GameHelper.isFinish(this.board, this.boardSize);
    if (gameResult.status !== 'finish') {
      return false;
    }
    const { result, winLine } = gameResult;

    this.gameEntity.gameEndingType = GameEndingType.normal;
    this.gameEntity.gameResult = result;
    this.gameEntity.winningLine = winLine.join('-');
    this.gameEntity.duration =
      (Date.now() - this.gameEntity.start_at.getTime()) / 1000;
    return true;
  }

  addMove(position: number, value: GameSide) {
    const newMove: MoveRecordDTO = {
      id: '',
      position: position,
      value: value,
      time: new Date(),
    };
    this.moves.push(newMove);
  }

  // for live game
  getMoves(): MoveRecordDTO[] {
    return this.moves;
  }

  // for live game
  getTurn(): GameSide {
    return this.turn;
  }

  // for live game
  getRemainingTime(): number {
    return this.remainingTime;
  }

  // for saving game state
  getGameEntity(): GameEntity {
    return this.gameEntity;
  }

  getGameID(): string {
    return this.gameEntity.id;
  }

  // for calculate rank
  getGameResult(): GameResult {
    return this.gameEntity.gameResult;
  }

  getGameEndResponse(): GameEndResponse {
    const {
      winningLine,
      rankRecords,
      gameResult,
      gameEndingType,
      duration,
    } = this.gameEntity;
    return {
      gameResult,
      gameEndingType,
      winningLine,
      duration,
      rankRecords: rankRecords.map(RankRecordDTO.EntityToDTO),
    };
  }
}
