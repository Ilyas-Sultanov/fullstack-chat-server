import { QueryOptions } from 'mongoose';
import ApiError from '../exceptions/ApiError';
import { cleanObject, paginatedResults } from '../helpers';
import { ChatModel } from '../models/Chat';
import { UserModel } from '../models/User';
import { IChat } from '../types';
import { IChatQuery } from '../types/chat';

class ChatService {
  async accessChat(currentUserId: string, targetUserId: string) {    
    const targetUser = await UserModel.findOne(
      {_id: targetUserId},
      '',
      {lean: true}
    );
    if (!targetUser) {
      throw ApiError.badRequest(`User with id: ${targetUserId} not found`);
    }

    const chat = await ChatModel.findOne(
      {
        isGroupChat: false,
        $and: [
          { users: {$elemMatch: { $eq: currentUserId }} },
          { users: {$elemMatch: { $eq: targetUserId }} }
        ]
      },
      '',
      {
        populate: [
          { // Заполняем первое поле
            path: 'users', 
            select: '-password',
          },
          { // Заполняем второе поле
            path: 'lastMessage', 
            populate: { // Populating across multiple levels (в заполненом поле lastMessage, заполняем поле sender)
              path: 'sender',
              select: '-password',
            }
          }, 
        ],
        lean: true,
      }
    );

    if (chat) {
      // Если чат найден, то возвращаем его
      return chat;
    }
    else {
      // Если чат не найде, то создаём новый
      const chatData = {
        name: 'Chat One on One', // Для чата один на один имя собеседника является названием чата, имя будет вычисляться на фронте.
        isGroupChat: false,
        users: [currentUserId, targetUserId]
      }

      const newChat = await ChatModel.create(chatData);
      const chat = await ChatModel.findOne(
        {_id: newChat._id},
        '',
        {
          populate: {
            path: 'users',
            select: '-password'
          },
          lean: true,
        }
      );

      return chat!;
    }
  }

  async getUserChats(userId: string) {
    const chats = await ChatModel.find(
      { users: {$elemMatch: { $eq: userId }} },
      '-updatedAt -__v',
      {
        populate: [
          {
            path: 'users',
            select: '-password -updatedAt -__v',
          },
          {
            path: 'groupAdmin',
            select: '-password -updatedAt -__v',
          },
          {
            path: 'lastMessage', 
            populate: { 
              path: 'sender',
              select: '-password',
            }
          },
        ],
        lean: true,
      }
    );
    return chats;
  }

  async searchChat(currentUserId: string, query: IChatQuery, originalUrl: string) {
    const filter = { 
      $and: [
        { isGroupChat: true }, // искать только по групповым чатам
        { users: { "$ne": currentUserId } }, // Искать только там где нет текущего пользователя
        { name: {$regex: new RegExp('^' + query.name + '.*', 'i')} }, // Искать чаты, название которых начинается с query.name или равно ему.
      ]
    }

    const preOptions: QueryOptions = {
      limit: query.limit ? parseInt(query.limit) : 10,
      skip: query.page
        ? (parseInt(query.page) - 1) *
          (query.limit ? parseInt(query.limit) : 10)
        : undefined,
      populate: [
        {
          path: 'users',
          select: '-password',
        },
        {
          path: 'groupAdmin',
          select: '-password',
        },
        {
          path: 'lastMessage', 
          populate: { 
            path: 'sender',
            select: '-password',
          }
        },
      ],
      lean: true,
    };

    const queryProjection = '';
    const options: QueryOptions = cleanObject(preOptions);

    const chats = await paginatedResults<IChat>(
      ChatModel,
      filter,
      originalUrl,
      queryProjection,
      options,
      query.page ? parseInt(query.page) : null
    );
    
    return chats;
  }

  async createGroupChat(name: string, adminId: string) {
    const groupChatData = {
      name,
      users: [adminId],
      isGroupChat: true,
      groupAdmin: adminId,
    }

   await ChatModel.create(groupChatData);
  }

  async renameGroupChat(currentUserId: string, groupChatId: string, newName: string) {
    const targetChat = await ChatModel.findOne(
      {_id: groupChatId},
    )   

    if (targetChat && targetChat.groupAdmin && targetChat.groupAdmin._id.toString() === currentUserId) {
      targetChat.name = newName;
      await targetChat.save();
    }
    else {
      throw ApiError.badRequest('The chat was not found or you are not the administrator of the current chat.')
    }
  }

  async deleteGroupChat(currentUserId: string, chatId: string) {
    const result = await ChatModel.deleteOne(
      {
        _id: chatId,
        isGroupChat: true,
        groupAdmin: currentUserId,
      },
    );

    if (result.deletedCount !== 1) {
      throw ApiError.badRequest('Chat not found.')
    }
  }

  async joinToGroup(groupChatId: string, userId: string) { 
    const chat = await ChatModel.findOneAndUpdate(
      {
        _id: groupChatId
      },
      {
        $addToSet: { users: { $each: [userId] } } // $addToSet - добавит в массив только уникальное значение, $each - распаковывает массив в нужный (в данном примере в users)
      },
      {
        new: true,
        lean: true,
      }
    );

    if (!chat) {
      throw ApiError.badRequest('The chat was not found.')
    }
  }

  async deleteUserFromChat(chatId: string, userId: string) {
    const chat = await ChatModel.findOne({_id: chatId});
    if (!chat) throw ApiError.badRequest('Chat not found.');
    else if (!chat.isGroupChat) await chat.delete(); // если чат 'один на один' покидает один из пользователей, то удаляем весь чат.
    else {
      await ChatModel.findOneAndUpdate(
        {_id: chatId},
        {$pull: { users: { $in: [userId] } }}, // $pull - удаляет из массива, $in - всё что входит в массив, удалится из users
      );
    }
  }
}

export const chatService = new ChatService();