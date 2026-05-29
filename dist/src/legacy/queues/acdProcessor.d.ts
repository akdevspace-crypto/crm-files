export const acdQueue: Queue<any, any, string, any, any, string>;
export function enqueueCall(callData: any): Promise<void>;
import { Queue } from "bullmq/dist/esm/classes/queue";
