import { IPaginatedQuery } from './paginatedQuery';

export interface IUser {
  _id: string
  name: string
  email: string
  avatar: string
  password: string
  roles: string[]
  isActivated: boolean
}

export interface IUsersQuery extends IPaginatedQuery {
  _id?: string
  name?: string
  email?: string
  role?: string[]
  isActivated?: string
  sort?: string
  order?: string
  dateFrom?: string
  dateTo?: string
}

export interface IUserDto extends Omit<IUser, 'password'> {}
