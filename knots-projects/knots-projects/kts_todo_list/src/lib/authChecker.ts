import { AuthChecker } from 'type-graphql';
import { ResolverContext } from '../lib/types';
import { isDisabled } from '../modules/user/user.resolver';

export const authChecker: AuthChecker<ResolverContext> = async (
  { context: { req, user, serviceAccount, enforcer } },
  roles,
) => {
  if ((!user || isDisabled(user)) && (!serviceAccount || serviceAccount.disabled || !serviceAccount.token || serviceAccount.token !== (req?.headers?.authorization || '').replace(/Bearer (.+)/, '$1'))) {    // and if no user/service account or they are disabled, restrict access
    return false;
  }

  if (roles && roles.length) {
    let enforceName: string | undefined;
    if (user?.id) {
      enforceName = user.id;
    } else if (serviceAccount?.id) {
      enforceName = `service_account::${serviceAccount.id}`;
    }
    if (!enforceName) return false;

    let auth = false;
    for (const role of roles) {
      const [obj, action] = role.split(':');
      auth = auth || (await enforcer.enforce(enforceName, obj, action));
    }
    return auth;
  }

  return true;
};
