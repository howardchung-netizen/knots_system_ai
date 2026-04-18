import { Service } from 'typedi';
import { ClassType, Resolver, FieldResolver, Root } from 'type-graphql';
import { Node } from './node.interface';
import { toGlobalId } from 'graphql-relay';

export function ResourceResolver(ResourceCls: ClassType) {
  @Resolver(of => ResourceCls, { isAbstract: true })
  @Service()
  abstract class ResourceResolverClass {
    @FieldResolver()
    id(@Root() root: Node): string {
      return toGlobalId(ResourceCls.name, root.id);
    }
  }

  return ResourceResolverClass;
}
