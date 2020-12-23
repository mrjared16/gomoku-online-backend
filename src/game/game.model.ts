import { MoveRecordDTO } from 'src/gameHistory/gameHistory.dto';
import { GameEntity } from 'src/game/game.entity';
import { GomokuGamePlayer } from 'src/game/game.dto';
import { RoomModel } from './../room/room.model';
import { GameSide } from 'src/gameHistory/moveRecord.entity';
import { Injectable } from '@nestjs/common';
import { GameOption } from './game.dto';

export class GameModel {
  constructor(
    gameOption: GameOption,
    private players: GomokuGamePlayer,
    private gameEntity: GameEntity,
  ) {
    const { boardSize, time } = gameOption;
    this.board = new Array(boardSize).fill(-1);
    this.boardSize = boardSize;
    this.time = time;
    this.turn = GameSide.X;
    this.remainingTime = this.time;
    this.moves = [];
  }

  boardSize: number;
  time: number;

  private remainingTime: number;
  public turn: GameSide;

  public moves: MoveRecordDTO[];

  public board: (null | GameSide)[];

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

  isFinish() {
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
}
