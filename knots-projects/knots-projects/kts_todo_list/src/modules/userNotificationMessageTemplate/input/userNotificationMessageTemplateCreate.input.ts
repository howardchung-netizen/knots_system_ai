import {InputType, Field} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';
import {UserNotificationMessageTemplate, UserNotificationMessageTemplateCategory, UserNotificationMessageTemplateLocale, UserNotificationMessageTemplateStatus} from '../userNotificationMessageTemplate.entity';

@InputType()
export class UserNotificationMessageTemplateCreateInput implements Partial<UserNotificationMessageTemplate> {
  @Field()
  key: string;

  @Field(type => UserNotificationMessageTemplateLocale)
  locale: UserNotificationMessageTemplateLocale;

  @Field(type => UserNotificationMessageTemplateCategory)
  category: UserNotificationMessageTemplateCategory;

  @Field()
  name: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  content: string;

  @Field()
  shortContent: string;

  @Field(type => JSONResolver, { nullable: true })
  extra?: object | null;

  @Field(type => UserNotificationMessageTemplateStatus, { nullable: true })
  status?: UserNotificationMessageTemplateStatus;
}
