import { Schema } from 'mongoose';

export interface IChat {
  name: string,
  isGroupChat: boolean,
  users: Array<Schema.Types.ObjectId>,
  lastMessage: string,
  groupAdmin: Array<Schema.Types.ObjectId>,
}
