import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import {UserNotificationMessageTemplateCategory, UserNotificationMessageTemplateLocale, UserNotificationMessageTemplateStatus} from '../userNotificationMessageTemplate.entity';

@ArgsType()
export class UserNotificationMessageTemplatesArgs extends ConnectionArgs {
  @Field({ nullable: true })
  key?: string;

  @Field(type => UserNotificationMessageTemplateLocale, { nullable: true })
  locale?: UserNotificationMessageTemplateLocale;

  @Field(type => UserNotificationMessageTemplateCategory, { nullable: true })
  category?: UserNotificationMessageTemplateCategory;

  @Field(type => UserNotificationMessageTemplateStatus, { nullable: true })
  status?: UserNotificationMessageTemplateStatus;
}
