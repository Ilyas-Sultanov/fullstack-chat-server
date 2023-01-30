import { QueryOptions } from 'mongoose';
import { ChatModel } from '../models';
import { MessageModel } from '../models/Message';
import { IMessage } from '../types';
import { paginatedResults, cleanObject } from '../helpers';
import { IMessageQuery } from '../types/message';

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

    return newMessage;
  }

  async getAll(query: IMessageQuery, originalUrl: string) {
    const filter = { chatId: query.chatId };
    const queryProjection = '';
    const { limit, skip } = await this.calculateLimitAndSkip(query.chatId, query.limit ? parseInt(query.limit) : 25, query.page ? parseInt(query.page) : 1);
    const preOptions: QueryOptions = {
      limit,
      skip,
      sort: { createdAt: 1 },
      populate: {
        path: 'sender',
        select: '-password -roles -createdAt -updatedAt -isActivated -__v',
      },
      lean: true,
    };
    const options: QueryOptions = cleanObject(preOptions);

    const messages = await paginatedResults<IMessage>(
      MessageModel,
      filter,
      originalUrl,
      queryProjection,
      options,
      query.page ? parseInt(query.page) : null
    );

    return messages;
  }

  private async calculateLimitAndSkip(chatId: string, limit: number, page: number) {
    /**
     * Внимание, здесь реализован расчет limit и skip, для reverse pagination.
     * Например есть коллекция документов: 1-2-3-4-5-6-7-8-9-10, а limit === 3.
     * При обычной пагинации страницы выгледели бы так: page1: 1-2-3, page2: 4-5-6, page3: 7-8-9, page4: 10.
     * В обратной пагинации страницы будут выглядеть так: page1: 8-9-10, page2: 5-6-7, page3: 2-3-4, page4: 1.
     * P.S. Обратная пагинация используется в чате, когда пользователь прокручивает блок с сообщениями вверх, 
     * а не вниз, чтобы увидеть старые сообщения.
     */
    const totalDocs = await MessageModel.countDocuments({ chatId });

    const totalPages = Math.ceil(totalDocs / limit);
    if (page === totalPages) return { limit: totalDocs - limit, skip: 0 };

    const count = totalDocs - (limit * page);
    if (count > 0) return { limit: limit, skip: count };

    return { limit: limit, skip: 0 }
  }

}

export const messageService = new Message();