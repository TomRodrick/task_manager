import { NestFactory } from '@nestjs/core';
import { TasksModule } from './tasks.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RmqService } from '@app/common';
const configService = new ConfigService();
const rmqService = new RmqService();
const options = rmqService.getRmqOptions(
  configService.get('RABBIT_MQ_TASKS_QUEUE'),
  [configService.get('AMQP_URL')],
);
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TasksModule,
    { ...options },
  );

  await app.listen();
  console.log(`*********TASKS SERVICE LISTENING*********`);
}
bootstrap();
