import { Router } from 'express';
import { rolesController } from '../controllers';
import { auth, checkRole } from '../middlewares';

const rolesRouter = Router();

const middlewares = [auth, checkRole('admin')];

rolesRouter.get('', middlewares, rolesController.getRoles);

export default rolesRouter;
