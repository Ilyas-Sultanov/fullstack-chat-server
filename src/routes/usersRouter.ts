import { Router } from 'express';
import { usersController } from '../controllers';
import { auth, checkRole } from '../middlewares';
const usersRouter = Router();

const middlewares = [auth, checkRole('admin')];

usersRouter.get('', auth, usersController.getUsers);
usersRouter.get('/:_id', middlewares, usersController.getOneUser);
usersRouter.patch('/:_id', middlewares, usersController.editUser);
usersRouter.delete('/:_id', middlewares, usersController.deleteOneUser);

export default usersRouter;
