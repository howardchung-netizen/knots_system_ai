import {GraphQLResolveInfo} from "graphql";
import {fromGlobalId} from "graphql-relay";
import moment from "moment-timezone";
import searchQuery, {SearchParserResult} from "search-query-parser";
import {Arg, Args, Authorized, Ctx, FieldResolver, Info, Mutation, Query, Resolver, Root,} from 'type-graphql';
import {In} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {TOKEN_COOKIE_MAX_AGE, TOKEN_COOKIE_NAME, TOKEN_COOKIE_OPTIONS, webUrl} from '../../lib/config';
import {createToken} from '../../lib/jwt';
import {ResolverContext} from '../../lib/types';
import { PermissionAction } from "../admin/action/action.type";
import {ResourceResolver} from '../node/resource.resolver';
import {ContactsArgs} from './args/contacts.args';
import {ContactsConnection} from './connection/contacts.connection';
import {Contact} from './contact.entity';

import {ContactService} from './contact.service';
import { ContactInput } from "./input/contact.input";
import { ContactPayload } from "./payload/contact.payload";

export const RESOURCE_CONTACT = Contact.name;


@Resolver(() => Contact)
export class ContactResolver extends ResourceResolver(Contact) {
  constructor(
    private readonly contactService: ContactService,
  ) {
    super();
  }

  @FieldResolver()
  async contactFiles(
    @Root() root: Contact,
    @Ctx() {
      contactFileByIdLoader,
    }: ResolverContext,
  ) {
    return contactFileByIdLoader.load(root.tel);
  }

  @Authorized(`${RESOURCE_CONTACT}:${PermissionAction.GET}`)
  @Query(type => ContactsConnection, { nullable: true, name: 'contacts' })
  async getMany(@Args() args: ContactsArgs): Promise<ContactsConnection> {
    return this.contactService.getManyInConnection(args);
  }
  
  @Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => ContactPayload,
    {
      name: 'contactCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: ContactInput,
  ): Promise<ContactPayload> {
    return this.contactService.save(data);
  }

  @Authorized(`${RESOURCE_CONTACT}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => ContactPayload,
    {
      name: 'contactUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: ContactInput,
  ): Promise<ContactPayload> {
    return this.contactService.save(data);
  }
}
