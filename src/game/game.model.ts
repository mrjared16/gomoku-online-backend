import { MoveRecordDTO, RankRecordDTO } from 'src/gameHistory/gameHistory.dto';
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
    this.board = new Array(boardSize * boardSize).fill(-1);
    this.boardSize = boardSize;
    this.time = time;
    this.turn = GameSide.X;
    this.remainingTime = this.time;
    this.moves = [];
    this.winLine = [];
    this.winSide = null;
  }

  boardSize: number;
  time: number;

  private remainingTime: number;
  public turn: GameSide;

  public moves: MoveRecordDTO[];

  public board: (null | GameSide)[];
  private winLine: number[];
  private winSide: GameSide | null;

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
    let isWon = false;
    const numberOfWinLine = 5;
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
    const getValue = (i, j) => {
      const value = this.board[i * this.boardSize + j];
      return value;
    };
    const isValid = (i, j) => {
      const result =
        i >= 0 &&
        i < this.boardSize &&
        j >= 0 &&
        j < this.boardSize &&
        getValue(i, j) != -1;
      return result;
    };
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (getValue(i, j) === -1) {
          continue;
        }
        const currentPlayer = getValue(i, j);
        direction.forEach(([row, col]) => {
          const currentLine = [i * this.boardSize + j];
          for (let k = 1; k < numberOfWinLine; k++) {
            const [nextX, nextY] = [i + row * k, j + col * k];
            if (
              !isValid(nextX, nextY) ||
              getValue(nextX, nextY) != currentPlayer
            ) {
              return;
            }
            currentLine.push(nextX * this.boardSize + nextY);
          }
          const isValidTop = isValid(i + row * -1, j + col * -1);
          const top = getValue(i + row * -1, j + col * -1);
          const isValidBot = isValid(
            i + row * numberOfWinLine,
            j + col * numberOfWinLine,
          );
          const bot = getValue(
            i + row * numberOfWinLine,
            j + col * numberOfWinLine,
          );
          const isBlockTop = isValidTop && top != currentPlayer;
          const isBlockBot = isValidBot && bot != currentPlayer;
          if (!isBlockBot || !isBlockTop) {
            isWon = true;
            this.winLine = [...currentLine];
            this.winSide = currentPlayer;
          }
        });
        if (isWon) {
          return true;
        }
      }
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
  getWinSide(): GameSide {
    return this.winSide;
  }
  saveGameState() {
    // save moves
    this.gameEntity.moves = this.moves.map((moveDTO) =>
      MoveRecordDTO.DTOToEntity(moveDTO),
    );

    // save result
    this.gameEntity.winSide = this.winSide;

    // save duration
    this.gameEntity.duration =
      (Date.now() - this.gameEntity.start_at.getTime()) / 1000;
    console.log({ gameEntity: this.gameEntity });

    // TODO: save chat
    // TODO: save rank records
  }
}
