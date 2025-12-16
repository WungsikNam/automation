# Discord Ticket Master - PM Reminder Automation

This repository contains n8n workflows for automating Discord ticket management and PM notifications.

## Overview

The **Discord Ticket PM Reminder** workflow automatically monitors pending ticket requests and sends reminder messages to the project manager via Discord DM every 2 hours.

## Workflow: discord-ticket-pm-reminder.json

### Description

This workflow checks for pending tickets that have been waiting for approval for more than 2 hours and sends a consolidated reminder to the PM via Discord direct message.

### Workflow Steps

1. **Schedule Trigger**: Runs every 2 hours
2. **Read All Tickets**: Fetches all tickets from Google Sheets (`ticket_requests` sheet)
3. **Filter Pending Tickets**: Filters tickets with `status='pending'` and older than 2 hours (based on `request_id` timestamp)
4. **Check Has Pending**: Validates if there are any pending tickets
5. **Prepare Reminder Message**: Builds a formatted message listing all pending tickets with time pending
6. **Create PM DM Channel**: Opens a DM channel with the PM user via Discord API
7. **Send Reminder**: Sends the reminder message to the PM

### Setup Requirements

#### 1. Google Sheets Setup

Your Google Sheet should have a `ticket_requests` sheet with the following columns:

- `request_id`: Timestamp (milliseconds) when the ticket was created
- `ticket_title`: Title/description of the ticket
- `status`: Current status (`pending`, `approved`, `rejected`, etc.)
- Additional columns as needed

Example structure:
```
| request_id    | ticket_title           | status  | ...
|---------------|------------------------|---------|
| 1702742400000 | Add new feature X      | pending |
| 1702828800000 | Fix bug in module Y    | approved|
| 1702915200000 | Update documentation   | pending |
```

#### 2. n8n Credentials Configuration

Before importing the workflow, you need to configure the following credentials in your n8n instance:

##### Google Sheets API Credential

1. Go to n8n Settings → Credentials
2. Create new credential → Google Sheets API
3. Follow the OAuth2 authentication process
4. Name it: `Google Sheets - Ticket Master`
5. Note the credential ID

##### Discord Bot Authentication

1. Create a Discord Bot in the [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable the following bot permissions:
   - Send Messages
   - Read Messages
   - Use Slash Commands
3. Copy the Bot Token
4. In n8n, create a new HTTP Header Auth credential:
   - Name: `Discord Bot Auth`
   - Header Name: `Authorization`
   - Header Value: `Bot YOUR_BOT_TOKEN_HERE`
5. Note the credential ID

#### 3. Workflow Configuration

After importing the workflow into n8n, update the following values:

1. **Read All Tickets Node**:
   - `documentId`: Replace `YOUR_SPREADSHEET_ID_HERE` with your Google Sheets ID
   - `credentials.googleSheetsApi.id`: Replace with your Google Sheets credential ID

2. **Prepare Reminder Message Node**:
   - `PM_USER_ID`: Replace `"1258331291846185033"` with your PM's Discord User ID
   - (To get a Discord User ID: Enable Developer Mode in Discord → Right-click user → Copy User ID)

3. **Create PM DM Channel & Send Reminder Nodes**:
   - `credentials.httpHeaderAuth.id`: Replace with your Discord Bot Auth credential ID

### Import Instructions

1. Open your n8n instance
2. Click on "Workflows" → "Import from File" (or press Ctrl+I)
3. Select `workflows/discord-ticket-pm-reminder.json`
4. Update all configuration values as described above
5. Test the workflow with sample data
6. Activate the workflow

### Testing

To test the workflow without waiting for the schedule:

1. Click "Execute Workflow" in n8n
2. Check that:
   - Google Sheets data is being read correctly
   - Pending tickets are filtered properly
   - Message format looks correct
   - Discord DM is received by the PM

### Message Format

The PM receives a message in Korean with the following format:

```
⏰ **승인 대기 중인 티켓이 2개 있습니다**

• **Add new feature X** (3시간 전 요청)
• **Update documentation** (1시간 전 요청)

확인 부탁드립니다!
```

Translation: "There are 2 tickets waiting for approval" followed by the ticket list and "Please check!"

### Customization

#### Change Reminder Interval

Edit the **Schedule Trigger** node and modify the `hoursInterval` value (currently set to 2 hours).

#### Change Time Threshold

Edit the **Filter Pending Tickets** node and modify this line:
```javascript
const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
```

For example, to change to 4 hours:
```javascript
const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
```

#### Customize Message Language/Format

Edit the **Prepare Reminder Message** node and modify the message template:
```javascript
message: `⏰ **승인 대기 중인 티켓이 ${pendingTickets.length}개 있습니다**\\n\\n${ticketList}\\n\\n확인 부탁드립니다!`
```

## Troubleshooting

### Workflow not executing
- Check that the workflow is activated (toggle in top-right corner)
- Verify the schedule trigger is configured correctly

### Google Sheets connection issues
- Ensure OAuth2 credentials are still valid
- Check that the spreadsheet ID is correct
- Verify the sheet name is exactly `ticket_requests`

### Discord DM not received
- Verify the Bot Token is correct and active
- Ensure the PM User ID is correct
- Check that the bot shares at least one server with the PM user
- Verify bot permissions include DM sending

### No tickets found
- Check the `dataStartRow` is set to 2 (row 1 is headers)
- Verify column names match expected values
- Ensure `request_id` values are numeric timestamps

## Repository Structure

```
automation/
├── workflows/
│   └── discord-ticket-pm-reminder.json
└── README.md
```

## Version

Current version: 1.0.0

## License

This workflow is provided as-is for internal use.

## Contributing

To add new workflows to this repository:

1. Create a new branch
2. Add your workflow JSON file to the `workflows/` directory
3. Update this README with documentation
4. Submit a pull request

## Support

For issues or questions, please contact the automation team.
