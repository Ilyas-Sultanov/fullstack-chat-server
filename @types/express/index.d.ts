import { IUserDto } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user: IUserDto;
    }
  }
}
