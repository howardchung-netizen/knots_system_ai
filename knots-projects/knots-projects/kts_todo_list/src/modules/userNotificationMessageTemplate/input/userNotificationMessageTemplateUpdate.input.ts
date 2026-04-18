import {InputType, Field, ID} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';
import {UserNotificationMessageTemplate, UserNotificationMessageTemplateCategory, UserNotificationMessageTemplateLocale, UserNotificationMessageTemplateStatus} from '../userNotificationMessageTemplate.entity';

@InputType()
export class UserNotificationMessageTemplateUpdateInput implements Partial<UserNotificationMessageTemplate> {
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  key?: string;

  @Field(type => UserNotificationMessageTemplateLocale, { nullable: true })
  locale?: UserNotificationMessageTemplateLocale;

  @Field(type => UserNotificationMessageTemplateCategory, { nullable: true })
  category?: UserNotificationMessageTemplateCategory;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  shortContent?: string;

  @Field(type => JSONResolver, { nullable: true })
  extra?: object | null;

  @Field(type => UserNotificationMessageTemplateStatus, { nullable: true })
  status?: UserNotificationMessageTemplateStatus;
}
