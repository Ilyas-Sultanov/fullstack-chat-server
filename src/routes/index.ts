import { Router } from 'express';
import authRouter from './authRouter';
import usersRouter from './usersRouter';
import rolesRouter from './rolesRouter';
import chatRouter from './chatRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/chat', chatRouter);

export default router;
