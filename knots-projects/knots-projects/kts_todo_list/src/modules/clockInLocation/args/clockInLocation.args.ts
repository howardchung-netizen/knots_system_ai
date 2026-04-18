import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ClockInLocationsArgs extends ConnectionArgs {

  @Field(type=> String, {nullable: true})
  id?: string;

  @Field(type=> String, {nullable: true})
  staffId?: string;

  @Field(type=> String, {nullable: true})
  projectId?: string;

  @Field(type=> String, {nullable: true})
  nonce?: string;

}
