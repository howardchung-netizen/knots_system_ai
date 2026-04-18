import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, UpdateDateColumn } from 'typeorm';
import { Node } from '../node/node.interface';

@ObjectType({ implements: Node })
@Entity()
export class BookKeepingCompany extends BaseEntity implements Node {
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
  @Column({ name: 'company_name' })
  companyName: string;

  @Index()
  @Field({ nullable: true })
  @Column({ name: 'business_registration_no', nullable: true })
  businessRegistrationNo?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address: string;

  @Index()
  @Column({ nullable: true })
  @Field({ nullable: true })
  phone: string;

  @Index()
  @Field(type => Boolean)
  @Column({ default: false })
  deleted: boolean;
}
