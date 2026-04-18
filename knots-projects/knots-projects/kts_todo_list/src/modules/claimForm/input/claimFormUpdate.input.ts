import { InputType, Field, ID, Float } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';
import { Upload } from '../../file/interface/upload.interface';
import { GraphQLUpload } from 'graphql-upload';

@InputType()
export class ClaimFormUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => ID, { nullable: true })
  staffId?: string;

  @Field(type => String, { nullable: true })
  vendor?: string;

  @Field(type => GraphQLDate, { nullable: true })
  purchasedDate?: Date;

  @Field(type => Float, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  chequeNo?: string;

  @Field(type => ID, { nullable: true })
  categoryAccountId?: string;

  @Field(type => GraphQLUpload,
    {nullable: true})
  file?: Upload;

  @Field(type => GraphQLUpload, { nullable: true })
  uploadFiles?: [Upload];

  @Field(type => [String], {nullable: true})
  deleteFiles?: string[];

  @Field(type => ID, { nullable: true })
  projectId?: string;
}

