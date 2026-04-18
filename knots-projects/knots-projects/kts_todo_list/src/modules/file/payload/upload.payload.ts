import {Field, Int, ObjectType} from 'type-graphql';
import {StorageFileType} from "../../../lib/storage";

@ObjectType()
export class UploadPayload {
  @Field()
  path: string;

  @Field()
  mimeType: string;

  @Field(type => StorageFileType)
  type: StorageFileType;

  @Field(type => Int)
  fileSize: number;

  @Field({nullable: true})
  thumbnailPath?: string;

  @Field({ nullable: true })
  filename?: string;
}
