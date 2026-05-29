"use strict";
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('error', (err) => {
    console.error('[Redis Signaling] Error:', err.message);
});
const redisKey = (id) => `agent:${id}`;
function setupSignaling(io) {
    io.on('connection', (socket) => {
        console.log(`Agent connected: ${socket.id}`);
        socket.on('agent_login', async (data) => {
            const { agentId, name, skills } = data;
            const agentData = { agentId, name, skills, status: 'AVAILABLE', socketId: socket.id };
            await redis.set(redisKey(socket.id), JSON.stringify(agentData));
            console.log(`Agent ${name} logged in. Available for calls.`);
            io.emit('agent_status_change', { agentId, status: 'AVAILABLE', name });
        });
        socket.on('status_update', async (data) => {
            const agentStr = await redis.get(redisKey(socket.id));
            if (agentStr) {
                const agent = JSON.parse(agentStr);
                agent.status = data.status;
                await redis.set(redisKey(socket.id), JSON.stringify(agent));
                console.log(`Agent ${agent.name} changed status to ${agent.status}`);
                io.emit('agent_status_change', { agentId: agent.agentId, status: agent.status });
            }
        });
        socket.on('initiateCall', async (data) => {
            console.log(`Agent ${socket.id} is initiating call to agent ${data.targetAgentId}`);
            const keys = await redis.keys('agent:*');
            let callerName = data.customerName || 'Agent';
            const callerStr = await redis.get(redisKey(socket.id));
            if (callerStr) {
                callerName = JSON.parse(callerStr).name;
            }
            for (const key of keys) {
                const agentStr = await redis.get(key);
                if (agentStr) {
                    const agent = JSON.parse(agentStr);
                    if (agent.agentId === data.targetAgentId && agent.status === 'AVAILABLE') {
                        io.to(agent.socketId).emit('incomingCall', {
                            callSid: data.callSid,
                            customerName: callerName,
                            phone: 'Internal Directory Call',
                            category: 'Internal',
                            isCaller: false
                        });
                    }
                }
            }
        });
        socket.on('acceptCall', async (data) => {
            console.log(`Agent ${socket.id} accepted call ${data.callSid}`);
            const agentStr = await redis.get(redisKey(socket.id));
            let agentId = null;
            if (agentStr) {
                const agent = JSON.parse(agentStr);
                agentId = agent.agentId;
                agent.status = 'BUSY';
                await redis.set(redisKey(socket.id), JSON.stringify(agent));
                io.emit('agent_status_change', { agentId, status: 'BUSY' });
            }
            io.emit('agentAssigned', { callSid: data.callSid, agentId });
            io.emit('queueUpdated', { count: -1 });
            io.emit('callAccepted', data);
        });
        socket.on('rejectCall', async (data) => {
            console.log(`Agent ${socket.id} rejected call ${data.callSid}`);
            io.emit('callRejected', data);
        });
        const { getRouterRtpCapabilities, createWebRtcTransport, startRecording, stopRecordingAndUpload, getRouter } = require('./mediasoup');
        const prisma = require('./prisma');
        socket.on('getRouterRtpCapabilities', async (data, callback) => {
            try {
                const capabilities = await getRouterRtpCapabilities();
                callback({ capabilities });
            }
            catch (err) {
                callback({ error: err.message });
            }
        });
        socket.on('createWebRtcTransport', async (data, callback) => {
            try {
                const transport = await createWebRtcTransport();
                if (!socket.transports)
                    socket.transports = new Map();
                socket.transports.set(transport.id, transport);
                callback({
                    params: {
                        id: transport.id,
                        iceParameters: transport.iceParameters,
                        iceCandidates: transport.iceCandidates,
                        dtlsParameters: transport.dtlsParameters
                    }
                });
            }
            catch (err) {
                callback({ error: err.message });
            }
        });
        socket.on('connectWebRtcTransport', async ({ transportId, dtlsParameters }, callback) => {
            try {
                const transport = socket.transports.get(transportId);
                if (!transport)
                    throw new Error(`Transport ${transportId} not found`);
                await transport.connect({ dtlsParameters });
                callback({ connected: true });
            }
            catch (err) {
                callback({ error: err.message });
            }
        });
        socket.on('produce', async ({ transportId, kind, rtpParameters, callSid }, callback) => {
            try {
                const transport = socket.transports.get(transportId);
                if (!transport)
                    throw new Error(`Transport ${transportId} not found`);
                const producer = await transport.produce({ kind, rtpParameters });
                if (!socket.producers)
                    socket.producers = new Map();
                socket.producers.set(producer.id, producer);
                if (kind === 'audio') {
                    await startRecording(callSid, producer);
                }
                socket.broadcast.emit('newProducer', { producerId: producer.id, callSid });
                callback({ id: producer.id });
            }
            catch (err) {
                callback({ error: err.message });
            }
        });
        socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
            try {
                const router = getRouter();
                if (!router.canConsume({ producerId, rtpCapabilities })) {
                    throw new Error('Cannot consume');
                }
                const transport = socket.transports.get(transportId);
                const consumer = await transport.consume({
                    producerId,
                    rtpCapabilities,
                    paused: false,
                });
                if (!socket.consumers)
                    socket.consumers = new Map();
                socket.consumers.set(consumer.id, consumer);
                callback({
                    params: {
                        id: consumer.id,
                        producerId,
                        kind: consumer.kind,
                        rtpParameters: consumer.rtpParameters,
                    }
                });
            }
            catch (err) {
                callback({ error: err.message });
            }
        });
        socket.on('endCall', async (data) => {
            console.log(`Call ended: ${data.callSid}`);
            try {
                const recordingUrl = await stopRecordingAndUpload(data.callSid);
                const isInternal = data.category === 'Internal';
                const isOutbound = data.category === 'Outbound';
                let aiSummaryResult = null;
                if (!isInternal && recordingUrl) {
                    const { generateCallSummaryFromAudio } = require('./ai');
                    aiSummaryResult = await generateCallSummaryFromAudio(recordingUrl, isOutbound);
                    console.log(`[AI Summary] Generated for call ${data.callSid}:`, aiSummaryResult.summary);
                }
                else if (!isInternal) {
                    console.log(`[AI Summary] Skipped for ${data.callSid} - no recording URL available.`);
                }
                let callLog = await prisma.callLog.findFirst({ where: { exotelCallSid: data.callSid } });
                if (!callLog && data.phone) {
                    let customer = await prisma.customer.findFirst({ where: { phone: data.phone } });
                    if (!customer) {
                        customer = await prisma.customer.create({ data: { name: data.customerName || 'WebRTC Caller', phone: data.phone } });
                    }
                    callLog = await prisma.callLog.create({
                        data: {
                            customerId: customer.id,
                            agentId: data.agentId || null,
                            exotelCallSid: data.callSid,
                            status: 'IN_PROGRESS',
                            direction: isOutbound ? 'OUTBOUND' : 'INBOUND'
                        }
                    });
                }
                const updatedLog = await prisma.callLog.updateMany({
                    where: { exotelCallSid: data.callSid },
                    data: {
                        status: 'ENDED',
                        duration: data.duration || 0,
                        recordingUrl: recordingUrl || null,
                        direction: isOutbound ? 'OUTBOUND' : 'INBOUND'
                    }
                });
                if (aiSummaryResult) {
                    const callLog = await prisma.callLog.findFirst({ where: { exotelCallSid: data.callSid } });
                    if (callLog && callLog.customerId) {
                        await prisma.customerNote.create({
                            data: {
                                content: `[Call: ${data.callSid}] AI Call Summary: ${JSON.stringify(aiSummaryResult)}`,
                                customerId: callLog.customerId,
                                agentId: callLog.agentId || null
                            }
                        });
                    }
                }
            }
            catch (err) {
                console.error("Critical error during endCall processing:", err);
            }
            finally {
                io.emit('callEnded', data);
            }
        });
        socket.on('disconnect', async () => {
            const agentStr = await redis.get(redisKey(socket.id));
            if (agentStr) {
                const agent = JSON.parse(agentStr);
                console.log(`Agent ${agent.name} disconnected.`);
                io.emit('agent_status_change', { agentId: agent.agentId, status: 'OFFLINE' });
                await redis.del(redisKey(socket.id));
            }
        });
    });
}
module.exports = { setupSignaling };
//# sourceMappingURL=signaling.js.map