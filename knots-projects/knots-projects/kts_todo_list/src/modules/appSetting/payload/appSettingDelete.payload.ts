import { ObjectType, Field, ID } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class AppSettingDeletePayload extends MutationPayload {
  @Field(type => ID, { nullable: true })
  deletedAppSettingId?: string;
}
