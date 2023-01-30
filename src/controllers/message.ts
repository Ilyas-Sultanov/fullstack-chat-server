import { Request, Response, NextFunction } from "express";
import ApiError from "../exceptions/ApiError";
import { messageService } from '../services/message';
import { IMessageQuery } from "../types/message";

class Message {
  async create(req: Request<{}, {}, { chatId: string, content: string }, {}>, res: Response, next: NextFunction) {
    try {
      const { chatId, content } = req.body;
      if (!chatId || !content) throw ApiError.badRequest('ChatId and content is required.');
      const msg = await messageService.create(String(req.user._id), chatId, content);
      res.status(201).json(msg);
    }
    catch (err) {
      next(err)
    }
  }

  async getAll(req: Request<{}, {}, {}, IMessageQuery>, res: Response, next: NextFunction) {
    try {
      const messages = await messageService.getAll(req.query, req.originalUrl); 
      res.json(messages);
    }
    catch (err) {
      next(err)
    }
  }
}

export const messageController = new Message();