import { NestFactory } from '@nestjs/core';
import { ChoreographerModule } from './choreographer.module';
import { ConfigService } from '@nestjs/config';
import { RpcExceptionFilter } from './rpc-exception/rpc-exception.filter';
import { SanatizeInterceptor } from './interceptor/sanatize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ChoreographerModule);
  const config = app.get(ConfigService);
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalInterceptors(new SanatizeInterceptor());
  app.enableCors();
  await app.listen(config.get('CHOREOGRAPHER_PORT'));
  console.log(
    `*********APP LISTENING ON ${config.get('CHOREOGRAPHER_PORT')}*********`,
  );
}
bootstrap();
