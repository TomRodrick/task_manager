import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

//todo: unit test
export function IdIsValid(target, propertyKey, descriptor) {
  const originalFn = target[propertyKey];
  descriptor.value = function (...args: any[]) {
    if (!args[0] || isNaN(args[0])) {
      throw new RpcException(
        new BadRequestException('id is required and must be a number'),
      );
    }
    return originalFn.call(this, ...args);
  };
}
