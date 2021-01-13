import { ApiProperty } from '@nestjs/swagger';
import { ChatChannelEntity } from 'src/chat/chatChannel.entity';
import { ChatRecordEntity } from 'src/chat/chatRecord.entity';
import { UserDTO } from 'src/users/users.dto';
export class ChatRecordDTO {
  @ApiProperty()
  user: UserDTO;
  @ApiProperty()
  content: string;
  @ApiProperty()
  createdAt: Date;
  static EntityToDTO(chatRecordEntity: ChatRecordEntity) {
    const { user, content, created_at } = chatRecordEntity;
    return {
      user: UserDTO.EntityToDTO(user),
      content,
      createdAt: created_at,
    };
  }
}

export class ChatDTO {
  @ApiProperty()
  users: UserDTO[];
  @ApiProperty()
  chatRecord: ChatRecordDTO[];
  static EntityToDTO(chatEntity: ChatChannelEntity) {
    const { users, records } = chatEntity;
    return {
      chatRecord: records.map(ChatRecordDTO.EntityToDTO),
      user: users.map(UserDTO.EntityToDTO),
    };
  }
}

export type JoinChatRoomDTO = {
  roomID: string;
  chatChannelID: string;
};

export type SentMessageToRoomChatDTO = {
  roomID: string;
  chatChannelID: string;
  data: {
    token: string;
    content: string;
  };
};
