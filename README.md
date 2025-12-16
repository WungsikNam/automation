# Discord Ticket Master - Approval Handler

This n8n workflow automates the approval/rejection process for Discord ticket requests, integrating with Google Sheets and JIRA.

## Overview

The workflow handles Discord button interactions for ticket approval/rejection, automatically creates JIRA issues for approved tickets, updates Google Sheets status, and notifies requesters via Discord DM.

## Workflow Flow

### 1. Approval Path (When ticket is approved)
1. **Approval Webhook** - Receives Discord interaction POST request
2. **Parse Button Click** - Extracts action, requestId, userId from interaction
3. **Read All Tickets** - Fetches all tickets from Google Sheets
4. **Find Ticket** - Locates the specific ticket by request_id
5. **Check Approval Action** - Routes to approval or rejection path
6. **Create JIRA Ticket** - Creates new JIRA issue with ticket details
7. **Prepare Approved Update** - Adds JIRA key and updates status to 'approved'
8. **Update Sheets - Approved** - Updates Google Sheets with approval status
9. **Create Requester DM** - Opens DM channel with ticket requester
10. **Notify Requester - Approved** - Sends approval notification with JIRA link
11. **Acknowledge Approval** - Responds to Discord interaction

### 2. Rejection Path (When ticket is rejected)
1. Steps 1-5 are the same as approval path
2. **Prepare Rejected Update** - Sets status to 'rejected'
3. **Update Sheets - Rejected** - Updates Google Sheets with rejection status
4. **Create Requester DM - Reject** - Opens DM channel with requester
5. **Notify Requester - Rejected** - Sends rejection notification
6. **Acknowledge Rejection** - Responds to Discord interaction

## Configuration Required

Before using this workflow, you need to configure the following:

### 1. Google Sheets Credentials
- **Credential ID**: Replace `YOUR_GOOGLE_SHEETS_CREDENTIAL_ID` with your Google Sheets API credential
- **Spreadsheet ID**: Replace `YOUR_SPREADSHEET_ID_HERE` with your actual spreadsheet ID
- **Sheet Name**: `ticket_requests` (or customize as needed)

### 2. JIRA Credentials
- **Credential ID**: Replace `YOUR_JIRA_CREDENTIAL_ID` with your JIRA Cloud API credential
- **Project Key**: Replace `YOUR_JIRA_PROJECT_KEY` with your JIRA project key
- **Domain**: Replace `YOUR-DOMAIN.atlassian.net` with your JIRA domain

### 3. Discord Credentials
- **Credential ID**: Replace `YOUR_DISCORD_CREDENTIAL_ID` with your Discord Bot Auth credential
- The Discord bot must have permissions to:
  - Send DMs to users
  - Receive and respond to interactions

## Expected Data Structure

### Discord Interaction Format
```javascript
{
  "data": {
    "custom_id": "approve_ticket_REQUEST_ID" // or "reject_ticket_REQUEST_ID"
  },
  "member": {
    "user": {
      "id": "USER_ID",
      "username": "USERNAME"
    }
  },
  "message": {
    "id": "MESSAGE_ID"
  },
  "channel_id": "CHANNEL_ID"
}
```

### Google Sheets Structure
Expected columns in `ticket_requests` sheet:
- `request_id` - Unique identifier for the ticket
- `ticket_title` - Title of the ticket
- `ticket_description` - Detailed description
- `ticket_type` - JIRA issue type
- `assignee` - JIRA assignee
- `due_date` - Due date for the ticket
- `requester_id` - Discord user ID of requester
- `status` - Current status (pending/approved/rejected)
- `jira_key` - JIRA ticket key (populated after approval)

## Setup Instructions

1. **Import the workflow** into your n8n instance:
   - Navigate to n8n workflows
   - Click "Import from File"
   - Select `workflows/discord-ticket-approval-handler.json`

2. **Configure credentials**:
   - Set up Google Sheets API credentials
   - Set up JIRA Cloud API credentials (OAuth2)
   - Set up Discord Bot HTTP Header Auth

3. **Update configuration values**:
   - Replace all placeholder IDs with actual values
   - Update JIRA domain
   - Verify sheet name matches your Google Sheets

4. **Test the webhook**:
   - Activate the workflow
   - Note the webhook URL from the "Approval Webhook" node
   - Configure Discord to send interactions to this URL

## Webhook Endpoint

The workflow exposes a webhook endpoint at:
```
https://your-n8n-instance.com/webhook/ticket-approval
```

Configure this URL as your Discord interaction endpoint.

## Discord Response Format

The workflow uses Discord interaction response type 4 (CHANNEL_MESSAGE_WITH_SOURCE) with flags 64 (EPHEMERAL) to send private responses visible only to the user who clicked the button.

## Error Handling

- If a ticket is not found, the workflow throws an error: `Ticket not found: REQUEST_ID`
- Ensure all required fields are present in the Google Sheets data
- Verify Discord bot has proper permissions

## Localization

Messages are currently in Korean (한국어). To customize:
- Edit the `jsonBody` content in notification nodes
- Update the response messages in acknowledgment nodes

## Version

- **Version**: 1.0.0
- **n8n Execution Order**: v1
- **Instance ID**: discord-ticket-master
