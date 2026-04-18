import { ClassType, ObjectType, Field, Int } from 'type-graphql';
import { Connection, Edge, PageInfo, ConnectionCursor } from 'graphql-relay';

@ObjectType('PageInfo')
class PageInfoClass implements PageInfo {
  @Field(type => String, { nullable: true })
  startCursor?: ConnectionCursor;

  @Field(type => String, { nullable: true })
  endCursor?: ConnectionCursor;

  @Field({ nullable: true })
  hasPreviousPage?: boolean;

  @Field({ nullable: true })
  hasNextPage?: boolean;
}

export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType(`${TItemClass.name}Edge`, { isAbstract: true })
  abstract class EdgeClass implements Edge<TItem> {
    @Field(type => TItemClass)
    node: TItem;

    @Field(type => String)
    cursor: ConnectionCursor;
  }

  @ObjectType({ isAbstract: true })
  abstract class ConnectionClass implements Connection<TItem> {
    @Field(type => EdgeClass)
    edges: Edge<TItem>[];

    @Field(type => PageInfoClass)
    pageInfo: PageInfo;

    @Field(type => Int, { nullable: true })
    totalCount?: number;
  }

  return ConnectionClass;
}
