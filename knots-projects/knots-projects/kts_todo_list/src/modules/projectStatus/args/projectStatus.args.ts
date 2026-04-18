import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ProjectStatusArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  code?: string;

  @Field(type => String, {nullable: true})
  nameCht?: string;

  @Field(type => String, {nullable: true})
  nameEn?: string;

  @Field(type => Boolean, {nullable: true})
  show?: boolean;

}
