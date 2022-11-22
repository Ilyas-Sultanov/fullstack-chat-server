import { Schema, model } from 'mongoose';
import { IToken } from '../types';

const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    refreshToken: { type: String, required: true },
    // Здесь можно хранить фингер-принт браузера и ip
  },
  {
    // options
  }
);

export const TokenModel = model<IToken>('tokens', RefreshTokenSchema);
