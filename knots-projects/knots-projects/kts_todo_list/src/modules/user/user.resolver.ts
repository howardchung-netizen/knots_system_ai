import {Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root,} from 'type-graphql';
import {TOKEN_COOKIE_MAX_AGE, TOKEN_COOKIE_NAME, TOKEN_COOKIE_OPTIONS, webUrl} from '../../lib/config';
import {createToken} from '../../lib/jwt';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {UsersArgs} from './args/users.args';
import {UsersConnection} from './connection/users.connection';
import {LoginInput} from './input/login.input';
import {LoginPayload} from './payload/login.payload';
import {User} from './user.entity';
import {UserCreatePayload} from './payload/userCreate.payload';
import {UserUpdatePayload} from './payload/userUpdate.payload';
import {UserService} from './user.service';
import { RoleService } from "../admin/role/role.service";
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { PermissionAction } from "../admin/action/action.type";
import { UserCreateInput } from "./input/userCreate.input";
import { UserUpdateInput } from "./input/userUpdate.input";
import { UserDisconnectGoogleInput } from './input/userDisconnectGoogle.input';
import { UserConnectGoogleInput } from './input/userConnectGoogle.input';

export const RESOURCE_USER = User.name;

export function isDisabled(user: User): Boolean {
  return user.deleted;
}

@Resolver(() => User)
export class UserResolver extends ResourceResolver(User) {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {
    super();
  }

  @Authorized()
  @Query(type => UsersConnection, { nullable: true, name: 'users' })
  async getMany(@Args() args: UsersArgs): Promise<UsersConnection> {
    return this.userService.getManyInConnection(args);
  }

  @Mutation(() => LoginPayload)
  async login(
    @Arg('data') data: LoginInput,
    @Ctx() {req, res}: ResolverContext,
  ): Promise<{ user: User; token: string, exp: number }> {
    const user = await this.userService.login(data);
    const origin = req.get('origin');
    const token = await createToken({ loginUserType: User.name, id: user!.id }, { expiresIn: `${TOKEN_COOKIE_MAX_AGE}ms` });
    if (origin && webUrl.includes(origin)) {
      res.cookie(TOKEN_COOKIE_NAME, token, {
        ...TOKEN_COOKIE_OPTIONS,
        sameSite: (req.get('host')?.startsWith('localhost') ? 'lax' as const : 'none' as const),
        secure: req.protocol === 'https',
      });
    }
    return { user: user!, token, exp: Date.now()+TOKEN_COOKIE_MAX_AGE };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: ResolverContext,
  ): Boolean {
    res.clearCookie(TOKEN_COOKIE_NAME, {
      ...TOKEN_COOKIE_OPTIONS,
      sameSite: (req.get('host')?.startsWith('localhost') ? 'lax' as const : 'none' as const),
      secure: req.protocol === 'https',
    });

    return true;
  }

  @FieldResolver()
  async explicitRoles(@Root() root: User, @Ctx() {enforcer}: ResolverContext) {
    return this.roleService.getRoles(root.id, enforcer, false);
  }

  @FieldResolver()
  async roles(@Root() root: User, @Ctx() {enforcer}: ResolverContext) {
    return this.roleService.getRoles(root.id, enforcer);
  }

  @FieldResolver()
  async lastChequeBook(
    @Root() root: User,
    @Ctx() {
      chequeBookByNoLoader,
    }: ResolverContext,
  ) {
    return root.lastChequeNoForPettyCash ? chequeBookByNoLoader.load(root.lastChequeNoForPettyCash) : null;
  }

  @FieldResolver()
  async pettyCashAccount(
    @Root() root: User,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.pettyCashAccountId ? bookKeepingAccountLoader.load(root.pettyCashAccountId) : null;
  }

  @Authorized(`${RESOURCE_USER}:${PermissionAction.UPDATE}`)
  @Mutation(() => UserUpdatePayload, {nullable: true, name: 'userUpdate'})
  async update(
    @Arg('data') data: UserUpdateInput,
    @Ctx() {enforcer, serviceAccount}: ResolverContext,
    @CurrentUser() currentUser: LoggedInUser,
  ) {
    return this.userService.update(enforcer, currentUser, data, serviceAccount);
  }

  @Authorized(`${RESOURCE_USER}:${PermissionAction.CREATE}`)
  @Mutation(type => UserCreatePayload, {nullable: true, name: 'userCreate'})
  async create(
    @Arg('data') data: UserCreateInput,
    @Ctx() {enforcer}: ResolverContext,
    @CurrentUser() currentUser: LoggedInUser,
  ) {
    return this.userService.create(enforcer, currentUser, data);
  }

  @Mutation(() => LoginPayload)
  async internalLogin(
    @Arg('data') data: LoginInput,
    @Ctx() {req, res, enforcer, serviceAccount}: ResolverContext,
  ): Promise<{ user: User; token: string, exp: number }> {
    const user = await this.userService.loginInternal(data, enforcer, serviceAccount);
    const origin = req.get('origin');
    const token = await createToken({ loginUserType: User.name, id: user!.id }, { expiresIn: `${TOKEN_COOKIE_MAX_AGE}ms` });
    if (origin && webUrl.includes(origin)) {
      res.cookie(TOKEN_COOKIE_NAME, token, {
        ...TOKEN_COOKIE_OPTIONS,
        sameSite: (req.get('host')?.startsWith('localhost') ? 'lax' as const : 'none' as const),
        secure: req.protocol === 'https',
      });
    }
    return { user: user!, token, exp: Date.now()+TOKEN_COOKIE_MAX_AGE };
  }

  @Authorized(`${RESOURCE_USER}:${PermissionAction.UPDATE}`)
  @Mutation(() => UserUpdatePayload, {nullable: true, name: 'connectGoogle'})
  async connectGoogle(
    @Arg('data') data: UserConnectGoogleInput,
    @Ctx() {enforcer}: ResolverContext,
    @CurrentUser() currentUser: LoggedInUser,
  ) {
    return this.userService.connectGoogle(enforcer, currentUser, data);
  }

  @Authorized(`${RESOURCE_USER}:${PermissionAction.UPDATE}`)
  @Mutation(() => UserUpdatePayload, {nullable: true, name: 'disconnectGoogle'})
  async disconnectGoogle(
    @Arg('data') data: UserDisconnectGoogleInput,
    @Ctx() {enforcer}: ResolverContext,
    @CurrentUser() currentUser: LoggedInUser,
  ) {
    return this.userService.disconnectGoogle(enforcer, currentUser, data);
  }

}
