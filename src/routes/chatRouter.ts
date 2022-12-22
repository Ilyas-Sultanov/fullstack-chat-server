import { Router } from 'express';
import { auth, checkRole } from '../middlewares';
import { chatController } from '../controllers/chat';
const chatRouter = Router();

const middlewares = [auth];

chatRouter.get('', middlewares, chatController.getUserChats); // Получаем все чаты где есть текущий пользователь
chatRouter.get('/search', middlewares, chatController.searchChat);
chatRouter.post('', middlewares, chatController.accessChat); // получаем или создаём чат один на один (если чат существует, то возвращаем его, если не, то создаем новый и возвращаем его)
chatRouter.post('/groupCreate', middlewares, chatController.createGroupChat);
chatRouter.patch('/groupRename', middlewares, chatController.renameGroupChat);
chatRouter.delete('/groupDelete', middlewares, chatController.deleteGroupChat);
chatRouter.put('/groupJoin', middlewares, chatController.joinToGroup); // Вступаем в группу
chatRouter.patch('/deleteUserFromChat', middlewares, chatController.deleteUserFromChat); // если один пользователь покидает чат или админ чата удаляет одного пользователя

export default chatRouter;