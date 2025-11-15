// src/tasks/sync.task.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { CosmeticsService } from '../cosmetics/cosmetics.service';

@Injectable()
export class SyncTask implements OnModuleInit {
  private readonly logger = new Logger(SyncTask.name);

  constructor(private readonly cosmeticsService: CosmeticsService) {}

  onModuleInit() {
    // Agendamento: todo dia às 03:00 (local do container). Ajuste se quiser outro horário.
    const cronExpr = process.env.SYNC_CRON_EXPR || '0 3 * * *'; // 03:00 daily
    cron.schedule(cronExpr, async () => {
      this.logger.log(`Cron triggered (expr=${cronExpr}) — iniciando syncWithRemote()`);
      try {
        const res = await this.cosmeticsService.syncWithRemote();
        this.logger.log(`Cron sync concluído: imported=${res.imported} updated=${res.updated}`);
      } catch (err) {
        this.logger.error(`Cron sync falhou: ${(err as Error).message}`);
      }
    });

    this.logger.log(`SyncTask agendado com expr="${cronExpr}"`);
  }
}
