"use strict";
const { dispatchAction } = require('../queues/automationProcessor');
const prisma = require('../prisma');
async function evaluateTriggers(triggerType, context) {
    console.log(`[WorkflowEngine] Evaluating triggers for: ${triggerType}`);
    try {
        const workflows = await prisma.workflowAutomation.findMany({
            where: {
                isActive: true,
                triggerType: triggerType
            }
        });
        if (workflows.length === 0)
            return;
        for (const workflow of workflows) {
            console.log(`[WorkflowEngine] Triggering workflow: ${workflow.name} (${workflow.actionType})`);
            let actionConfig = workflow.actionConfig || {};
            if (typeof actionConfig === 'string') {
                actionConfig = JSON.parse(actionConfig);
            }
            const mergedConfig = { ...actionConfig, ...context };
            await dispatchAction({
                workflowId: workflow.id,
                actionType: workflow.actionType,
                actionConfig: mergedConfig,
                targetId: context.targetId || context.callSid || context.customerId
            });
        }
    }
    catch (error) {
        console.error(`[WorkflowEngine] Evaluation error:`, error);
    }
}
module.exports = {
    evaluateTriggers
};
//# sourceMappingURL=workflowEngine.js.map