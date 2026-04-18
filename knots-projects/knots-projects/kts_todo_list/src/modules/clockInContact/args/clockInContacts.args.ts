import {ArgsType, Field, ID, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ClockInContactsArgs extends ConnectionArgs {

  @Field(type=> String, {nullable: true})
  id?: string;

  @Field(type=> String, {nullable: true})
  tel?: string;

  @Field(type=> String, {nullable: true})
  name?: string;

}
