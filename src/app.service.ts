import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { v1 } from 'uuid';
import fetch, { Response } from 'node-fetch';
import { Db } from 'mongodb';
import { CallbackHook, Transaction, TransactionStep } from './app.interface';
import { Mongo } from './mongo';

const txColName = 'transactions';

@Injectable()
export class AppService implements OnApplicationBootstrap {
    private db: Db;

    constructor(private readonly logger: Logger, private readonly mongo: Mongo) {}

    async onApplicationBootstrap() {
        this.db = this.mongo.db;
    }

    async ready(): Promise<string> {
        try {
            await this.db.listCollections();
            return 'ok';
        } catch (err) {
            return Promise.reject(err);
        }
    }

    async startTransaction(): Promise<string> {
        const txId = v1();
        try {
            await this.db.collection(txColName).insertOne({
                _id: txId,
                successHooks: [],
                failureHooks: [],
                created_at: new Date(),
            });
            return txId;
        } catch (err) {
            this.logger.error(err.message, err.trace);
            return Promise.reject(err);
        }
    }

    async addStep({ id, successHook, failureHook }: TransactionStep): Promise<unknown> {
        try {
            const result = await this.db.collection(txColName).findOneAndUpdate(
                { _id: id },
                {
                    $push: {
                        successHooks: successHook,
                        failureHooks: failureHook,
                    },
                    $set: {
                        last_update: new Date(),
                    },
                }
            );
            if (result.ok) {
                return Promise.resolve('ok');
            }
            throw new Error(`Transaction [${id}] does not exist`);
        } catch (err) {
            this.logger.error(err.message, err.stack);
            return Promise.reject(err);
        }
    }

    private async callHook(transactionId: string, callback: CallbackHook): Promise<Response> {
        // call hook
        return fetch(callback.url, {
            method: 'POST',
            body: JSON.stringify({
                transactionId,
                ...callback,
            }),
        });
    }

    async commit(transactionId: string): Promise<unknown> {
        try {
            const transaction: Transaction = await this.db.collection(txColName).findOne({ _id: transactionId });
            if (!transaction) {
                throw new Error(`Transaction [${transactionId}] does not exist`);
            }
            const promises = [];
            for await (let hook of transaction.successHooks) {
                promises.push(this.callHook(transactionId, hook));
            }
            await Promise.all(promises);
            return this.db
                .collection(txColName)
                .updateOne({ _id: transactionId }, { $set: { commited: true, last_update: new Date() } });
        } catch (err) {
            this.logger.error(err.message, err.stack);
            return Promise.reject(err);
        }
    }

    async rollback(transactionId: string): Promise<unknown> {
        try {
            const transaction: Transaction = await this.db.collection(txColName).findOne({ _id: transactionId });
            if (!transaction) {
                throw new Error(`Transaction [${transactionId}] does not exist`);
            }
            const promises = [];
            for await (let hook of transaction.failureHooks) {
                promises.push(this.callHook(transactionId, hook));
            }
            await Promise.all(promises);
            return this.db
                .collection(txColName)
                .updateOne({ _id: transactionId }, { $set: { commited: true, last_update: new Date() } });
        } catch (err) {
            this.logger.error(err.message, err.stack);
            return Promise.reject(err);
        }
    }

    getTransactionById(transactionId: string): Promise<Transaction> {
        return this.db.collection(txColName).findOne({ _id: transactionId });
    }
}
