import { GameSide } from 'src/game/game.dto';
import { GameResult } from './../game/game.dto';
import { TeamEntity } from './team.entity';

export type RankData = {
  enemyRank: number;
  currentRank: number;
  isDraw: boolean;
  isWon: boolean;
};

export const getNewRank = ({
  currentRank,
  enemyRank,
  isDraw,
  isWon,
}: RankData) => {
  if (isDraw) {
    return currentRank;
  }

  const MAX_DIFF_ELO = 1000;
  const AVG_GAMES_TO_UP_RANK = 40;
  const AVG_GAINED_ELO_PER_GAME = Math.round(
    MAX_DIFF_ELO / AVG_GAMES_TO_UP_RANK,
  ); //25
  const MIN_ELO_GAINED_PER_GAME = 5;
  const MAX_ELO_GAINED_PER_GAME =
    2 * AVG_GAINED_ELO_PER_GAME - MIN_ELO_GAINED_PER_GAME; // 45
  /*
    MAX DIFF ELO -> MAX DIFF GAINED ELO/game (max - min)
    X (x = enemy - current) diff ELO -> Y gained diff elo (Y = x * (max - min) / MAX DIFF ELO = x / 50)
    won: elo = current + (AVG_GAINED + x / 50)
    lost: elo = current - (AVG_GAINED - x / 50)
  */
  const getRankDiff = (enemyRank, currentRank) => {
    if (enemyRank - currentRank > MAX_DIFF_ELO) return MAX_DIFF_ELO;
    if (enemyRank - currentRank < -MAX_DIFF_ELO) {
      return -MAX_DIFF_ELO;
    }
    return enemyRank - currentRank;
  };

  const rankDiff = getRankDiff(enemyRank, currentRank);
  const gainedRankDiffDivFactor = Math.round(
    MAX_DIFF_ELO / (MAX_ELO_GAINED_PER_GAME - MIN_ELO_GAINED_PER_GAME),
  );
  const newRank = isWon
    ? currentRank +
      AVG_GAINED_ELO_PER_GAME +
      Math.round(rankDiff / gainedRankDiffDivFactor)
    : currentRank -
      (AVG_GAINED_ELO_PER_GAME -
        Math.round(rankDiff / gainedRankDiffDivFactor));
  return Math.round(newRank);
};

export const getUserResult = (gameSide: GameSide, gameResult: GameResult) => {
  return {
    isDraw: gameResult === GameResult.Draw,
    isWon: (gameSide as 0 | 1) == (gameResult as 0 | 1),
  };
};

export class GetRankData {
  constructor(team: TeamEntity[]) {
    this.avgRankOf2Team = team.reduce((avgRank, currentTeam) => {
      const { side, users } = currentTeam;

      const totalRankTeam = users.reduce(
        (totalRank, curUser) => totalRank + curUser.rank,
        0,
      );

      avgRank[side as 0 | 1] = Math.round(totalRankTeam / users.length);
      return avgRank;
    }, {} as { 0: number; 1: number });
  }
  private avgRankOf2Team: { 0: number; 1: number };

  getAvgRankOfEnemy(side: GameSide): number {
    return this.avgRankOf2Team[(side + 1) % 2];
  }
}
