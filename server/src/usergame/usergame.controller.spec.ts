import { Test, TestingModule } from '@nestjs/testing';
import { UsergameController } from './usergame.controller';

describe('UsergameController', () => {
  let controller: UsergameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsergameController],
    }).compile();

    controller = module.get<UsergameController>(UsergameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
