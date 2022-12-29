import { Router } from 'express';
import { auth } from '../middlewares';
import { messageController } from '../controllers/message';

const messageRouter = Router();

messageRouter.post('/', [auth], messageController.create);
messageRouter.get('/:chatId', [auth], messageController.getAll);

export default messageRouter;