export const automationQueue: Queue<any, any, string, any, any, string>;
export function dispatchAction(actionData: any): Promise<void>;
import { Queue } from "bullmq/dist/esm/classes/queue";
