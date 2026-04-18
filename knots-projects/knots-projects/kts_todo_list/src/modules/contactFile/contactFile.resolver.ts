import {Resolver, FieldResolver, Root, Ctx, Authorized, Mutation, Arg} from 'type-graphql';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {ContactFileDeleteInput} from './input/contactFileDelete.input';
import {ContactFileDeletePayload} from './payload/contactFileDelete.payload';
import { getUrl } from '../../lib/utils';
import { ContactFileService } from './contactFile.service';
import { ContactFile } from './contactFile.entity';

@Resolver(type => ContactFile)
export class ContactFileResolver extends ResourceResolver(ContactFile) {
  constructor(
    private readonly contactFileService: ContactFileService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: ContactFile,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'contactFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @Authorized()
  @Mutation(
    type => ContactFileDeletePayload,
    {
      name: 'contactFileDelete',
      nullable: true,
    }
  )
  async detele(
    @Ctx() {user, enforcer}: ResolverContext,
    @Arg('data') data: ContactFileDeleteInput,
  ): Promise<ContactFileDeletePayload> {
    return this.contactFileService.delete(user, data);
  }

}
