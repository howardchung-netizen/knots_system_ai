import {registerEnumType, ObjectType, Field, ID} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {Node} from '../node/node.interface';
import { UserNotificationMessageTemplate } from '../userNotificationMessageTemplate/userNotificationMessageTemplate.entity';
import { User } from '../user/user.entity';

export enum UserNotificationMessageStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

registerEnumType(UserNotificationMessageStatus, {
  name: 'UserNotificationMessageStatus',
});

@ObjectType()
@Entity()
export class UserNotificationMessage extends BaseEntity implements Node {
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
  @Column({ name: 'user_id'})
  userId: string;

  @Field(type => User)
  @ManyToOne(type => User)
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Index()
  @Column({ type: 'uuid', name: 'user_notification_message_template_id', length: 36, nullable: true })
  userNotificationMessageTemplateId?: string;

  @Field(type => UserNotificationMessageTemplate, { nullable: true })
  @ManyToOne(type => UserNotificationMessageTemplate)
  @JoinColumn({ name: 'user_notification_message_template_id' })
  userNotificationMessageTemplate?: Promise<UserNotificationMessageTemplate>;

  @Field(type => JSONResolver, { nullable: true })
  @Column({ type: 'json', name: 'user_notification_message_template_replacements', nullable: true })
  userNotificationMessageTemplateReplacements?: object;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field()
  @Column('text')
  content: string;

  @Field()
  @Column({name: 'short_content'})
  shortContent: string;

  @Field({nullable: true})
  @Column({nullable: true})
  path?: string;

  @Index()
  @Field(type => UserNotificationMessageStatus)
  @Column({
    type: 'enum',
    enum: UserNotificationMessageStatus,
    default: UserNotificationMessageStatus.QUEUED,
  })
  status: UserNotificationMessageStatus;
}
