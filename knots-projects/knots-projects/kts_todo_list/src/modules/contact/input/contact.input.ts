import {Field, InputType, Int, ID} from 'type-graphql';
import { Contact } from '../contact.entity';
import { GraphQLUpload, Upload } from 'graphql-upload';

@InputType()
export class ContactInput implements Partial<Contact> {
    @Field(type=>ID,{nullable: true})
    id?: string | undefined;

    @Field()
    contactName: string;

    @Field()
    tel: string;

    @Field(type=> Int, {nullable: true})
    dailyRemindTime?: number | undefined;

    @Field(type => GraphQLUpload, { nullable: true })
    files?: [Upload];
  
    @Field(type => [String], {nullable: true})
    deleteFile?: string[];
}