import { Request, Response, NextFunction } from 'express';
import ApiError from '../exceptions/ApiError';
import { chatService } from '../services/chat';

class ChatController {
  async accessChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetUserId }: { targetUserId: string } = req.body;
      
      if (!targetUserId) {
        throw ApiError.badRequest('userId is required.');
      }

      const chat = await chatService.accessChat(req.user._id.toString(), targetUserId);
      return res.json(chat);
    }
    catch (err) {
      next(err)
    }
  }

  async getUserChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.getUserChats(req.user._id.toString());
      return res.json(chats);
    }
    catch (err) {
      next(err)
    }
  }

  async searchChat(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.searchChat(req.user._id.toString(), req.query, req.originalUrl);
      return res.json(chats);
    }
    catch (err) {
      next(err)
    }
  }

  async createGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {name}: {name: string} = req.body;
      await chatService.createGroupChat(name, req.user._id.toString());
      return res.status(201).end();
    }
    catch (err) {
      next(err)
    }
  }

  async renameGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {groupChatId, newName}: {groupChatId: string, newName: string} = req.body;
      await chatService.renameGroupChat(req.user._id.toString(), groupChatId, newName);
      return res.status(204).end();
    }
    catch (err) {
      next(err)
    }
  }

  async deleteGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {chatId}: {chatId: string} = req.body;
      await chatService.deleteGroupChat(req.user._id.toString(), chatId);
      res.status(204).end();
    }
    catch (err) {
      next(err)
    }
  }

  async joinToGroup(req: Request, res: Response, next: NextFunction) { 
    try {
      const {groupChatId}: {groupChatId: string, userId: string} = req.body;
      await chatService.joinToGroup(groupChatId, req.user._id.toString());
      return res.status(204).end();
    }
    catch (err) {
      next(err)
    }
  }

  async deleteUserFromChat(req: Request, res: Response, next: NextFunction) {
    try {
      const {chatId, userId}: {chatId: string, userId: string} = req.body;
      await chatService.deleteUserFromChat(chatId, userId);
      return res.status(204).end();
    }
    catch (err) {
      next(err)
    }
  }
}

export const chatController = new ChatController();