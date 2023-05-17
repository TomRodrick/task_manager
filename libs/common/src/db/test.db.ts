import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmTestingModule = (entity) => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [entity],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([entity]),
];
