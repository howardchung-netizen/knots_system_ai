import { Resolver, Mutation, Arg } from 'type-graphql';
import { UploadPayload } from './payload/upload.payload';
import { GraphQLUpload } from 'graphql-upload';
import { Upload } from './interface/upload.interface';
import { uploadToLocal } from '../../lib/storage';

@Resolver()
export class FileResolver {
  @Mutation(type => UploadPayload)
  async upload(
    @Arg('file', () => GraphQLUpload) file: Upload,
    @Arg('folder', { nullable: true }) folder?: string,
  ): Promise<UploadPayload> {
    return uploadToLocal(file, folder);
  }
}
