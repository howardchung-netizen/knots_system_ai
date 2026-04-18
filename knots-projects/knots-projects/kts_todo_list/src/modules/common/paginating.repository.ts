import { FindConditions, Repository } from 'typeorm';
import { ConnectionArgs } from './connectionPaging';
import { connectionFromArraySlice, Edge } from 'graphql-relay';

export class PaginatingRepository<T> extends Repository<T> {
  async findAndPaginate(
    conditions: FindConditions<T> | FindConditions<T>[],
    order: any,
    connArgs: ConnectionArgs,
  ) {
    const { limit, offset } = connArgs.pagingParams();
    const [entities, count] = await this.findAndCount({
      where: conditions,
      order: order,
      skip: offset,
      take: limit,
    });

    return {
      ...connectionFromArraySlice(entities, connArgs, {
        arrayLength: count,
        sliceStart: offset || 0,
      }),
      totalCount: count,
    };
  }
}
