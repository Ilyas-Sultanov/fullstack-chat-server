import { Request, Response, NextFunction } from "express";
import ApiError from "../exceptions/ApiError";
import { messageService } from '../services/message';

class Message {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId, content }: { chatId: string, content: string } = req.body;
      if (!chatId || !content) throw ApiError.badRequest('ChatId and content is required.');
      await messageService.create(String(req.user._id), chatId, content);
      res.status(201).end();
    }
    catch (err) {
      next(err)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      if (!chatId) throw ApiError.badRequest('ChatId is required.');
      const messages = await messageService.getAll(chatId); 
      res.json(messages);
    }
    catch (err) {
      next(err)
    }
  }
}

export const messageController = new Message();