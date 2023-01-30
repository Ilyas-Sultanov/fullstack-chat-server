import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { multerWithOptions, errorHandler } from './middlewares';
import mongoose from 'mongoose';
import router from './routes';
import { Server } from 'socket.io';
import { IChat, IMessage } from './types';

const app = express();
app.disable('x-powered-by');
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));
app.use(multerWithOptions);
app.use('/api', router);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    /* Подключение к базе */
    mongoose.set('strictQuery', false); // чтобы не было warning 
    await mongoose.connect(process.env.MONGO_URL! /* options */);
    console.log('DB connected');

    /* Запуск сервера */
    const server = http.createServer(app).listen(PORT, function () {
      console.log(`Server started on port ${PORT}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        credentials: true,
        origin: process.env.CLIENT_URL,
      }
    });

    io.on('connection', (socket) => {
      socket.on('setup', (userId: string) => {
        socket.join(userId); // Создаётся комната по _id пользователя (метод join сздает комнату если её нет, или подключается если она есть)
        socket.emit('connected');
      });

      socket.on('connect to chat', (chatId: string) => {
        socket.join(chatId); // Пользователь подключается к комнате чата (по _id чата)
      });

      // На данный момент пользователь подключен к двум комнатам - своейи комнате и комнате конкретного чата (точнее сокет подключен к двум комнатам)
      
      socket.on('new message', ({chat, msg}: {chat: IChat, msg: IMessage}) => { // 
        for (let i = 0; i < chat.users.length; i++) {
          const user = chat.users[i];
          if (user && user._id !== msg.sender) { // Не отправлять сообщение отправителю ( как метод socket.broadcast )
            socket.in(String(user._id)).emit('message recieved', msg);  // Рассылка сообщения из комнаты пользователя (по _id), всем другим пользователям, которые подключены к тем же комнатам что и отправитель.
          }
        }
      });

      socket.on("typing", (chatId: string) => socket.in(chatId).emit("typing"));
      socket.on("stop typing", (chatId: string) => socket.in(chatId).emit("stop typing"));

      socket.off("setup", (userId: string) => {
        console.log("USER DISCONNECTED");
        socket.leave(userId);
      });
    })
  } catch ({ name, message }) {
    console.error(`${name}: ${message}`);
    process.exit(1);
  }
}    

start();