// packages/infrastructure/database/database-optimization.module.ts

import { Module, Global } from '@nestjs/common';

/**
 * DatabaseOptimizationModule
 * 
 * Bu modül veritabanı optimizasyonu ile ilgili provider’ları içerir.
 * Örn: index önerileri, query logging, connection pooling ayarları.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_OPTIMIZATION',
      useFactory: () => {
        // Burada optimizasyon logic’inizi ekleyebilirsiniz
        // Örn: query cache, slow query logger, index hinting
        return {
          optimizeQuery: (query: string) => {
            // Basit örnek: loglama
            console.log(`Optimizing query: ${query}`);
            return query;
          },
        };
      },
    },
  ],
  exports: ['DATABASE_OPTIMIZATION'],
})
export class DatabaseOptimizationModule {}
