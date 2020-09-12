import { Controller, Get, Post, Param, Put, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionStep, Transaction } from './app.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly logger: Logger) {}

    @Get('/health')
    health(): string {
        return 'ok';
    }

    @Get('/ready')
    async reacy(): Promise<string> {
        const str = this.appService.ready();
        return str;
    }

    @Post('/')
    startTransaction(): Promise<string> {
        return this.appService.startTransaction();
    }

    @Get('/:id')
    getTransactionById(@Param('id') id: string): Promise<Transaction> {
        return this.appService.getTransactionById(id);
    }

    @Put('/')
    addStep(@Body() step: TransactionStep): Promise<string> {
        return this.appService.addStep(step);
    }

    @Post('/commit/:id')
    async commit(@Param('id') id: string): Promise<string> {
        try {
            await this.appService.commit(id);
            return 'ok';
        } catch (err) {
            this.logger.error(err);
            return err;
        }
    }

    @Post('/rollback/:id')
    async rollback(@Param('id') id: string): Promise<string> {
        try {
            await this.appService.rollback(id);
            return 'ok';
        } catch (err) {
            this.logger.error(err);
            return err;
        }
    }
}
