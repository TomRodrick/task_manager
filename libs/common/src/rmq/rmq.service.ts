import { Injectable } from '@nestjs/common';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  getRmqOptions(queue: string, urls: string[], noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [...urls],
        queue,
        noAck,
        persistent: true,
        queueOptions: { durable: true },
      },
    };
  }

  ackMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
