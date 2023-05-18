import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RmqService } from '@app/common';
const configService = new ConfigService();
const rmqService = new RmqService();

const options = rmqService.getRmqOptions(
  configService.get('RABBIT_MQ_USERS_QUEUE'),
  [configService.get('AMQP_URL')],
);

//ideally we listen to users and auth queue but too complex for this implementation
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    { ...options },
  );

  await app.listen();
  console.log(`*********USERS SERVICE LISTENING*********`);
}
bootstrap();
