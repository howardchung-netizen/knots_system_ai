import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import { Client } from '../client.entity';

@ObjectType()
export class ClientPayload extends MutationPayload {
  @Field(
    type => Client,
    {
      nullable: true,
    },
  )
  client?: Client;
}
