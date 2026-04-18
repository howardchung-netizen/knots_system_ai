import {Field, InputType, ID} from 'type-graphql';

@InputType()
export class ClientDeleteInput {
    @Field(type=>ID)
    id: string;
}