import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingTransactionItemRepository } from './bookKeepingTransactionItem.repository';

@Service()
export class BookKeepingTransactionItemService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
  ) {
  }
}
