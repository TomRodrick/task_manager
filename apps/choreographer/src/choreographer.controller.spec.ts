import { Test, TestingModule } from '@nestjs/testing';
import { ChoreographerController } from './choreographer.controller';
import { ChoreographerService } from './choreographer.service';

describe('ChoreographerController', () => {
  let choreographerController: ChoreographerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChoreographerController],
      providers: [ChoreographerService],
    }).compile();

    choreographerController = app.get<ChoreographerController>(ChoreographerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(choreographerController.getHello()).toBe('Hello World!');
    });
  });
});
