
import { registerEnumType, Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Entity,
  Index,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export enum CronStatus {
  NA = 'NA',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  IGNORED = 'IGNORED',
}

registerEnumType(CronStatus, {
  name: 'CronStatus',
});

@ObjectType()
@Entity()
export class Cron extends BaseEntity {
  @Field()
  @PrimaryColumn()
  entity: string;

  @Index()
  @Field()
  @CreateDateColumn({ name: 'created_at', precision: 6 })
  createdAt: Date;

  @Index()
  @Field()
  @UpdateDateColumn({ name: 'updated_at', precision: 6 })
  updatedAt: Date;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'last_sync_at', precision: 6, nullable: true })
  lastSyncAt?: Date;

  @Index()
  @Field(type => CronStatus)
  @Column({ type: 'enum', enum: CronStatus, default: CronStatus.NA })
  status: CronStatus;
}
