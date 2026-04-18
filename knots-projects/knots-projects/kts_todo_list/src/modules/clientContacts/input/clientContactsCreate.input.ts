import { GraphQLUpload, Upload } from 'graphql-upload';
import {Field, InputType} from 'type-graphql';

@InputType()
export class ClientContactsCreateInput {
    @Field({ nullable: true })
    nameEn?: string;

    @Field({ nullable: true })
    nameCht?: string;

    @Field({ nullable: true })
    appellation?: number;
    
    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    telCode?: string;

    @Field({ nullable: true })
    tel?: string;

    @Field({ nullable: true })
    whatsappCode?: string;

    @Field({ nullable: true })
    whatsapp?: string;

    @Field({ nullable: true })
    wechatCode?: string;

    @Field({ nullable: true })
    wechat?: string;

    @Field(type => GraphQLUpload, { nullable: true })
    files?: [Upload];

}
