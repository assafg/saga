import { TestingModule, Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { Mongo } from './mongo';

describe('Test Service', () => {
    let service: AppService;
    let mongo;

    let txCollection = {
        findOne: null,
        insertOne: null
    };
    beforeEach(async () => {
        const db = {
            collection: () => txCollection,
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                Logger,
                AppService,
                {
                    provide: Mongo,
                    useFactory: () => ({
                        db,
                    }),
                },
            ],
        }).compile();

        service = app.get<AppService>(AppService);
        mongo = app.get<Mongo>(Mongo);
        service.onApplicationBootstrap();
    });

    it('should exest', () => {
        expect(service).toBeTruthy();
    });

    it('should find by id', async () => {
        txCollection.findOne = jest.fn().mockResolvedValueOnce({
            id: '123',
        })
        const tx = await service.getTransactionById('123');
        expect(tx).toEqual({
            id: '123',
        });
    });

    it('should start transaction', async () => {
        txCollection.insertOne = jest.fn().mockResolvedValueOnce('ok');
        await service.startTransaction();
        expect(txCollection.insertOne).toBeCalledTimes(1)
    })
});
