import { Response, Request } from 'express';
import { User } from '../modules/user/user.entity';
import { Enforcer } from 'casbin';
import { createLoaders } from './loader';
import { ServiceAccount } from '../modules/serviceAccount/serviceAccount.entity';

interface Context {
  req: Request;
  res: Response;
  user: User;
  serviceAccount: ServiceAccount;
  enforcer: Enforcer;
}

export declare type ResolverContext = ReturnType<typeof createLoaders> &
  Context;
