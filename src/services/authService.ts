import bcrypt from 'bcryptjs'; // в ubuntu обычный bcrypt не работает без бубна
import { v4 } from 'uuid';
import ApiError from '../exceptions/ApiError';
import { UserModel, RoleModel, LinkModel } from '../models';
import { IUserDto } from '../types';
import { tokenService, linkService, mailService } from './';

class AuthService {
  async registration(name: string, email: string, password: string) {
    const user = await UserModel.findOne({ email: email }).lean();
    if (user) {
      throw ApiError.badRequest(
        'Пользователь с таким email уже зарегистрирован'
      );
    }

    const hashPassword = bcrypt.hashSync(password, 7);
    const userRole = await RoleModel.findOne({ value: 'user' }, '', {
      lean: true,
    });
    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
      roles: [userRole!.value],
    });

    await newUser.save();

    const link = v4(); // рандомный id для ссылки активации
    await linkService.createLink(newUser._id, link); // создаём ссылку активации

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/auth/activate/${link}`
    ); // отправка письма на email

    const userDto: IUserDto = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
      isActivated: newUser.isActivated,
    };
    
    const tokens = tokenService.generateTokens(userDto);
    await tokenService.saveRefreshToken(userDto._id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async activateAccount(activationLink: string) {
    const link = await LinkModel.findOne({ value: activationLink });
    if (!link)
      throw ApiError.forbidden('Неверная ссылка, или её срок жизни истёк');
    const user = await UserModel.findOne({ _id: link.userId });
    if (user) {
      user.isActivated = true;
      await user.save();
      await linkService.deleteLink(link.value);
    }
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne(
      { email: email },
      '_id name email roles isActivated',
      { lean: true }
    );

    if (!user) {
      throw ApiError.badRequest('Пользователь с таким email не найден');
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Не верный пароль');
    }

    const tokens = tokenService.generateTokens({ ...user });
    await tokenService.saveRefreshToken(user._id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async logout(refreshToken: string) {
    const result = await tokenService.removeRefreshToken(refreshToken);
    return result;
  }

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email: email }).lean();
    if (!user)
      throw ApiError.badRequest('Пользователь с таким email не найден');
    const link = v4();
    await linkService.createLink(link, user._id);
    await mailService.sendResetPassMail(
      email,
      `${process.env.CLIENT_URL}/resetPassword/${link}`
    );
  }

  async resetPassword(resetLink: string, newPassword: string) {
    const link = await LinkModel.findOne({ value: resetLink });
    if (link) {
      const hashPassword = bcrypt.hashSync(newPassword, 7);
      const result = await UserModel.updateOne(
        { _id: link.userId },
        { password: hashPassword }
      );
      await link.delete();
      return result;
    } else {
      throw ApiError.badRequest('Неверная ссылка, или её срок жизни истёк');
    }
  }
}

export const authService = new AuthService();