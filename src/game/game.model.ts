import { GameSide, GomokuGamePlayer } from 'src/game/game.dto';
import { GameEntity } from 'src/game/game.entity';
import { MoveRecordDTO, RankRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameOption, GameResult } from './game.dto';
import { GameHelper } from './game.helper';
import { GameEndResponse } from './game.interface';

export class GameModel {
  constructor(
    gameOption: GameOption,
    private players: GomokuGamePlayer,
    private gameEntity: GameEntity,
  ) {
    const { boardSize, time } = gameOption;
    this.board = new Array(boardSize * boardSize).fill(null);
    this.boardSize = boardSize;
    this.time = time;
    this.turn = GameSide.X;
    this.remainingTime = this.time;
    this.moves = [];
    this.winLine = [];
    this.gameResult = null;
  }

  boardSize: number;
  time: number;

  private remainingTime: number;
  public turn: GameSide;

  public moves: MoveRecordDTO[];

  public board: (null | GameSide)[];
  private winLine: number[];
  private gameResult: GameResult;

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

  addMove(position: number, value: GameSide) {
    const newMove: MoveRecordDTO = {
      id: '',
      position: position,
      value: value,
      time: new Date(),
    };
    this.moves.push(newMove);
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
    if (gameResult.status == 'finish') {
      const { result, winLine } = gameResult;
      this.gameResult = result;
      this.winLine = winLine;
      return true;
    }
    return false;
  }

  getMoves(): MoveRecordDTO[] {
    return this.moves;
  }

  getTurn(): GameSide {
    return this.turn;
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }

  getPlayers(): GomokuGamePlayer {
    return this.players;
  }

  getGameID(): string {
    return this.gameEntity.id;
  }

  getStartedDate(): Date {
    return this.gameEntity.start_at;
  }

  getDuration(): number {
    return this.gameEntity.duration;
  }

  getRankRecord(): RankRecordDTO[] {
    return [];
  }

  getWinLine(): number[] {
    return this.winLine;
  }

  getGameResult(): GameResult {
    return this.gameResult;
  }

  getGameEntity(): GameEntity {
    return this.gameEntity;
  }

  saveGameState() {
    // save result
    this.gameEntity.gameResult = this.gameResult;

    // save duration
    this.gameEntity.duration =
      (Date.now() - this.gameEntity.start_at.getTime()) / 1000;
  }

  getGameEndResponse(): GameEndResponse {
    throw new Error('Method not implemented.');
  }
}
