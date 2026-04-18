import { GraphQLDate } from 'graphql-iso-date';
import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ClockInsArgs extends ConnectionArgs {

  @Field(type=> String, {nullable: true})
  id?: string;

  @Field(type=> String, {nullable: true})
  projectId?: string;

  @Field(type=> GraphQLDate, {nullable: true})
  startDate?: Date;

  @Field(type=> GraphQLDate, {nullable: true})
  endDate?: Date;

  @Field(type=> Boolean, {nullable: true})
  isEffective?: Boolean;

  @Field(type=> Boolean, {nullable: true})
  isDuplicated?: Boolean;

  @Field(type=> String, {nullable: true})
  tel?: string;

  @Field(type=> String, {nullable: true})
  order?: 'ASC' | 'DESC' | null;

  @Field(type=> String, {nullable: true})
  sort?: string
}
