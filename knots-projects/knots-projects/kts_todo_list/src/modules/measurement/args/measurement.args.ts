import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class MeasurementArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  typeId?: string;

  @Field(type => String, {nullable: true})
  nameCht?: string;

  @Field(type => String, {nullable: true})
  nameEn?: string;

  @Field(type => String, {nullable: true})
  descCht?: string;

  @Field(type => String, {nullable: true})
  descEn?: string;

  @Field(type => Boolean, {nullable: true})
  show?: boolean;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;
}
