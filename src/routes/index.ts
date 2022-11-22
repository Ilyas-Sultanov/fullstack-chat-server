import { Router } from 'express';
import authRouter from './authRouter';
import usersRouter from './usersRouter';
import rolesRouter from './rolesRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);

export default router;
