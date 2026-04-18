import { createUnionType } from 'type-graphql';
import { User } from '../user.entity';

export const UserUnion = createUnionType({
  name: 'LoggedInUser',
  types: () => [User],
});
