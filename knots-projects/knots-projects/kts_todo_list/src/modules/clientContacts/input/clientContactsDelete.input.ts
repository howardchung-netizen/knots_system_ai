import {Field, InputType, ID} from 'type-graphql';

@InputType()
export class ClientContactsDeleteInput {
    @Field(type=>ID)
    id: string;
}
