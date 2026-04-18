import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ContactsArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  id?: string;

  @Field({
    nullable: true,
  })
  contactName?: string;

  @Field({
    nullable: true,
  })
  tel?: string;

  @Field({
    nullable: true,
    description: 'name|team',
  })
  sortBy?: string;
}
