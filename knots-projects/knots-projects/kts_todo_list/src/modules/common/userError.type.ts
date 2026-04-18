import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class UserError {
  @Field({ description: 'The error message.' })
  message: string;

  @Field(type => [String], {
    description: 'Path to the input field which caused the error.',
  })
  field: string[];
}
