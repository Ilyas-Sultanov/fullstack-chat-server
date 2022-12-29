import { UserModel } from '../models';
import { IUser, IUsersQuery } from '../types';
import {
  FilterQuery,
  QuerySelector,
  UpdateQuery,
  QueryOptions,
  Condition,
  mongo,
  Mongoose,
  Model,
  startSession,
} from 'mongoose';
import { paginatedResults, cleanObject } from '../helpers/';
import ApiError from '../exceptions/ApiError';

class UserService {
  async getUsers(query: IUsersQuery, originalUrl: string) {
    /**
     * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     * Исправить!
     * При поиске по query._id, если _id не валидный возникает ошибка, её нужно обработать
     */

    const preFilter: FilterQuery<IUser> = {
      _id: query._id ? query._id : undefined,
      name: query.name
        ? { $regex: new RegExp('^' + query.name + '.*', 'i') }
        : undefined, // Поиск документов, у которых значение поля name начинается как query.name
      email: query.email
        ? { $regex: new RegExp('^' + query.email + '.*', 'i') }
        : undefined,
      // roles: query.roles ? {$all: query.roles } : undefined, // все элементы массива есть     [ранее можно было выбирать несколько ролей]
      roles: query.role ? { $in: query.role } : undefined,
      isActivated:
        query.isActivated === 'true'
          ? true
          : query.isActivated === 'false'
          ? false
          : undefined,
      createdAt:
        query.dateFrom && query.dateTo
          ? { $gte: new Date(query.dateFrom), $lte: new Date(query.dateTo) }
          : query.dateFrom
          ? { $gte: new Date(query.dateFrom) }
          : query.dateTo
          ? { $lte: new Date(query.dateTo) }
          : null,
    };

    // const preFilter: FilterQuery<QuerySelector<Condition<string>>> = {
    // const filter_1: FilterQuery<Condition<string>> = { name: query.name } // filter - это объект, значение ключа которого явл-ся строкой
    // const selector_1: QuerySelector<Condition<string>> = {$elemMatch: {$eq: `${query.role}`} } // selector находится внутри фильтра

    const preOptions: QueryOptions = {
      limit: query.limit ? parseInt(query.limit) : 10,
      skip: query.page
        ? (parseInt(query.page) - 1) *
          (query.limit ? parseInt(query.limit) : 10)
        : undefined,
      sort:
        query.sort && query.order
          ? { [query.sort]: parseInt(query.order) }
          : null,
      lean: true,
    };

    const filter: FilterQuery<IUser> = cleanObject(preFilter);
    const queryProjection = '_id name email avatar roles isActivated createdAt';
    const options: QueryOptions = cleanObject(preOptions);

    const usersData = await paginatedResults<IUser>(
      UserModel,
      filter,
      originalUrl,
      queryProjection,
      options,
      query.page ? parseInt(query.page) : null
    );
    return usersData;
  }

  async getOneUser(_id: string) {
    const result = await UserModel.findOne(
      { _id: _id },
      '_id name email roles isActivated createdAt updatedAt',
      {
        populate: 'shoppingCart, orders',
        lean: true,
      }
    );
    return result;
  }

  async editUser(
    _id: string,
    name: string,
    email: string,
    roles: string[],
    password?: string
  ) {
    const update: UpdateQuery<{
      name: string;
      email: string;
      roles: string[];
      password?: string;
    }> = {
      name: name,
      email: email,
      roles: roles,
    };
    if (password) update.password = password;
    const result = await UserModel.updateOne({ _id: _id }, update);
    if (result.modifiedCount !== 1) {
      throw ApiError.internal('Ошибка во время редактирования пользователя.');
    }
  }

  async deleteOneUser(_id: string) {
    const session = await startSession();
    await session.withTransaction(async function () {
      const result1 = await UserModel.deleteOne({ _id: _id });
      if (result1.deletedCount !== 1) {
        throw ApiError.internal('Пользователь не найден.');
      }
    });
    session.endSession();
  }
}

export const userService = new UserService();