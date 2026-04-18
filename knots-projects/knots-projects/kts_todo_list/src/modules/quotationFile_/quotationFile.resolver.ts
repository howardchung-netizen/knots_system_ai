import {Resolver, FieldResolver, Root, Ctx, Authorized, Mutation, Arg} from 'type-graphql';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {QuotationFileDeleteInput} from './input/quotationFileDelete.input';
import {QuotationFileDeletePayload} from './payload/quotationFileDelete.payload';
import { getUrl } from '../../lib/utils';
import { QuotationFileService } from './quotationFile.service';
import { QuotationFile } from './quotationFile.entity';

@Resolver(type => QuotationFile)
export class QuotationFileResolver extends ResourceResolver(QuotationFile) {
  constructor(
    private readonly quotationFileService: QuotationFileService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: QuotationFile,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'quotationFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @Authorized()
  @Mutation(
    type => QuotationFileDeletePayload,
    {
      name: 'quotationFileDelete',
      nullable: true,
    }
  )
  async detele(
    @Ctx() {user, enforcer}: ResolverContext,
    @Arg('data') data: QuotationFileDeleteInput,
  ): Promise<QuotationFileDeletePayload> {
    return this.quotationFileService.delete(user, data);
  }

}
