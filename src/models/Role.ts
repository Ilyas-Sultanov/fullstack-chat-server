import { Schema, model } from 'mongoose';
import { IRole } from '../types';

const RoleSchema = new Schema(
  {
    value: {
      type: String,
      unique: true,
      default: 'user',
    },
  }
  /* options */
);

export const RoleModel = model<IRole>('roles', RoleSchema);
