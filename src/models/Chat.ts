import { Schema, model } from 'mongoose';
import { IChat } from '../types';

const ChatSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required:  [true, 'Chat name is required'],
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      }
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'messages',
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    }
  },
  {
    timestamps: true,
  }
);

export const ChatModel = model<IChat>('chats', ChatSchema);