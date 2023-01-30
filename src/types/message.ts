import { PopulatedDoc, Document, ObjectId } from 'mongoose';
import { IChat } from './chat';
import { IPaginatedQuery } from './paginatedQuery';
import { IUser } from './user';

export interface IMessage {
  sender: PopulatedDoc<Document<ObjectId> & IUser>,
  content: string,
  chatId: PopulatedDoc<Document<ObjectId> & IChat>,
}

export interface IMessageQuery extends IPaginatedQuery {
  chatId: string
}