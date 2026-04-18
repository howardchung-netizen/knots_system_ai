import {Resolver, FieldResolver, Root, Ctx, Authorized, Mutation, Arg} from 'type-graphql';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {ClaimFormFileDeleteInput} from './input/claimFormFileDelete.input';
import {ClaimFormFileDeletePayload} from './payload/claimFormFileDelete.payload';
import {ClaimFormFileService} from './claimFormFile.service';
import { getUrl } from '../../lib/utils';
import { ClaimFormFile } from './claimFormFile.entity';

@Resolver(type => ClaimFormFile)
export class ClaimFormFileResolver extends ResourceResolver(ClaimFormFile) {
  constructor(
    private readonly claimFormFileService: ClaimFormFileService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: ClaimFormFile,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'claimFormFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @Authorized()
  @Mutation(
    type => ClaimFormFileDeletePayload,
    {
      name: 'claimFormFileDelete',
      nullable: true,
    }
  )
  async detele(
    @Ctx() {user, enforcer}: ResolverContext,
    @Arg('data') data: ClaimFormFileDeleteInput,
  ): Promise<ClaimFormFileDeletePayload> {
    return this.claimFormFileService.delete(user, data);
  }

}
