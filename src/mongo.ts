import { Injectable, OnModuleInit, Logger, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class Mongo implements OnModuleInit, OnApplicationShutdown, OnModuleDestroy {
    constructor(private readonly configService: ConfigService, private readonly logger: Logger) {}

    private client: MongoClient;
    db: Db;

    onModuleDestroy(): void {
        if (this.client) {
            this.client.close();
        }
    }

    onApplicationShutdown(): void {
        if (this.client) {
            this.client.close();
        }
    }

    async onModuleInit(): Promise<any> {
        const url = this.configService.get<string>('MONGO_URL');
        this.logger.log(url, 'mongoUrl');

        try {
            // Use connect method to connect to the Server
            this.client = await MongoClient.connect(url, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            });
            this.db = this.client.db('saga');
        } catch (err) {
            this.logger.error(err.message, err.stack);
        }
    }
}
