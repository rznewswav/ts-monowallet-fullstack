import { Injectable } from '@nestjs/common';
import { NoArgConstructor } from '../../common/types/no-arg-constructor.type';
import { SingleArgConstructor } from '../../common/types/single-arg-constructor.type';
import { DataSource, Repository } from 'typeorm';

type withDataSourceConstructor<T = any> = SingleArgConstructor<DataSource, T>;

export function RepoFactory<T = any>(
  cls: NoArgConstructor<T>,
): withDataSourceConstructor<Repository<T>> {
  @Injectable()
  class Repo {
    readonly boundRepo: Repository<T>;
    constructor(dataSource: DataSource) {
      this.boundRepo = dataSource.getRepository(cls);

      let currentObj: any = this.boundRepo;

      do {
        const props = Object.getOwnPropertyNames(currentObj);
        for (const prop of props) {
          const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);

          if (descriptor.get) {
            continue;
          }

          if (cls === this.boundRepo[prop]) {
            continue;
          }

          if (prop === 'constructor') {
            continue;
          }

          if (typeof this.boundRepo[prop] === 'function') {
            const boundedMethod = this.boundRepo[prop].bind(this.boundRepo);
            Object.defineProperty(this, prop, {
              get() {
                return boundedMethod;
              },
            });
          }
        }
      } while ((currentObj = Object.getPrototypeOf(currentObj)));
    }
  }

  return Repo as unknown as withDataSourceConstructor<Repository<T>>;
}
