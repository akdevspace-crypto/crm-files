import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async dispatchAlert(type: string, description: string) {
    this.logger.warn(`[EMERGENCY DISPATCH] Type: ${type} | Desc: ${description}`);

    // 1. Create the Emergency Alert Record
    const alert = await this.prisma.emergencyAlert.create({
      data: {
        type,
        description,
        status: 'ACTIVE',
      },
    });

    // 2. Fetch all users in the EMERGENCY_TEAM role
    const emergencyTeam = await this.prisma.user.findMany({
      where: { role: 'EMERGENCY_TEAM' },
      include: { agentProfile: true },
    });

    if (emergencyTeam.length === 0) {
      this.logger.warn('No EMERGENCY_TEAM users found to dispatch alerts to.');
    } else {
      this.logger.log(`Dispatching alerts to ${emergencyTeam.length} team members...`);
      for (const member of emergencyTeam) {
        // Here we simulate the API integration for SMS/Voice since we don't have production Exotel keys
        const phone = member.agentProfile?.phone || member.email;
        this.logger.log(`-> (SIMULATED) Sending high-priority SMS to ${member.email} (Phone: ${phone})`);
        this.logger.log(`-> (SIMULATED) Dispatching automated voice call to ${phone}`);
      }
    }

    // 3. Broadcast internal event to trigger real-time UI banners via WebSockets / Automation Engine
    this.eventEmitter.emit('emergency.triggered', alert);

    return {
      message: 'Emergency alert dispatched successfully.',
      alertId: alert.id,
      dispatchedCount: emergencyTeam.length,
    };
  }
}
