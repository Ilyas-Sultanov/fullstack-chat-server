import { ChatModel, UserModel } from '../models';
import { MessageModel } from '../models/Message';
import { IMessage } from '../types';

class Message {
  async create(currentUserId: string, chatId: string, content: string) {
    const msg = {
      chatId,
      sender: currentUserId,
      content,
    }

    let newMessage = await MessageModel.create(msg);
    // newMessage = await newMessage.populate('sender', 'name avatar');
    // newMessage = await newMessage.populate('chat');
    // const message = await UserModel.populate(newMessage, {
    //   path: 'chat.users',
    //   select: 'name avatar email',
    // });

    await ChatModel.findByIdAndUpdate(
      chatId,
      { lastMessage: newMessage._id }
    );
  }

  async getAll(chatId: string) {
    const messages = await MessageModel.find(
      { chatId: chatId },
      '',
      {
        populate: {
          path: 'sender',
          select: '-password -roles -createdAt -updatedAt -isActivated -__v',
        }
      }
    );
    return messages;
  }
}

export const messageService = new Message();