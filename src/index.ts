import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { multerWithOptions, errorHandler } from './middlewares';
import mongoose from 'mongoose';
import router from './routes';

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
    await mongoose.connect(process.env.MONGO_URL! /* options */);
    console.log('DB connected');

    /* Запуск сервера */
    http.createServer(app).listen(PORT, function () {
      console.log(`Server started on port ${PORT}`);
    });
  } catch ({ name, message }) {
    console.error(`${name}: ${message}`);
    process.exit(1);
  }
}

start();