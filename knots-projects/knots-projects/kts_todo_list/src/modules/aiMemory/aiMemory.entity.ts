import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Node } from '../node/node.interface';

@ObjectType({ implements: Node })
@Entity({ name: 'ai_user_memory' })
export class AiMemory extends BaseEntity implements Node {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Field()
  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string; // Maps to staff.uid (which is a string ID returned as global ID, but we store the raw DB id)

  @Field({ nullable: true })
  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
