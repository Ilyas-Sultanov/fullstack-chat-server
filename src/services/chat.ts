import ApiError from '../exceptions/ApiError';
import { ChatModel } from '../models/Chat';
import { UserModel } from '../models/User';

class ChatService {
  async accessChat(user1Id: string, user2Id: string) {

    const user2 = await UserModel.findOne(
      {_id: user2Id},
      '',
      {lean: true}
    );
    if (!user2) {
      throw ApiError.badRequest(`User with id: ${user2Id} not found`);
    }

    const chat = await ChatModel.findOne(
      {
        isGroupChat: false,
        $and: [
          { users: {$elemMatch: { $eq: user1Id }} },
          { users: {$elemMatch: { $eq: user2Id }} }
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
        name: user2.name,
        isGroupChat: false,
        users: [user1Id, user2Id]
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

  async getAllChats(userId: string) {
    const chats = await ChatModel.find(
      { users: {$elemMatch: { $eq: userId }} },
      '',
      {
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
      }
    );
    return chats;
  }

  async createGroupChat(name: string, adminId: string, usersIds: Array<string>) {
    const groupChatData = {
      name,
      users: [adminId, ...usersIds],
      isGroupChat: true,
      groupAdmin: adminId,
    }

    const newChat = await ChatModel.create(groupChatData);
    const chat = await ChatModel.findOne(
      {_id: newChat},
      '',
      {
        populate: [
          {
            path: 'users',
            select: '-password',
          },
          {
            path: 'groupAdmin',
            select: '-password',
          }
        ]
      }
    );

    return chat!;
  }

  async renameGroupChat(currentUserId: string, groupChatId: string, newName: string) {
    const targetChat = await ChatModel.findOne(
      {
        _id: groupChatId,
      },
      '',
      {
        populate: [
          {
            path: 'users',
            select: '-password',
          },
          {
            path: 'groupAdmin',
            select: '-password',
          }
        ]
      }
    )   

    if (targetChat && targetChat.groupAdmin && targetChat.groupAdmin._id.toString() === currentUserId) {
      targetChat.name = newName;
      await targetChat.save();
      return targetChat;
    }
    else {
      throw ApiError.badRequest('The chat was not found or you are not the administrator of the current chat.')
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
        populate: [
          {
            path: 'users',
            select: '-password',
          },
          {
            path: 'groupAdmin',
            select: '-password',
          }
        ],
        new: true,
        lean: true,
      }
    );

    if (!chat) {
      throw ApiError.badRequest('The chat was not found.')
    }
    else {
      return chat;
    }
  }

  async leaveGroup(groupChatId: string, userId: string) {
    const chat = await ChatModel.findOneAndUpdate(
      {
        _id: groupChatId
      },
      {
        $pull: { users: { $in: [userId] } } // $pull - удаляет из массива, $in - всё что входит в массив, удалится из users
      },
      {
        populate: [
          {
            path: 'users',
            select: '-password',
          },
          {
            path: 'groupAdmin',
            select: '-password',
          }
        ],
        new: true,
        lean: true,
      }
    );

    if (!chat) {
      throw ApiError.badRequest('The chat was not found.')
    }
    else {
      return chat;
    }
  }
}

export const chatService = new ChatService();