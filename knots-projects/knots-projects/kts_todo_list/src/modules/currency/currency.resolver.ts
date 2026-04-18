import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { Currency } from "./currency.entity";
import { CurrencyService } from './currency.service';
import { CurrencyArgs } from './args/currency.args';
import { CurrencyConnection } from './connection/currency.connection';
import { CurrencyPayload } from './payload/currency.payload';
import { CurrencyUpdateInput } from './input/currencyUpdate.input';
import { CurrencyCreateInput } from './input/currencyCreate.input';

export const RESOURCE_CURRENCY = Currency.name;

@Resolver(() => Currency)
export class CurrencyResolver extends ResourceResolver(Currency) {
  constructor(
    @Inject(type => CurrencyService)
    private readonly currencyService: CurrencyService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_CURRENCY}:${PermissionAction.GET}`)
  @Query(type => CurrencyConnection, { nullable: true, name: 'currencies' })
  async getMany(@Args() args: CurrencyArgs, @Ctx() req: ResolverContext): Promise<CurrencyConnection> {
    return this.currencyService.getMany(args);
  }

  @Authorized([`${RESOURCE_CURRENCY}:${PermissionAction.CREATE}`])
  @Mutation(
    type => CurrencyPayload,
    {
      name: 'currencyCreate'
    }
  )
  async create(
    @Arg('data') data: CurrencyCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<CurrencyPayload> {
    return this.currencyService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CURRENCY}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => CurrencyPayload,
    {
      name: 'currencyUpdate'
    }
  )
  async update(
    @Arg('data') data: CurrencyUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<CurrencyPayload> {
    return this.currencyService.save(data, user, enforcer);
  }

}
