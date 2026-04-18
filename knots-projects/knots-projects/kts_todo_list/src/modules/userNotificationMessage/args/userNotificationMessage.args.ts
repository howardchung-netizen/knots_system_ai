import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import {UserNotificationMessageTemplateCategory, UserNotificationMessageTemplateLocale} from '../../userNotificationMessageTemplate/userNotificationMessageTemplate.entity';

@ArgsType()
export class UserNotificationMessageArgs extends ConnectionArgs {
  @Field({ nullable: true })
  key?: string;

  @Field(type => UserNotificationMessageTemplateLocale, { nullable: true })
  locale?: UserNotificationMessageTemplateLocale;

  @Field(type => UserNotificationMessageTemplateCategory, { nullable: true })
  category?: UserNotificationMessageTemplateCategory;

  @Field(type => ID, { nullable: true })
  memberId?: string;

  @Field({
    nullable: true,
  })
  countOnly?: boolean;
}
