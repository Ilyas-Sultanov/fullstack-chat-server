import { Schema, Document, ObjectId, PopulatedDoc } from 'mongoose';
import { IUser } from '../types/user';

// export interface IChat {
//   name: string,
//   isGroupChat: boolean,
//   users: Array<Schema.Types.ObjectId>,
//   lastMessage: string,
//   groupAdmin: Array<Schema.Types.ObjectId>,
// }

export interface IChat {
  name: string,
  isGroupChat: boolean,
  users: Array<PopulatedDoc<Document<ObjectId> & IUser>>,
  lastMessage: string,
  groupAdmin: PopulatedDoc<Document<ObjectId> & IUser>,
}


