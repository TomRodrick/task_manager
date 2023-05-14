import { NestFactory } from '@nestjs/core';
import { TasksModule } from './tasks.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(TasksModule);
  const config = app.get(ConfigService);
  await app.listen(config.get('PORT'));
  console.log(`*********APP LISTENING ON ${config.get('PORT')}*********`);
}
bootstrap();
