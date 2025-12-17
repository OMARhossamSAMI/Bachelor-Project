import { Test, TestingModule } from '@nestjs/testing';
import { UsergameService } from './usergame.service';

describe('UsergameService', () => {
  let service: UsergameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsergameService],
    }).compile();

    service = module.get<UsergameService>(UsergameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
