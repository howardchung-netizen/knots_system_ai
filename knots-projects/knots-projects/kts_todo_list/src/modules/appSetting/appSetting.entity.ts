import { ObjectType, ID, Field } from 'type-graphql';
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Entity,
  Index,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Node } from '../node/node.interface';

@ObjectType({ implements: Node })
@Entity()
export class AppSetting extends BaseEntity implements Node {
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

  @Index({ unique: true })
  @Field()
  @Column()
  @IsNotEmpty()
  key: string;

  @Field()
  @Column({ default: false })
  public: boolean;

  @Field()
  @Column()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  value?: string;
}
