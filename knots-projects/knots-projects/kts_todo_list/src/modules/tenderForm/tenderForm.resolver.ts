import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { TenderFormsArgs } from './args/tenderForms.args';
import { TenderFormConnection } from './connection/tenderForm.connection';
import { TenderForm } from './tenderForm.entity';
import { User } from "../user/user.entity";
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { TenderFormDeleteInput } from "./input/tenderFormDelete.input";
import { Client } from "../client/client.entity";
import { TenderFormDeletePayload } from "./payload/tenderFormDelete.payload";
import { TenderFormUpdateInput } from "./input/tenderFormUpdate.input";
import { TenderFormCreateInput } from "./input/tenderFormCreate.input";
import { TenderFormPayload } from './payload/tenderForm.payload';
import { TenderFormService } from './tenderForm.service';
import { TenderFormImportInput } from './input/tenderFormImport.input';
import { TenderFormImportPayload } from './payload/tenderFormImport.payload';

export const RESOURCE_TENDER_FORM = TenderForm.name;

@Resolver(() => TenderForm)
export class TenderFormResolver extends ResourceResolver(TenderForm) {
  constructor(
    @Inject(type => TenderFormService)
    private readonly tenderFormService: TenderFormService,
  ) {
    super();
  }

  @FieldResolver(type => User)
  async personInCharge(
    @Root() root: TenderForm,
    @Ctx(){ userLoader }: ResolverContext,
    ) {
      return root.personInChargeId ? userLoader.load(root.personInChargeId) : null;
  }

  @Authorized(`${RESOURCE_TENDER_FORM}:${PermissionAction.GET}`)
  @Query(type => TenderFormConnection, { nullable: true, name: 'tenderForms' })
  async getMany(
    @Args() args: TenderFormsArgs,
    @Ctx() {req, enforcer}: ResolverContext,
    @CurrentUser() user: LoggedInUser,
    ): Promise<TenderFormConnection> {
    return this.tenderFormService.getManyInConnection(args, user, {}, enforcer);
  }

  @Authorized(`${RESOURCE_TENDER_FORM}:${PermissionAction.CREATE}`)
  @Mutation(
    type => TenderFormPayload,
    {
      name: 'tenderFormCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: TenderFormCreateInput,
    @CurrentUser() user: LoggedInUser,
  ): Promise<TenderFormPayload> {
    return this.tenderFormService.create(data, user);
  }

  @Authorized(`${RESOURCE_TENDER_FORM}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TenderFormPayload,
    {
      name: 'tenderFormUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: TenderFormUpdateInput,
    @CurrentUser() user: LoggedInUser
  ): Promise<TenderFormPayload> {
    return this.tenderFormService.update(data, user);
  }

  @Authorized(`${RESOURCE_TENDER_FORM}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TenderFormImportPayload,
    {
      name: 'tenderFormImport',
      nullable: true,
    }
  )
  async import(
    @Arg('data') data: TenderFormImportInput,
    @CurrentUser() user: LoggedInUser
  ): Promise<TenderFormImportPayload> {
    return this.tenderFormService.import(data, user);
  }

  @Authorized(`${RESOURCE_TENDER_FORM}:${PermissionAction.DELETE}`)
  @Mutation(
    type => TenderFormPayload,
    {
      name: 'tenderFormDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: TenderFormDeleteInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() {enforcer}: ResolverContext,
  ): Promise<TenderFormDeletePayload> {
    return this.tenderFormService.delete(data, user, enforcer);
  }
}
