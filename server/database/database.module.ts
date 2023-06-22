import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SingleArgConstructor } from '../common/types/single-arg-constructor.type';
import { defaultDataSource } from './database.source';

const repositories: SingleArgConstructor<DataSource, Repository<any>>[] = [
  // add repository classes here
];

@Module({
  providers: [
    {
      provide: DataSource,
      useValue: defaultDataSource,
    },
    ...repositories,
  ],
  exports: [DataSource, ...repositories],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(readonly dataSource: DataSource) {}
  async onModuleInit(): Promise<void> {
    await this.dataSource.initialize();
    return;
  }
  async onModuleDestroy(): Promise<void> {
    await this.dataSource.destroy();
    return;
  }
}
