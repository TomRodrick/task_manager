import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { RmqModule } from '../rmq/rmq.module';
import { USERS_SERVICE } from '../constants';

@Module({
  imports: [
    RmqModule.register({
      name: USERS_SERVICE,
      queue: 'RABBIT_MQ_USERS_QUEUE',
      uri: 'AMQP_URL',
    }),
  ],
  exports: [RmqModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
