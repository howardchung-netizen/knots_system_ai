import {registerEnumType, ObjectType, Field, ID} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Unique,
  Index,
} from 'typeorm';
import {Node} from '../node/node.interface';

export enum UserNotificationMessageTemplateLocale {
  ZH_HANT = 'ZH_HANT',
  ZH_HANS = 'ZH_HANS',
  EN = 'EN',
}

registerEnumType(UserNotificationMessageTemplateLocale, {
  name: 'UserNotificationMessageTemplateLocale',
});

export enum UserNotificationMessageTemplateCategory {
  GENERIC = 'GENERIC',
}

registerEnumType(UserNotificationMessageTemplateCategory, {
  name: 'UserNotificationMessageTemplateCategory',
});

export enum UserNotificationMessageTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(UserNotificationMessageTemplateStatus, {
  name: 'UserNotificationMessageTemplateStatus',
});

@ObjectType()
@Entity()
@Unique(['key', 'locale'])
export class UserNotificationMessageTemplate extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @Field()
  @Column()
  key: string;

  @Index()
  @Field(type => UserNotificationMessageTemplateLocale)
  @Column({
    type: 'enum',
    enum: UserNotificationMessageTemplateLocale,
    default: UserNotificationMessageTemplateLocale.ZH_HANT,
  })
  locale: UserNotificationMessageTemplateLocale;

  @Index()
  @Field(type => UserNotificationMessageTemplateCategory)
  @Column({
    type: 'enum',
    enum: UserNotificationMessageTemplateCategory,
    default: UserNotificationMessageTemplateCategory.GENERIC,
  })
  category: UserNotificationMessageTemplateCategory;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field()
  @Column('text')
  content: string;

  @Field()
  @Column({name: 'short_content'})
  shortContent: string;

  @Field(type => JSONResolver, { nullable: true })
  @Column({ type: 'json', nullable: true })
  extra?: any;

  @Index()
  @Field(type => UserNotificationMessageTemplateStatus)
  @Column({
    type: 'enum',
    enum: UserNotificationMessageTemplateStatus,
    default: UserNotificationMessageTemplateStatus.ACTIVE,
  })
  status: UserNotificationMessageTemplateStatus;
}
