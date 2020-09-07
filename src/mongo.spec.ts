import { Test, TestingModule } from '@nestjs/testing';
import { Mongo } from './mongo';
import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

describe('Mongo', () => {
  let provider: Mongo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), ConfigModule],
      providers: [Mongo, Logger ],
    }).compile();

    provider = module.get<Mongo>(Mongo);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
