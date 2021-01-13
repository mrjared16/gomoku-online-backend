import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";
import { UserDTO } from "./users.dto";

export class UserDetailResponse {
  @ApiResponseProperty()
  user: UserDTO;
}
class LeaderBoardProfile {
  @ApiProperty()
  rankIndex: number;
  @ApiProperty()
  user: UserDTO;
}
class LeaderBoardDTO {
  @ApiProperty({
    type: LeaderBoardProfile,
    isArray: true,
  })
  users: LeaderBoardProfile[];
}
export class LeaderboardResponse {
  @ApiResponseProperty()
  leaderboard: LeaderBoardDTO;
}