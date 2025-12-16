import axios from 'axios';
import { TicketData } from '../types';

export class DiscordService {
  private botToken: string;
  private baseUrl = 'https://discord.com/api/v10';

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async createDMChannel(userId: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/@me/channels`,
        { recipient_id: userId },
        {
          headers: {
            Authorization: `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('❌ Error creating DM channel:', error);
      throw error;
    }
  }

  async sendPMApprovalRequest(channelId: string, ticketData: TicketData): Promise<void> {
    try {
      const message = {
        content: `🎫 **새로운 티켓 승인 요청**\n\n**요청자:** ${ticketData.requester_name}\n**Type:** ${ticketData.ticket_type}\n**Title:** ${ticketData.ticket_title}\n**Description:** ${ticketData.ticket_description}\n**Assignee:** ${ticketData.assignee}\n**기간:** ${ticketData.start_date} ~ ${ticketData.due_date}`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: '승인',
                style: 3,
                custom_id: `approve_ticket_${ticketData.request_id}`,
              },
              {
                type: 2,
                label: '거부',
                style: 4,
                custom_id: `reject_ticket_${ticketData.request_id}`,
              },
            ],
          },
        ],
      };

      await axios.post(`${this.baseUrl}/channels/${channelId}/messages`, message, {
        headers: {
          Authorization: `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ PM approval request sent');
    } catch (error) {
      console.error('❌ Error sending PM approval request:', error);
      throw error;
    }
  }

  async sendFollowupMessage(applicationId: string, interactionToken: string, content: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/webhooks/${applicationId}/${interactionToken}`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('❌ Error sending followup message:', error);
      throw error;
    }
  }
}
