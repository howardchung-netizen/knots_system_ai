import { ArgsType, Field } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';

@ArgsType()
export class AppSettingsArgs extends ConnectionArgs {
  @Field({
    nullable: true,
    description: `
Supported filter parameters:
key
public

e.g. key:redirectAppVersion public:false
  `,
  })
  query: string;
}
