import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Currency } from './currency.entity';

@Service()
@EntityRepository(Currency)
export class CurrencyRepository extends PaginatingRepository<Currency> {}
