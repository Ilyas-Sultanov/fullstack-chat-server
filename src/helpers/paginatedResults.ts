import { Model, FilterQuery, QueryOptions } from 'mongoose';

export interface IPaginatedResult<T> {
  totalNumberOfMatches: number;
  currentPage: number;
  limit: number;
  link: string;
  data: T[];
}

export async function paginatedResults<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  originalUrl: string,
  projection: string,
  options: QueryOptions,
  page: number | null
) {
  const currentPage = page ? page : 1;

  const results: IPaginatedResult<T> = {
    totalNumberOfMatches: 0,
    currentPage,
    limit: options.limit!,
    link: originalUrl,
    data: [],
  };

  const count = await model.countDocuments(filter);
  results.totalNumberOfMatches = count;

  results.data = await model.find(filter, projection, options);

  return results;
}
