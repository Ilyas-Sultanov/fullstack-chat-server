import { Request, Response, NextFunction } from 'express';
import ApiError from '../exceptions/ApiError';
import { chatService } from '../services/chat';

class ChatController {
  async accessChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId }: { userId: string } = req.body;
      if (!userId) {
        throw ApiError.badRequest('userId is required.');
      }

      const chat = await chatService.accessChat(req.user._id.toString(), userId);
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }

  async getAllChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.getAllChats(req.user._id.toString());
      return res.json(chats);
    }
    catch (err) {
      next(err)
    }
  }

  async createGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {name, users}: {name: string, users: string} = req.body;
      const chat = await chatService.createGroupChat(name, req.user._id.toString(), JSON.parse(users));
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }

  async renameGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {groupChatId, newName}: {groupChatId: string, newName: string} = req.body;
      const chat = await chatService.renameGroupChat(req.user._id.toString(), groupChatId, newName);
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }

  async joinToGroup(req: Request, res: Response, next: NextFunction) { // Вступить в групповой чат
    try {
      const {groupChatId}: {groupChatId: string, userId: string} = req.body;
      const chat = await chatService.joinToGroup(groupChatId, req.user._id.toString());
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }

  async leaveGroup(req: Request, res: Response, next: NextFunction) { // Выйти из группового чата
    try {
      const {groupChatId}: {groupChatId: string} = req.body;
      const chat = await chatService.leaveGroup(groupChatId, req.user._id.toString());
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }
}

export const chatController = new ChatController();