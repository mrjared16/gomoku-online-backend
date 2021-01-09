import { ChatRecordDTO } from './chat.dto';

export type BroadcastChatEventToCurrentChannelDTO = {
  event: 'onReceivedMessage';
  data: ChatRecordDTO;
};
