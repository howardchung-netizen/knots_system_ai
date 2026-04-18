import {GraphQLUpload} from 'graphql-upload';
import {Upload} from '../../file/interface/upload.interface';
import { InputType, Field } from 'type-graphql';
import { Blob } from 'buffer';

@InputType()
export class ClockInContactInput {

  @Field(type => String)
  tel: string;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => String, { nullable: true })
  nameEng?: string;

  @Field(type => String, { nullable: true })
  address?: string;

  @Field(type => String, { nullable: true })
  remark?: string;

  @Field(type => GraphQLUpload, { nullable: true })
  clockInContactFiles?: [Upload];

  @Field(type => [String], {nullable: true})
  deleteFile?: string[];

}