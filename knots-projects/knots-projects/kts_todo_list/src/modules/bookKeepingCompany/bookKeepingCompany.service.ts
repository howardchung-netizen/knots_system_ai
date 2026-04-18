import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingCompanyRepository } from './bookKeepingCompany.repository';
import { BookKeepingCompanyArgs } from './args/bookKeepingCompany.args';
import { BookKeepingCompanyConnection } from './connection/bookKeepingCompany.connection';
import { BookKeepingCompanyUpdateInput } from './input/bookKeepingCompanyUpdate.input';
import { Enforcer } from 'casbin';
import { BookKeepingCompanyPayload } from './payload/bookKeepingCompany.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { BookKeepingCompanyCreateInput } from './input/bookKeepingCompanyCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { BookKeepingCompanyDeleteInput } from './input/bookKeepingCompanyDelete.input';
import { BookKeepingCompanyDeletePayload } from './payload/bookKeepingCompanyDelete.payload';

@Service()
export class BookKeepingCompanyService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
  ) {
  }

  async getMany(args: BookKeepingCompanyArgs, extraArgs: { [index: string]: any } = {}): Promise<BookKeepingCompanyConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.bookKeepingCompanyRepository.createQueryBuilder();

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.companyName) queryBuilder.andWhere('company_name like `%:companyName%`', { companyName: args.companyName });
    if (args.businessRegistrationNo) queryBuilder.andWhere('business_registration_no like `%:businessRegistrationNo%`', { businessRegistrationNo: args.businessRegistrationNo });
    if (args.phone) queryBuilder.andWhere('phone like `%:phone%`', { phone: args.phone });

    queryBuilder.skip(offset).take(limit).orderBy({
      'created_at': 'DESC',
    });

    const [data, dataCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(data, args, {
        arrayLength: dataCount,
        sliceStart: offset || 0,
      }),
      totalCount: dataCount,
    };
  }

  async create(
    data: BookKeepingCompanyCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingCompanyPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookKeepingCompany = this.bookKeepingCompanyRepository.create();
      bookKeepingCompany.companyName = data.companyName;
      if (data.businessRegistrationNo) bookKeepingCompany.businessRegistrationNo = data.businessRegistrationNo;
      if (data.address) bookKeepingCompany.address = data.address;

      await queryRunner.manager.save(bookKeepingCompany);

      await queryRunner.commitTransaction();

      return {
        bookKeepingCompany: await bookKeepingCompany.save(),
        userErrors: []
      };
    }
    catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    data: BookKeepingCompanyUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingCompanyPayload> {
    try {
      const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.companyName) bookKeepingCompany.companyName = data.companyName;
      if (data.businessRegistrationNo) bookKeepingCompany.businessRegistrationNo = data.businessRegistrationNo;
      if (data.address) bookKeepingCompany.address = data.address;

      return {
        bookKeepingCompany: await bookKeepingCompany.save(),
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    }
  }

  async delete(
    data: BookKeepingCompanyDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingCompanyDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingCompany.deleted = true;
      await queryRunner.manager.save(bookKeepingCompany);

      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        result: true,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [
          {
            message: error.message,
            field: ['id'],
          },
        ],
        result: false,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
