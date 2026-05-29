"use strict";
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
};
const connection = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : new Redis(redisOptions);
connection.on('error', (err) => {
    console.error('[Redis Instagram Enrichment] Error:', err.message);
});
const instagramEnrichmentQueue = new Queue('instagram-enrichment', { connection });
async function enqueueInstagramEnrichment(customerId, platformUserId) {
    console.log(`[Instagram Enrichment] Enqueuing profile enrichment for customer ${customerId} (Platform UID: ${platformUserId})`);
    await instagramEnrichmentQueue.add('enrich-profile', {
        customerId,
        platformUserId
    }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
    });
}
module.exports = {
    instagramEnrichmentQueue,
    enqueueInstagramEnrichment
};
//# sourceMappingURL=instagramEnrichment.js.map