import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DossierService } from '../../dossier/service';
import { configValidation } from '../../common';
import {DocumentService} from "../../document/service";

@Injectable()
export class CustomsScheduler {
    public constructor(private readonly dossierService: DossierService,
                       private readonly documentService: DocumentService
    ) {}

    @Interval(configValidation().SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLEARANCE)
    async approveCustomsClearance() {
        try {
            await this.dossierService.approveCustomsClearance();
        } catch (error) {
            console.error(error)
            //it will retry the next time
        }
    }

    @Interval(configValidation().SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_DDT)
    async approveDDT() {
        try {
            await this.dossierService.approveDDT();
        } catch (error) {
            console.error(error)
            //it will retry the next time
        }
    }

    @Interval(configValidation().SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLOSING)
    async approveClosing() {
        try {

            await this.dossierService.approveClosing();
        } catch (error) {
            console.error(error)
            //it will retry the next time
        }
    }
    @Interval(60000)
    async notarizeDocument() {
        try {

            await this.documentService.notarizeDocument()
        } catch (error) {
            console.error(error)
            //it will retry the next time
        }
    }
}
