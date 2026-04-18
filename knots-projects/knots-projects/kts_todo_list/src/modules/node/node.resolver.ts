import { Resolver, Query, Arg, Args, Ctx } from 'type-graphql';
import { Node } from './node.interface';
import { fromGlobalId } from 'graphql-relay';
import { getRepository } from 'typeorm';
import { Container } from 'typedi';
import { NodesInput } from './input/nodes.input';
import { NodeInput } from './input/node.input';
import { ResolverContext } from '../../lib/types';
@Resolver()
export class NodeResolver {
  @Query(type => Node, { nullable: true })
  async node(
    @Args() { id: gid }: NodeInput,
    @Ctx() {}: ResolverContext,
  ) {
    const { id, type } = fromGlobalId(gid);

    switch (type) {
      default:
        return getRepository(type).findOne(id);
    }
  }

  @Query(type => [Node], { nullable: true })
  async nodes(@Args() { ids }: NodesInput, @Ctx() ctx: ResolverContext) {
    return Promise.all(ids.map(id => this.node({ id }, ctx)));
  }
}
