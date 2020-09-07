import { Controller, Get, Post, Param, Put, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionStep } from './app.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

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
    getTransactionById(@Param('id') id: string) {
        return this.appService.getTransactionById(id);
    }

    @Put('/')
    addStep(@Body() step: TransactionStep) {
        return this.appService.addStep(step);
    }

    @Post('/commit/:id')
    commit(@Param('id') id: string) {
        return this.appService.commit(id);
    }

    @Post('/rollback/:id')
    rollback(@Param('id') id: string) {
        return this.appService.rollback(id);
    }
}
