/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanatizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        if (typeof value === 'object') {
          //undefined values will be deleted when turned to JSON, we want to make sure we never send sensitive data
          value.hash = undefined;
          value.salt = undefined;
          value.__v = undefined;
          value.refresh_token = undefined;
        }
        return value;
      }),
    );
  }
}
