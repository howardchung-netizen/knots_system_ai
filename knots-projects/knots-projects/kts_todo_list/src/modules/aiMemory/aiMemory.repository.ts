import { EntityRepository, Repository } from 'typeorm';
import { AiMemory } from './aiMemory.entity';

@EntityRepository(AiMemory)
export class AiMemoryRepository extends Repository<AiMemory> {}
