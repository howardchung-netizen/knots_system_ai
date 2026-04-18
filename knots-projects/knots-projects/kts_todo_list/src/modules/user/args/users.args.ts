import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class UsersArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  id?: string;

  @Field({
    nullable: true,
  })
  username?: string;

  @Field({
    nullable: true,
  })
  name?: string;
  
  @Field({
    nullable: true,
  })
  date?: string;

  @Field({
    nullable: true,
    description: 'name|team',
  })
  sortBy?: string;

  @Field({
    nullable: true,
  })
  keyword?: string;
}
