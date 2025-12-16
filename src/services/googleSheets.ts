import { google } from 'googleapis';
import { TicketData } from '../types';

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string, credentialsPath?: string) {
    this.spreadsheetId = spreadsheetId;

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath || process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendTicketData(ticketData: TicketData): Promise<void> {
    try {
      const values = [
        [
          ticketData.request_id,
          ticketData.ticket_type,
          ticketData.ticket_title,
          ticketData.ticket_description,
          ticketData.assignee,
          ticketData.start_date,
          ticketData.due_date,
          ticketData.story_point,
          ticketData.requester_id,
          ticketData.requester_name,
          ticketData.status,
          ticketData.jira_key,
          ticketData.timestamp,
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'ticket_requests!A:M',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      console.log('✅ Ticket data saved to Google Sheets');
    } catch (error) {
      console.error('❌ Error saving to Google Sheets:', error);
      throw error;
    }
  }

  async updateTicketStatus(requestId: string, status: string, jiraKey?: string): Promise<void> {
    try {
      // Find the row with the matching request_id
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'ticket_requests!A:M',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === requestId);

      if (rowIndex === -1) {
        throw new Error(`Ticket with request_id ${requestId} not found`);
      }

      // Update status (column K) and optionally jira_key (column L)
      const updates = [
        {
          range: `ticket_requests!K${rowIndex + 1}`,
          values: [[status]],
        },
      ];

      if (jiraKey) {
        updates.push({
          range: `ticket_requests!L${rowIndex + 1}`,
          values: [[jiraKey]],
        });
      }

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW',
        },
      });

      console.log('✅ Ticket status updated in Google Sheets');
    } catch (error) {
      console.error('❌ Error updating ticket status:', error);
      throw error;
    }
  }
}
