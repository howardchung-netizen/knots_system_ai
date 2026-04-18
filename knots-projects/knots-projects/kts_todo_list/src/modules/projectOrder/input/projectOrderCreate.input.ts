import { GraphQLDate } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';
import { InputType, Field, Int } from 'type-graphql';
import { Upload } from '../../file/interface/upload.interface';

@InputType()
export class ProjectOrderCreateInput {
  @Field(type => Int)
  projectId: number;

  @Field()
  supplier: string;

  @Field()
  amount: number;

  @Field({ nullable: true })
  desc?: string;

  @Field(type => GraphQLDate, { nullable: true })
  orderedDate?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  deliveryDate?: Date;

  @Field()
  delivery: boolean;

  @Field()
  payment: boolean;

  @Field(type => String, {nullable: true})
  cheque?: string;

  @Field({ nullable: true })
  cash?: boolean;

  @Field({ nullable: true })
  remark?: string;

  @Field(type => GraphQLUpload, { nullable: true })
  uploadFiles?: [Upload];

  @Field(type => [String], {nullable: true})
  deleteFile?: string[];

}
