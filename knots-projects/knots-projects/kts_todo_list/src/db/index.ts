import { getConnectionOptions, createConnections } from 'typeorm';
import { DATABASE_URL, WEM_DATABASE_URL, REDIS_URL, isProduction, INVENTORY_DATABASE_URL, FACEDB_DATABASE_URL} from '../lib/config';
import { newModel, newEnforcer } from 'casbin';
// import { RedisWatcher } from '@casbin/redis-watcher';
import TypeORMAdapter from 'typeorm-adapter';
import { rbac } from './rbac';
import { RedisWatcher } from '@casbin/redis-watcher';
import Container from 'typedi';

export const createDbConnection = async (forceDevelopment = false) => {
  // Create DB connection
  const options = await getConnectionOptions();
  if (DATABASE_URL) Object.assign(options, { url: DATABASE_URL });
  if (!forceDevelopment && isProduction && !!options.entities) Object.assign(options, {
    entities: options.entities.map(v => typeof v === 'string' ? v.replace(/src(.+)\.ts/, 'dist$1.js') : v ),
  });
  if (!forceDevelopment && isProduction && !!options.subscribers) Object.assign(options, {
    subscribers: options.subscribers.map(v => typeof v === 'string' ? v.replace(/src(.+)\.ts/, 'dist$1.js') : v ),
  });
  if (!forceDevelopment && isProduction && !!options.migrations) Object.assign(options, {
    migrations: options.migrations.map(v => typeof v === 'string' ? v.replace(/src(.+)\.ts/, 'dist$1.js') : v ),
  });

  //console.log(options)
  const connections = await createConnections([options ]);

  if (options.extra?.timezone) {
    await connections[0].query(`SET GLOBAL time_zone = '${options.extra.timezone}';`);
    await connections[0].query(`SET time_zone = '${options.extra.timezone}';`);
  }

  const m = newModel(rbac);

  const a = await TypeORMAdapter.newAdapter({ ...options, name: 'node-casbin-official' });

  const e = await newEnforcer(m, a);

  if (REDIS_URL) {
    const watcher = await RedisWatcher.newWatcher(REDIS_URL);
    e.setWatcher(watcher);
    Container.set('enforcerWatcher', watcher);
  }

  return e;
};
