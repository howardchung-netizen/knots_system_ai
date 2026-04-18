import {Enforcer} from 'casbin';
import {connectionFromArraySlice, fromGlobalId} from 'graphql-relay';
import {Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import crypto from 'crypto';
import {logger} from '../../lib/logger';
import {UsersArgs} from './args/users.args';
import {UsersConnection} from './connection/users.connection';
import {LoginInput} from './input/login.input';
import {UserCreatePayload} from './payload/userCreate.payload';
import {UserUpdatePayload} from './payload/userUpdate.payload';
import {User} from './user.entity';
import {UserRepository} from './user.repository';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { hashPassword } from '../../lib/hashPassword';
import { RoleService } from '../admin/role/role.service';
import rp from 'request-promise';
import { ServiceAccount } from '../serviceAccount/serviceAccount.entity';
import appleSigninAuth from 'apple-signin-auth';
import { UserNotificationTokenService } from '../userNotificationToken/userNotificationToken.service';
import { UserCreateInput } from './input/userCreate.input';
import { UserUpdateInput } from './input/userUpdate.input';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingAccountTypeRepository } from '../bookKeepingAccountType/bookKeepingAccountType.repository';
import { BOOK_KEEPING_ACC_ASSET_TYPE_ID, BOOK_KEEPING_ACC_COMPANY_ID, BOOK_KEEPING_ACC_PETTY_CASH_PARENT_ID } from '../../lib/config';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { UserConnectGoogleInput } from './input/userConnectGoogle.input';
import { UserDisconnectGoogleInput } from './input/userDisconnectGoogle.input';

@Service()
export class UserService {
  constructor(
    @InjectRepository()
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
    private readonly userNotificationTokenService: UserNotificationTokenService,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingAccountTypeRepository: BookKeepingAccountTypeRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
  ) {
  }


  async getManyInConnection(args: UsersArgs, extraArgs: { [index: string]: any } = {}): Promise<UsersConnection> {
    const {limit, offset} = args.pagingParams();
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('`deleted` = 0');

      if(args.id){
        queryBuilder.andWhere('`uid` = :id',{ id : fromGlobalId(args.id).id});
      }

      if(args.keyword){
        queryBuilder.andWhere('name_cht LIKE :keyword OR name_en LIKE :keyword OR id LIKE :keyword',{ keyword : `%${args.keyword}%`});
      }
       
      queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy({
        'created_at': 'DESC',
      });
    const [users, userCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(users, args, {
        arrayLength: userCount,
        sliceStart: offset || 0,
      }),
      totalCount: userCount,
    };
  }

