import { IsNotEmpty, IsUrl, IsUUID, ValidateNested, IsNotEmptyObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CallbackHook {
    @IsNotEmpty()
    @IsUrl()
    url: string;

    payload?: Record<string, unknown>;
}

export interface Transaction {
    id: string;
    successHooks: CallbackHook[];
    failureHooks: CallbackHook[];
}

export class TransactionStep {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => CallbackHook)
    successHook: CallbackHook;

    @IsNotEmptyObject()
    @ValidateNested()
    failureHook: CallbackHook;
}
