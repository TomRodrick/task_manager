import { NestFactory } from '@nestjs/core';
import { ChoreographerModule } from './choreographer.module';
import { ConfigService } from '@nestjs/config';
import { RpcExceptionFilter } from './rpc-exception/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ChoreographerModule);
  const config = app.get(ConfigService);
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen(config.get('CHOREOGRAPHER_PORT'));
  console.log(
    `*********APP LISTENING ON ${config.get('CHOREOGRAPHER_PORT')}*********`,
  );
}
bootstrap();