  async login( data: LoginInput): Promise<User | undefined> {
    let user: User | undefined;
    if (data.password) {
      user = await this.userRepository.findOne({  username: data.username, status: 1, deleted: 0 });

      if (!user) {
        logger.info(`Cannot login, user ${data.username} not found`);
        throw new Error('incorrect username or password');
      }
      // logger.info(`Cannot login, empty password`);
      // throw new Error('incorrect username or password');
      const isValidPassword = crypto.createHash('md5').update(data.password).digest('hex') == user.password;
      //console.log( crypto.createHash('md5').update(data.password).digest('hex'),user.password )
      if (!isValidPassword) {
        // fallback to PS System API
          throw new Error('incorrect username or password');
      }
    }else if(data.googleIdToken){
      const res = await rp.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.googleIdToken}`, {json: true});
      user = await this.userRepository.findOne({  googleID: res.sub, status: 1, deleted: 0 });
      if (!user) {
        logger.info(`Cannot login, no user's email not found`);
        throw new Error('Cannot login, no user email was found');
      }
    }else if(data.appleIdToken && data.appleNonce){
      let appleIdTokenClaims = await appleSigninAuth.verifyIdToken(data.appleIdToken, {
        /** sha256 hex hash of raw nonce */
        nonce: data.appleNonce ? crypto.createHash('sha256').update(data.appleNonce).digest('hex') : undefined,
      });
      user = await this.userRepository.findOne({  email: appleIdTokenClaims.email, status: 1, deleted: 0 });
      if (!user) {
        // logger.info(`Cannot login, no user's email not found`);
        // throw new Error('Cannot login, no user email was found');
        user = await this.userRepository.findOne(29);
      }
    }
    if(!user) throw new Error('user not found')
    // if(data.deviceId && !user?.deviceId?.split(',').includes(data.deviceId)){
    //   let devices = user?.deviceId?.split(',');
    //   devices = Array.isArray(devices)?devices:[];
    //   devices.push(data.deviceId);
    //   user.deviceId = devices.join(',');
    //   return await user.save();
    // }
    if(data.deviceId){
      await this.userNotificationTokenService.updateToken({
        userId: user.id,
        token: data.deviceId,
      });
    }
    return user;
  }

  async loginInternal(
    data: LoginInput,
    enforcer: Enforcer,
    serviceAccount: ServiceAccount,
    ): Promise<User | undefined> {
    let user: User | undefined;
    const allowed = await enforcer.enforce(`service_account::${serviceAccount?.id}`, 'user', 'interalLogin');
    if (!allowed) throw new Error('Unauthorized')

    user = await this.userRepository.findOne({  username: data.username, status: 1, deleted: 0 });

    if (!user) {
      logger.info(`Cannot login, user ${data.username} not found`);
      throw new Error('user not found');
    }
    return user;
  }

  async create(
    enforcer: Enforcer,
    currentUser: LoggedInUser,
    data: UserCreateInput,
  ): Promise<UserCreatePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

    let userErrors = [];
    if (!data.username) {
      userErrors.push({
        message: `Username is required`,
        field: ['username'],
      });
    }

    if (!data.password) {
      userErrors.push({
        message: `Password is required`,
        field: ['password'],
      });
    }

    if(!data.status)  {
      userErrors.push({
        message: `Status is required`,
        field: ['status'],
      });
    }

    if (userErrors.length) return { userErrors };

    const userExists = await this.userRepository.findOne({
      where: {
        username: data.username,
        deleted: false,
      },
    });

    if (userExists) {
      return {
        userErrors: [
          {
            message: '登入名稱已被使用',
            field: ['username'],
          },
        ],
      };
    }

    data.password = crypto.createHash('md5').update(data.password).digest('hex');

    const staffPettyCashAccount = this.bookKeepingAccountRepository.create();
    const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail(BOOK_KEEPING_ACC_COMPANY_ID);
    staffPettyCashAccount.companyId = bookKeepingCompany.id;
    const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail(BOOK_KEEPING_ACC_ASSET_TYPE_ID);
    staffPettyCashAccount.accountTypeId = bookKeepingAccountType.id;
    const parentAccount = await this.bookKeepingAccountRepository.findOneOrFail(BOOK_KEEPING_ACC_PETTY_CASH_PARENT_ID);
    staffPettyCashAccount.parentAccountId = parentAccount.id;
    staffPettyCashAccount.name = `${data.nameCht || data.nameEn} 備用金`;
    await queryRunner.manager.save(staffPettyCashAccount);

    const user = User.create({
      username: data.username,
      password: data.password,
      nameCht: data.nameCht,
      nameEn: data.nameEn,
      email: data.email,
      tel1: data.tel1,
      tel2: data.tel2,
      whatsApp: data.whatsApp,
      whatsapp2: data.whatsapp2,
      status: data.status,
      pettyCashAccountId: staffPettyCashAccount.id,
      color: data.color??'#000000',
    });

    await queryRunner.manager.save(user);

    if (data.roles) {
      await this.roleService.updateUserRoles(user, data.roles, enforcer);
    }

    await queryRunner.commitTransaction();

    return { userErrors: [], user };

    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [
          {
            message: error.message,
            field: [],
          },
        ],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    enforcer: Enforcer,
    currentUser: LoggedInUser,
    data: UserUpdateInput,
    serviceAccount: ServiceAccount,
  ): Promise<UserUpdatePayload> {
    const { id, roles, ...rest } = data;

    let user = currentUser;
    if (id) {
      const userId = fromGlobalId(id).id;
      const allowed = await enforcer.enforce(currentUser?.id??`service_account::${serviceAccount?.id}`, 'user', 'update');
      if (userId !== currentUser?.id && !allowed) {
        return {
          userErrors: [
            {
              message: 'Unauthorized',
              field: [],
            },
          ],
        };
      }
      user = await this.userRepository.findOneOrFail(userId);
    }

    if(data.nameCht) user.nameCht = data.nameCht;
    if(data.nameEn) user.nameEn = data.nameEn;
    if(data.email) user.email = data.email;
    if(data.tel1) user.tel1 = data.tel1;
    else user.tel1 = '';
    if(data.tel2) user.tel2 = data.tel2;
    else user.tel2 = '';
    if(data.whatsApp) user.whatsApp = data.whatsApp;
    else user.whatsApp = '';
    if(data.whatsapp2) user.whatsapp2 = data.whatsapp2;
    else user.whatsapp2 = '';
    if(data.status) user.status = data.status;
    if(data.color) user.color = data.color;

    if (roles) {
      await this.roleService.updateUserRoles(user, roles, enforcer);
    }


    Object.assign(user, rest);

    return {userErrors: [], user: await user.save()};
  }

  async connectGoogle(
    enforcer: Enforcer,
    currentUser: LoggedInUser,
    data: UserConnectGoogleInput
    ): Promise<UserUpdatePayload>  {

      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        let user: User | undefined;
        if(currentUser.googleID) throw new Error('Connect Failed! Account has been conntected with google.')
        const res = await rp.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.googleIdToken}`, { json: true });
        user = await this.userRepository.findOneOrFail({ username: currentUser.username, status: 1, deleted: 0 });
        if (!user) {
          logger.info(`Cannot login, no user's email not found`);
          throw new Error('Cannot login, no user email was found');
        }
        user.googleID = res.sub;
        
        if (data.deviceId) {
          await this.userNotificationTokenService.updateToken({
            userId: user.id,
            token: data.deviceId,
          });
        }
        await user.save();
        await queryRunner.manager.save(user);
        return { userErrors: [], user: user };
      }
      catch (error: any) {
        await queryRunner.rollbackTransaction();
        logger.error(error);
        return {
          userErrors: [
            {
              message: error.message,
              field: [],
            },
          ],
        };
      }
      finally {
        await queryRunner.release();
      }
  }

  async disconnectGoogle(
    enforcer: Enforcer,
    currentUser: LoggedInUser,
    data: UserDisconnectGoogleInput
    ): Promise<UserUpdatePayload> {
      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        let user: User | undefined;
        user = await this.userRepository.findOneOrFail({ username: currentUser.username, googleID: data.googleIdToken, status: 1, deleted: 0 });
        if (!user) {
          logger.info(`No user email was found`);
          throw new Error('No user email was found');
        }
        user.googleID = '';
        await user.save();
        await queryRunner.manager.save(user);
        return { userErrors: [], user: user };
      }
      catch (error: any) {
        await queryRunner.rollbackTransaction();
        logger.error(error);
        return {
          userErrors: [
            {
              message: error.message,
              field: [],
            },
          ],
        };
      }
      finally {
        await queryRunner.release();
      }
    }
}
