import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const host = config.getOrThrow<string>('DB_HOST');
    const port = Number(config.getOrThrow<string>('DB_PORT'));
    const user = config.getOrThrow<string>('DB_USER');
    const password = config.getOrThrow<string>('DB_PASSWORD');
    const database = config.getOrThrow<string>('DB_NAME');

    if (!host.trim()) throw new Error('DB_HOST must not be empty');
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT must be an integer between 1 and 65535');
    }
    if (!user.trim()) throw new Error('DB_USER must not be empty');
    if (!database.trim()) throw new Error('DB_NAME must not be empty');

    super({
      adapter: new PrismaMariaDb({
        host,
        port,
        user,
        password,
        database,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}