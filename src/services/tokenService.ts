import jwt from 'jsonwebtoken';
import ApiError from '../exceptions/ApiError';
import { UserModel, TokenModel } from '../models';
import { IUserDto } from '../types';

class TokenService {
  generateTokens(payload: IUserDto) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: '30min' }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' }
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const tokenData = await TokenModel.findOne({ userId: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await TokenModel.create({
      userId: userId,
      refreshToken: refreshToken,
    });
    return token;
  }

  async removeRefreshToken(refreshToken: string) {
    const result = await TokenModel.deleteOne({ refreshToken: refreshToken });
    if (result.deletedCount !== 1) {
      throw ApiError.internal('Ошибка при удалении токена из базы');
    }
    return result;
  }

  async findRefreshToken(refreshToken: string) {
    const tokenData = await TokenModel.findOne({
      refreshToken: refreshToken,
    }).lean();
    return tokenData;
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      );
      return userData;
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string
      );
      return userData;
    } catch (err) {
      return null;
    }
  }

  async refreshTokens(refreshToken: string) {
    const userData = this.validateRefreshToken(refreshToken);
    const tokenFromDB = await this.findRefreshToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.unauthorizedError('Пользователь не авторизован');
    }

    const user = await UserModel.findOne(
      { _id: (userData as IUserDto)._id },
      '_id name email roles isActivated',
      { lean: true }
    );

    if (user) {
      const tokens = this.generateTokens(user);
      await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);
      return { ...tokens, user };
    }
  }
}

export const tokenService = new TokenService();
