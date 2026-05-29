export const instagramEnrichmentQueue: Queue<any, any, string, any, any, string>;
export function enqueueInstagramEnrichment(customerId: any, platformUserId: any): Promise<void>;
import { Queue } from "bullmq/dist/esm/classes/queue";
