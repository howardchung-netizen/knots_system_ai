import {ObjectType, Field} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {UserNotificationMessageTemplate} from '../userNotificationMessageTemplate.entity';

@ObjectType()
export class UserNotificationMessageTemplateCreatePayload extends MutationPayload {
  @Field(type => UserNotificationMessageTemplate, { nullable: true })
  userNotificationMessageTemplate?: UserNotificationMessageTemplate;
}
