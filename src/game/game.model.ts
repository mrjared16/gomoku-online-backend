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
  }
  boardSize: number;
  time: number;
  private remainingTime: number;
  public board: (null | GameSide)[];
  public turn: GameSide;

  hit(position: number, value: GameSide) {
    this.board[position] = value;
    this.turn = (this.turn + 1) % 2;
    this.remainingTime = this.time;
  }

  isFinish() {
    return false;
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
