import { Test, TestingModule } from '@nestjs/testing';
import { ChoreographerController } from './choreographer.controller';
import { ChoreographerService } from './choreographer.service';

describe.skip('ChoreographerController', () => {
  let choreographerController: ChoreographerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChoreographerController],
      providers: [ChoreographerService],
    }).compile();

    choreographerController = app.get<ChoreographerController>(
      ChoreographerController,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(choreographerController).toBeDefined();
    });
  });
});
