import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DocumentDraftService } from '../../document.draft/service';
import { LoggerService, configValidation } from '../../common';

@Injectable()
export class CleanerScheduler {
    public constructor(
        private readonly logger: LoggerService,
        private readonly documentDraftService: DocumentDraftService
    ) {}

    @Interval(configValidation().SCHEDULER_INTERVAL_MS_DB_CLEANER)
    async clearDocumentDraftTable() {
        try {
            const drafts = await this.documentDraftService.findAll();

            const currentTime = new Date().getTime();
            const threshold = 3600000; // 60 minutes in milliseconds
            let count = 0;
            for (const draft of drafts) {
                if (currentTime - draft.uploadDate.getTime() > threshold) {
                    await this.documentDraftService.delete(draft.id);
                    count++;
                }
            }
            this.logger.info(
                'CleanerScheduler: DocumentDraft Table -> ' +
                    count +
                    ' items deleted'
            );
        } catch (err) {
            this.logger.error(err)
            //it will retry the next time
        }
    }
}
