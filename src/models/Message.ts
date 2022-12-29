import { Schema, model } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    content: {
      type: String,
      trim: true,
      required: [true, 'Message is required'],
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'chats',
    }
  },
  {
    timestamps: true,
  }
);

export const MessageModel = model<IMessage>('messages', MessageSchema);