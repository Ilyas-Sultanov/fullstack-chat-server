import { PopulatedDoc, Document, ObjectId } from 'mongoose';
import { IChat } from './chat';
import { IUser } from './user';

export interface IMessage {
  sender: PopulatedDoc<Document<ObjectId> & IUser>,
  content: string,
  chatId: PopulatedDoc<Document<ObjectId> & IChat>,
}