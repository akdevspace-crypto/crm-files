"use strict";
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { enqueueInstagramEnrichment } = require('../queues/instagramEnrichment');
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'my_instagram_verify_token';
router.get(['/webhook', '/webhooks/meta'], (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ META WEBHOOK VERIFIED');
            res.status(200).send(challenge);
        }
        else {
            console.error('❌ META WEBHOOK VERIFICATION FAILED: Token mismatch');
            res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(400);
    }
});
router.post(['/webhook', '/webhooks/meta'], async (req, res) => {
    const body = req.body;
    const io = req.app.get('io');
    console.log('--- Incoming Meta Webhook ---');
    console.log(JSON.stringify(body, null, 2));
    if (body.object === 'instagram' || body.object === 'page') {
        try {
            for (const entry of body.entry) {
                let messagingEvents = entry.messaging || [];
                if (entry.changes && entry.changes.length > 0) {
                    entry.changes.forEach(change => {
                        if (change.value && change.value.message) {
                            messagingEvents.push(change.value);
                        }
                    });
                }
                for (const webhookEvent of messagingEvents) {
                    if (webhookEvent.message) {
                        const senderId = webhookEvent.sender.id;
                        const recipientId = webhookEvent.recipient.id;
                        const messageObj = webhookEvent.message;
                        const text = messageObj.text || '[Attachment/Media]';
                        const messageId = messageObj.mid;
                        const timestamp = webhookEvent.timestamp || Date.now();
                        const platform = body.object === 'instagram' ? 'INSTAGRAM' : 'MESSENGER';
                        if (messageObj.is_echo) {
                            console.log(`[Meta ${platform}] Ignored echo message: ${messageId}`);
                            continue;
                        }
                        console.log(`[Meta ${platform}] Received message from ${senderId}: ${text}`);
                        const channelStr = platform;
                        let customer = await prisma.customer.findFirst({ where: { phone: senderId } });
                        if (!customer) {
                            const defaultName = platform === 'INSTAGRAM' ? 'Instagram User (Pending Sync)' : `${platform} User ${senderId.substring(0, 5)}`;
                            customer = await prisma.customer.create({
                                data: {
                                    name: defaultName,
                                    phone: senderId,
                                    platform: platform,
                                    platformUserId: senderId
                                }
                            });
                            console.log(`[DB] Created new customer: ${customer.id}`);
                        }
                        else if (!customer.platform || !customer.platformUserId) {
                            customer = await prisma.customer.update({
                                where: { id: customer.id },
                                data: {
                                    platform: platform,
                                    platformUserId: senderId
                                }
                            });
                        }
                        if (platform === 'INSTAGRAM' && !customer.profileEnriched) {
                            enqueueInstagramEnrichment(customer.id, senderId).catch(err => {
                                console.error('[Meta Webhook] Failed to enqueue Instagram enrichment:', err.message);
                            });
                        }
                        let conversation = await prisma.conversation.findFirst({
                            where: { customerId: customer.id, channel: channelStr, status: 'OPEN' }
                        });
                        if (!conversation) {
                            conversation = await prisma.conversation.create({
                                data: {
                                    customerId: customer.id,
                                    channel: channelStr,
                                    priority: 'NORMAL',
                                    unreadCount: 0
                                }
                            });
                            console.log(`[DB] Created new conversation: ${conversation.id}`);
                        }
                        const savedMessage = await prisma.message.create({
                            data: {
                                conversationId: conversation.id,
                                senderType: 'CUSTOMER',
                                content: text,
                                status: 'DELIVERED'
                            }
                        });
                        const updatedConv = await prisma.conversation.update({
                            where: { id: conversation.id },
                            data: {
                                unreadCount: { increment: 1 },
                                updatedAt: new Date()
                            },
                            include: { customer: true }
                        });
                        if (io) {
                            const socketPayload = {
                                conversation: updatedConv,
                                message: savedMessage,
                                customer: customer
                            };
                            console.log('📡 => Emitting Socket.io event: new_message', JSON.stringify(socketPayload.message.content));
                            io.emit('new_message', socketPayload);
                            if (platform === 'INSTAGRAM') {
                                console.log('📡 => Emitting Socket.io event: new_instagram_message');
                                io.emit('new_instagram_message', socketPayload);
                            }
                            else {
                                console.log('📡 => Emitting Socket.io event: new_messenger_message');
                                io.emit('new_messenger_message', socketPayload);
                            }
                        }
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        }
        catch (err) {
            console.error('❌ Failed to process Meta webhook:', err);
            res.status(200).send('EVENT_RECEIVED');
        }
    }
    else {
        res.sendStatus(404);
    }
});
module.exports = router;
//# sourceMappingURL=metaWebhook.js.map