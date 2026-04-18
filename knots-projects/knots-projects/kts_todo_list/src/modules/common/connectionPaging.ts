import { Field, InputType, ArgsType, Int } from 'type-graphql';
import {
  ConnectionArguments,
  ConnectionCursor,
  fromGlobalId,
} from 'graphql-relay';

@ArgsType()
export class ConnectionArgs implements ConnectionArguments {
  @Field(type => Int, { nullable: true, description: 'Paginate after skip' })
  skip?: number;
  @Field(type => String, {
    nullable: true,
    description: 'Paginate before opaque cursor',
  })
  before?: ConnectionCursor;
  @Field(type => String, {
    nullable: true,
    description: 'Paginate after opaque cursor',
  })
  after?: ConnectionCursor;
  @Field(type => Int, { nullable: true, description: 'Paginate first' })
  first?: number;
  @Field(type => Int, { nullable: true, description: 'Paginate last' })
  last?: number;

  pagingParams() {
    return getPagingParameters(this);
  }
}

type PagingMeta =
  | { pagingType: 'forward'; skip?: number; after?: string; first: number }
  | { pagingType: 'backward'; before?: string; last: number }
  | { pagingType: 'none' };

function checkPagingSanity(args: ConnectionArgs): PagingMeta {
  const { skip = 0, first = 0, last = 0, after, before } = args;
  const isForwardPaging = !!first || (!!skip || !!after);
  const isBackwardPaging = !!last || !!before;

  if (isForwardPaging && isBackwardPaging) {
    throw new Error('cursor-based pagination cannot be forwards AND backwards');
  }
  if ((isForwardPaging && before) || (isBackwardPaging && (skip || after))) {
    throw new Error('paging must use either first/skip/after or last/before');
  }
  if ((isForwardPaging && first < 0) || (isBackwardPaging && last < 0)) {
    throw new Error('paging limit must be positive');
  }
  // This is a weird corner case. We'd have to invert the ordering of query to get the last few items then re-invert it when emitting the results.
  // We'll just ignore it for now.
  if (last && !before) {
    throw new Error("when paging backwards, a 'before' argument is required");
  }
  return isForwardPaging
    ? { pagingType: 'forward', skip, after, first }
    : isBackwardPaging
    ? { pagingType: 'backward', before, last }
    : { pagingType: 'none' };
}

const getId = (cursor: ConnectionCursor) =>
  parseInt(fromGlobalId(cursor).id, 10);
const nextId = (cursor: ConnectionCursor) => getId(cursor) + 1;

/**
 * Create a 'paging parameters' object with 'limit' and 'offset' fields based on the incoming
 * cursor-paging arguments.
 *
 * TODO: Handle the case when a user uses 'last' alone.
 */
function getPagingParameters(args: ConnectionArgs) {
  if (!('first' in args) && !('last' in args)) args.first = 100;

  const meta = checkPagingSanity(args);

  switch (meta.pagingType) {
    case 'forward': {
      return {
        limit: meta.first,
        offset: meta.skip ? meta.skip : (meta.after ? nextId(meta.after) : 0),
      };
    }
    case 'backward': {
      const { last, before } = meta;
      let limit = last;
      let offset = getId(before!) - last;

      // Check to see if our before-page is underflowing past the 0th item
      if (offset < 0) {
        // Adjust the limit with the underflow value
        limit = Math.max(last + offset, 0);
        offset = 0;
      }

      return { offset, limit };
    }
    default:
      return { offset: 0, limit: 100 };
  }
}
