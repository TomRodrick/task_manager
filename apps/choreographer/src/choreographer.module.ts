import { Module } from '@nestjs/common';
import { ChoreographerController } from './choreographer.controller';
import { ChoreographerService } from './choreographer.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule, USERS_SERVICE } from '@app/common';
import { TASKS_SERVICE } from '@app/common';
import { AuthModule } from '@app/common';
import { ChoreographerAuthModule } from './auth/auth.module';
@Module({
  imports: [
    ChoreographerAuthModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RmqModule.register({
      name: TASKS_SERVICE,
      queue: 'RABBIT_MQ_TASKS_QUEUE', //the env vals to get
      uri: 'AMQP_URL',
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: 'RABBIT_MQ_USERS_QUEUE', //the env vals to get
      uri: 'AMQP_URL',
    }),
  ],
  controllers: [ChoreographerController],
  providers: [ChoreographerService],
})
export class ChoreographerModule {}
