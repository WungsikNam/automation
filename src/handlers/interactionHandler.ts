import { Request, Response } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { DiscordInteraction, DiscordResponse, TicketData } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';
import { DiscordService } from '../services/discord';

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
};

export class InteractionHandler {
  private googleSheets: GoogleSheetsService;
  private discord: DiscordService;
  private pmUserId: string;

  constructor(
    googleSheetsService: GoogleSheetsService,
    discordService: DiscordService,
    pmUserId: string
  ) {
    this.googleSheets = googleSheetsService;
    this.discord = discordService;
    this.pmUserId = pmUserId;
  }

  async handleInteraction(req: Request, res: Response): Promise<void> {
    const interaction: DiscordInteraction = req.body;

    // Handle PING (Discord verification)
    if (interaction.type === INTERACTION_TYPE.PING) {
      res.json({ type: 1 });
      return;
    }

    // Handle MESSAGE_COMPONENT (button click to show modal)
    if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND ||
        interaction.type === INTERACTION_TYPE.MESSAGE_COMPONENT) {
      const response = this.showTicketModal();
      res.json(response);
      return;
    }

    // Handle MODAL_SUBMIT
    if (interaction.type === INTERACTION_TYPE.MODAL_SUBMIT) {
      await this.handleModalSubmit(interaction, res);
      return;
    }

    // Unknown interaction type
    res.status(400).json({ error: 'Unknown interaction type' });
  }

  private showTicketModal(): DiscordResponse {
    return {
      type: 9,
      data: {
        title: '티켓 생성',
        custom_id: 'ticket_modal',
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'ticket_type',
                label: 'Ticket Type',
                style: 1,
                min_length: 1,
                max_length: 50,
                placeholder: '예: Bug, Feature, Task',
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'ticket_title',
                label: 'Ticket Title',
                style: 1,
                min_length: 1,
                max_length: 100,
                placeholder: '티켓 제목을 입력하세요',
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'ticket_description',
                label: 'Ticket Description',
                style: 2,
                min_length: 10,
                max_length: 4000,
                placeholder: '티켓 상세 내용을 입력하세요',
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'assignee',
                label: 'Assignee',
                style: 1,
                min_length: 1,
                max_length: 50,
                placeholder: '담당자 이름',
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'dates',
                label: 'Start Date ~ Due Date',
                style: 1,
                min_length: 1,
                max_length: 50,
                placeholder: '예: 2024-01-01 ~ 2024-01-15',
                required: true,
              },
            ],
          },
        ],
      },
    };
  }

  private async handleModalSubmit(interaction: DiscordInteraction, res: Response): Promise<void> {
    try {
      // Parse modal data
      const ticketData = this.parseModalData(interaction);

      // Send acknowledgment response immediately
      res.json({
        type: 4,
        data: {
          content: '✅ 티켓 요청이 접수되었습니다. PM 승인을 기다려주세요.',
          flags: 64, // Ephemeral message
        },
      });

      // Process asynchronously
      await this.processTicketRequest(ticketData);
    } catch (error) {
      console.error('❌ Error handling modal submit:', error);
      res.json({
        type: 4,
        data: {
          content: '❌ 티켓 처리 중 오류가 발생했습니다.',
          flags: 64,
        },
      });
    }
  }

  private parseModalData(interaction: DiscordInteraction): TicketData {
    const components = interaction.data?.components || [];

    const ticketType = components[0]?.components[0]?.value || '';
    const ticketTitle = components[1]?.components[0]?.value || '';
    const ticketDescription = components[2]?.components[0]?.value || '';
    const assignee = components[3]?.components[0]?.value || '';
    const dates = components[4]?.components[0]?.value || '';

    const [startDate, dueDate] = dates.split('~').map((d) => d.trim());

    const user = interaction.member?.user || interaction.user;
    const requesterId = user?.id || '';
    const requesterName = user?.username || '';
    const requestId = Date.now().toString();

    return {
      request_id: requestId,
      ticket_type: ticketType,
      ticket_title: ticketTitle,
      ticket_description: ticketDescription,
      assignee: assignee,
      start_date: startDate || '',
      due_date: dueDate || '',
      story_point: '',
      requester_id: requesterId,
      requester_name: requesterName,
      status: 'pending',
      jira_key: '',
      timestamp: new Date().toISOString(),
    };
  }

  private async processTicketRequest(ticketData: TicketData): Promise<void> {
    try {
      // Save to Google Sheets
      await this.googleSheets.appendTicketData(ticketData);

      // Create DM channel with PM
      const channelId = await this.discord.createDMChannel(this.pmUserId);

      // Send approval request to PM
      await this.discord.sendPMApprovalRequest(channelId, ticketData);

      console.log(`✅ Ticket ${ticketData.request_id} processed successfully`);
    } catch (error) {
      console.error('❌ Error processing ticket request:', error);
      throw error;
    }
  }
}
