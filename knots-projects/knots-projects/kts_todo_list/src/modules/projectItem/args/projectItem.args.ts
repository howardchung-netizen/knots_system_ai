import {ArgsType, Field, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ProjectItemArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  nameEn?: string;

  @Field(type => String, {nullable: true})
  nameCht?: string;

  @Field(type => Int, {nullable: true})
  upper?: number;

  @Field(type => Boolean, {nullable: true})
  show?: boolean;

  @Field(type => Boolean, {nullable: true})
  delete?: boolean;
}
