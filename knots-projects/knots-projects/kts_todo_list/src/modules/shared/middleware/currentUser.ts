import { createParamDecorator } from 'type-graphql';
import { ResolverContext } from '../../../lib/types';
import { User } from '../../user/user.entity';

export const CurrentUser = () =>
  createParamDecorator<ResolverContext>(({ context }) => {
    return context.user;
  });

export declare type LoggedInUser = User;
