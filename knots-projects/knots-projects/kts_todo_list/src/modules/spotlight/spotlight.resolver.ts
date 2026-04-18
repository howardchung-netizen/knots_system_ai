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
import {ResourceResolver} from '../node/resource.resolver';

import {SpotlightService} from './spotlight.service';
import { RoleService } from "../admin/role/role.service";
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { i18n } from "i18next";
import { I18n } from "../shared/middleware/i18next";
import { PermissionAction } from "../admin/action/action.type";
import { Spotlight } from "./spotlight.entity";
import { SpotlightsConnection } from "./connection/spotlights.connection";
import { Inject } from "typedi";


@Resolver(() => Spotlight)
export class SpotlightResolver extends ResourceResolver(Spotlight) {
  constructor(
    @Inject(type => SpotlightService)
    private readonly spotlightService: SpotlightService,
  ) {
    super();
  }

  @Authorized()
  @Query(type => SpotlightsConnection, { nullable: true, name: 'spotlights' })
  async getMany(): Promise<SpotlightsConnection> {
    return this.spotlightService.getMany();
  }
  
}
