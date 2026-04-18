import { GraphQLUpload, Upload } from 'graphql-upload';
import {Field, InputType, ID} from 'type-graphql';

@InputType()
export class ClientContactsUpdateInput {
    @Field(type=>ID)
    uuid: string;

    @Field({ nullable: true })
    nameEn?: string;

    @Field({ nullable: true })
    nameCht?: string;

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

    @Field({ nullable: true })
    appellation?: number;

    @Field(type => GraphQLUpload, { nullable: true })
    files?: [Upload];
  
    @Field(type => [String], {nullable: true})
    deleteFile?: string[];
}
