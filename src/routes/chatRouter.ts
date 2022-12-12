import { Router } from 'express';
import { auth, checkRole } from '../middlewares';
import { chatController } from '../controllers/chat';
const chatRouter = Router();

const middlewares = [auth];

chatRouter.get('', middlewares, chatController.getAllChats); // Получаем все чаты где есть текущий пользователь
chatRouter.post('', middlewares, chatController.accessChat); // получаем или создаём чат один на один (если чат существует, то возвращаем его, если не, то создаем новый и возвращаем его)
chatRouter.post('/groupCreate', middlewares, chatController.createGroupChat);
chatRouter.patch('/groupRename', middlewares, chatController.renameGroupChat);
chatRouter.put('/groupJoin', middlewares, chatController.joinToGroup);
chatRouter.patch('/groupLeav', middlewares, chatController.leaveGroup);

export default chatRouter;