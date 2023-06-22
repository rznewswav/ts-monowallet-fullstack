import { NoArgConstructor } from '../../common/types/no-arg-constructor.type';
import { Repository } from 'typeorm';

export type SeederType = {
  seed(
    repoGetter: <T>(entity: NoArgConstructor<T>) => Repository<T>,
  ): Promise<void>;

  unseed?(
    repoGetter: <T>(entity: NoArgConstructor<T>) => Repository<T>,
  ): Promise<void>;
};
