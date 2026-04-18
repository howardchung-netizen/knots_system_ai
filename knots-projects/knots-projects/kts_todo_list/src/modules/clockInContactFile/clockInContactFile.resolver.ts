import {Resolver, FieldResolver, Root, Ctx, Authorized, Mutation, Arg} from 'type-graphql';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {ClockInContactFileDeleteInput} from './input/clockInContactFileDelete.input';
import {ClockInContactFileDeletePayload} from './payload/clockInContactFileDelete.payload';
import {ClockInContactFileService} from './clockInContactFile.service';
import { getUrl } from '../../lib/utils';
import { ClockInContactFile } from './clockInContactFile.entity';

@Resolver(type => ClockInContactFile)
export class ClockInContactFileResolver extends ResourceResolver(ClockInContactFile) {
  constructor(
    private readonly clockInContactFileService: ClockInContactFileService,
  ) {
    super();
  }

  @FieldResolver()
  clockInContactFileUrl(
    @Root() root: ClockInContactFile,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.clockInContactFilePath) return null;
    let folder = 'clockInContactFile';
    return getUrl(req, root.clockInContactFilePath, folder, root.id, root.updatedAt);
  }

  @Authorized()
  @Mutation(
    type => ClockInContactFileDeletePayload,
    {
      name: 'clockInContactFileDelete',
      nullable: true,
    }
  )
  async detele(
    @Ctx() {user, enforcer}: ResolverContext,
    @Arg('data') data: ClockInContactFileDeleteInput,
  ): Promise<ClockInContactFileDeletePayload> {
    return this.clockInContactFileService.delete(user, data);
  }

}
