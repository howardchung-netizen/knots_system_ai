import { InputType, Field, ID, Int } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';
import { Upload } from '../../file/interface/upload.interface';

@InputType()
export class ProjectOrderUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => Int, { nullable: true })
  projectId?: number;

  @Field({ nullable: true })
  supplier?: string;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  desc?: string;

  @Field(type => GraphQLDate, { nullable: true })
  orderedDate?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  deliveryDate?: Date;

  @Field({ nullable: true })
  delivery?: boolean;

  @Field({ nullable: true })
  payment?: boolean;

  @Field(type => String, {nullable: true})
  cheque?: string;

  @Field({ nullable: true })
  cash?: boolean;

  @Field({ nullable: true })
  remark?: string;

  @Field(type => GraphQLUpload, { nullable: true })
  uploadFiles?: [Upload];

  @Field(type => [String], {nullable: true})
  deleteFiles?: string[];

}
