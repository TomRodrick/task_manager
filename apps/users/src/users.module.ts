import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RmqModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('USERS_DB_HOST'),
        port: configService.get('USERS_DB_PORT_DOCKER'),
        username: configService.get('USERS_MYSQL_USER'),
        password: configService.get('USERS_MYSQL_PASSWORD'),
        database: configService.get('USERS_DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    RmqModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
