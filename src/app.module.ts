import { Module } from '@nestjs/common';
import { TestModule } from './test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSourceOptions from './database/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TestModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
