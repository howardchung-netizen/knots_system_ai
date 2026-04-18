import { GraphQLDate } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';
import { InputType, Field, Float, ID } from 'type-graphql';
import { Upload } from '../../file/interface/upload.interface';

@InputType()
export class ClaimFormCreateInput {
  @Field(type => ID)
  staffId: string;

  @Field(type => String, { nullable: true })
  vendor?: string;

  @Field(type => GraphQLDate)
  purchasedDate: Date;

  @Field(type => Float)
  amount: number;

  @Field({ nullable: true })
  chequeNo?: string;

  @Field(type => ID, { nullable: true })
  categoryAccountId?: string;

  @Field(type => GraphQLUpload, { nullable: true })
  uploadFiles?: [Upload];

  @Field(type => [String], {nullable: true})
  deleteFile?: string[];

  @Field(type => ID, { nullable: true })
  projectId?: string;
}
