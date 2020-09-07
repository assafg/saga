import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Transaction, TransactionStep } from './app.interface';

jest.mock('./app.service');

const mockStep:TransactionStep = {
  id: '1234',
  successHook: {
      url: 'http://home/success',
  },
  failureHook: {
      url: 'http://home/success',
  },
}
const mockTransaction:Transaction = {
  id: '1234',
  successHooks: [],
  failureHooks: []
} 
describe('AppController', () => {
    let appController: AppController;
    let service: AppService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
        service = app.get<AppService>(AppService);
    });

    describe('root', () => {
        it('should start a transaction', async () => {
            jest.spyOn(service, 'startTransaction').mockResolvedValue('1234');
            const id = await appController.startTransaction();
            expect(id).toBe('1234');
        });

        it('should fail to create a transaction', async () => {
            jest.spyOn(service, 'startTransaction').mockRejectedValue(new Error('mock error'));
            try {
                await appController.startTransaction();
                fail();
            } catch (error) {
                expect(error.message).toEqual('mock error');
            }
        });

        it('should add a step', async () => {
            jest.spyOn(service, 'addStep').mockResolvedValue('ok');
            const res = await appController.addStep(mockStep);
            expect(res).toBe('ok');
            expect(service.addStep).toHaveBeenCalledWith(mockStep)
        });

        it('should fail to add step', async () => {
          jest.spyOn(service, 'addStep').mockRejectedValue(new Error('mock error'));
          try {
              await appController.addStep(mockStep);
              fail();
          } catch (error) {
              expect(error.message).toEqual('mock error');
          }
      });
        it('should getTransactionById', async () => {
            jest.spyOn(service, 'getTransactionById').mockResolvedValue(mockTransaction);
            const res = await appController.getTransactionById(mockTransaction.id);
            expect(res).toEqual(mockTransaction);
            expect(service.getTransactionById).toHaveBeenCalledWith(mockTransaction.id)
        });

        it('should fail to add step', async () => {
          jest.spyOn(service, 'getTransactionById').mockRejectedValue(new Error('mock error'));
          try {
              await appController.getTransactionById(mockTransaction.id);
              fail();
          } catch (error) {
              expect(error.message).toEqual('mock error');
          }
      });
    });
});
