import { createParamDecorator } from 'type-graphql';
import { ResolverContext } from '../../../lib/types';

export const I18n = () =>
  createParamDecorator<ResolverContext>(({ context }) => {
    return context.req.i18n;
  });
