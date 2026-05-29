import { Redis } from 'ioredis';
export type AgentStatus = 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE' | 'WRAP_UP';
export declare class AgentService {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis);
    updateAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    getAvailableAgentsBySkill(skill: string): Promise<any[]>;
}
