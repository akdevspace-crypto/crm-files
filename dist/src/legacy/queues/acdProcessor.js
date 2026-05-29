"use strict";
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
};
const connection = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : new Redis(redisOptions);
connection.on('error', (err) => {
    console.error('[Redis ACD] Error:', err.message);
});
const acdQueue = new Queue('acd-queue', { connection });
async function enqueueCall(callData) {
    console.log(`[ACD] Enqueuing call: ${callData.callSid}`);
    await acdQueue.add('route-call', callData, {
        priority: callData.priority === 'HIGH' ? 1 : 2,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    });
}
async function getAvailableAgents() {
    const keys = await connection.keys('agent:*');
    if (keys.length === 0)
        return [];
    const agentsData = await connection.mget(keys);
    const availableAgents = [];
    for (let i = 0; i < agentsData.length; i++) {
        if (agentsData[i]) {
            const agent = JSON.parse(agentsData[i]);
            if (agent.status === 'AVAILABLE') {
                availableAgents.push([agent.agentId, agent]);
            }
        }
    }
    return availableAgents;
}
const acdWorker = new Worker('acd-queue', async (job) => {
    const callData = job.data;
    console.log(`[ACD] Processing Call Routing for ${callData.callSid}...`);
    const availableAgents = await getAvailableAgents();
    if (availableAgents.length === 0) {
        console.log(`[ACD] No agents available for ${callData.callSid}. Re-queuing...`);
        throw new Error('No agents available');
    }
    const [selectedAgentId, agentData] = availableAgents[0];
    console.log(`[ACD] Agent ${selectedAgentId} selected for Call ${callData.callSid}`);
    const io = require('../index').getIo ? require('../index').getIo() : null;
    if (io && agentData.socketId) {
        io.to(agentData.socketId).emit('incomingCall', callData);
        agentData.status = 'BUSY';
        await connection.set(`agent:${agentData.socketId}`, JSON.stringify(agentData));
    }
    return { assignedAgent: selectedAgentId };
}, { connection });
acdWorker.on('completed', (job, returnvalue) => {
    console.log(`[ACD] Job ${job.id} routed successfully to ${returnvalue.assignedAgent}`);
});
acdWorker.on('failed', (job, err) => {
    console.error(`[ACD] Job ${job.id} failed:`, err.message);
});
module.exports = {
    acdQueue,
    enqueueCall
};
//# sourceMappingURL=acdProcessor.js.map