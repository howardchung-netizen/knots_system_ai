import { registerEnumType, ObjectType, Field } from 'type-graphql';

export enum MutationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

registerEnumType(MutationType, {
  name: 'MutationType',
});

@ObjectType()
export class SubscriptionPayload {
  @Field(type => MutationType)
  mutation: MutationType;

  @Field(type => [String], { nullable: true })
  updatedFields?: string[];
}
