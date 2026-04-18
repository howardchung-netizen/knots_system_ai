import 'reflect-metadata';
import { createDbConnection } from '.';

import Container, { Inject, Service } from 'typedi';
import { User } from '../modules/user/user.entity';
import { RESOURCE_USER } from '../modules/user/user.resolver';
import { PermissionAction } from '../modules/admin/action/action.type';
import { RoleService } from '../modules/admin/role/role.service';
import { useContainer } from 'class-validator';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

@Service()
class Seeds {
  constructor(
  ){
  }
  async create() {
    // console.log('Creating seeds 🌱');
    const enforcer = await createDbConnection();
    
    
    // const admin = await User.create({
    //   id: 'howardchung',
    //   username: 'howardchung@knotsltd.com',
    //   password: 'e01d467793aae76684212288d58a655a',
    // }).save();
    console.log(await enforcer.enforce(9,RESOURCE_USER,PermissionAction.ALL));
    enforcer.addPolicies
    console.log(await enforcer.getAllActions());

  }
}
useContainer(Container)
Container.get(Seeds)
  .create()
  .then(() => {
    console.log('Seeds created 🌳');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });
