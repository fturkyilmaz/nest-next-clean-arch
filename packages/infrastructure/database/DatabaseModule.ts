import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './PrismaService';
import { BulkOperationsService } from './BulkOperationsService';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, BulkOperationsService],
  exports: [PrismaService, BulkOperationsService],
})
export class DatabaseModule {}
