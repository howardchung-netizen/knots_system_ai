import {Resolver, FieldResolver, Root, Ctx, Authorized, Mutation, Arg} from 'type-graphql';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {ProjectOrderFileDeleteInput} from './input/projectOrderFileDelete.input';
import {ProjectOrderFileDeletePayload} from './payload/projectOrderFileDelete.payload';
import {ProjectOrderFileService} from './projectOrderFile.service';
import { getUrl } from '../../lib/utils';
import { ProjectOrderFile } from './projectOrderFile.entity';

@Resolver(type => ProjectOrderFile)
export class ProjectOrderFileResolver extends ResourceResolver(ProjectOrderFile) {
  constructor(
    private readonly projectOrderFileService: ProjectOrderFileService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: ProjectOrderFile,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'projectOrderFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @Authorized()
  @Mutation(
    type => ProjectOrderFileDeletePayload,
    {
      name: 'projectOrderFileDelete',
      nullable: true,
    }
  )
  async detele(
    @Ctx() {user, enforcer}: ResolverContext,
    @Arg('data') data: ProjectOrderFileDeleteInput,
  ): Promise<ProjectOrderFileDeletePayload> {
    return this.projectOrderFileService.delete(user, data);
  }

}
