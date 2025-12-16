# Discord Ticket Master - Endpoint

A TypeScript/Node.js API endpoint that handles Discord interactions for a ticket management system. This endpoint replaces the n8n workflow with a standalone service that can be deployed independently.

## Features

- ✅ Discord interaction webhook handling
- ✅ Modal-based ticket creation form
- ✅ Google Sheets integration for ticket storage
- ✅ Automatic PM notification via Discord DM
- ✅ Type-safe TypeScript implementation
- ✅ Express.js web server
- ✅ Discord signature verification

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Discord   │────────▶│  POST /discord-  │────────▶│  Google Sheets  │
│    User     │         │   interaction    │         │   (Storage)     │
└─────────────┘         └──────────────────┘         └─────────────────┘
                                │
                                │
                                ▼
                        ┌──────────────────┐
                        │   Discord DM     │
                        │   (PM Approval)  │
                        └──────────────────┘
```

## Workflow

1. **User clicks button** → Discord sends interaction (type 2 or 3)
2. **Show modal** → Endpoint responds with modal form
3. **User submits modal** → Discord sends modal submit (type 5)
4. **Parse data** → Extract ticket information
5. **Save to Sheets** → Store in Google Sheets
6. **Notify PM** → Send DM with approval buttons

## Prerequisites

- Node.js 18+ and npm
- Discord Bot with:
  - Bot token
  - Public key
  - Interactions endpoint URL configured
- Google Cloud project with:
  - Sheets API enabled
  - Service account credentials
- Google Sheet with `ticket_requests` sheet

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Configuration

### 1. Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create or select your application
3. Copy the **Public Key** and **Bot Token**
4. Set the **Interactions Endpoint URL** to: `https://your-domain.com/discord-interaction`

### 2. Google Sheets Setup

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download credentials JSON
4. Save credentials as `credentials.json` in the project root
5. Create a Google Sheet with a sheet named `ticket_requests`
6. Share the sheet with the service account email
7. Copy the spreadsheet ID from the URL

### 3. Environment Variables

Edit `.env`:

```env
PORT=3000
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_BOT_TOKEN=Bot_your_token
PM_USER_ID=1258331291846185033
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

## Google Sheets Schema

The `ticket_requests` sheet should have these columns:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| request_id | ticket_type | ticket_title | ticket_description | assignee | start_date | due_date | story_point | requester_id | requester_name | status | jira_key | timestamp |

## Usage

### Development

```bash
# Run in development mode
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

### Testing

```bash
# Check health endpoint
curl http://localhost:3000/health

# Test Discord interaction (requires valid signature)
curl -X POST http://localhost:3000/discord-interaction \
  -H "Content-Type: application/json" \
  -H "X-Signature-Ed25519: <signature>" \
  -H "X-Signature-Timestamp: <timestamp>" \
  -d '{"type": 1}'
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /discord-interaction`

Discord interactions webhook.

**Headers:**
- `X-Signature-Ed25519`: Discord signature
- `X-Signature-Timestamp`: Timestamp

**Request Body:**
Discord interaction payload (varies by interaction type)

**Response:**
Discord interaction response (varies by interaction type)

## Project Structure

```
automation/
├── src/
│   ├── handlers/
│   │   └── interactionHandler.ts    # Discord interaction logic
│   ├── services/
│   │   ├── discord.ts                # Discord API client
│   │   └── googleSheets.ts           # Google Sheets client
│   ├── config.ts                     # Configuration
│   ├── server.ts                     # Express server
│   └── types.ts                      # TypeScript types
├── dist/                             # Compiled JavaScript
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── credentials.json                  # Google service account
├── package.json
├── tsconfig.json
└── README.md
```

## Interaction Flow Details

### Type 1: PING
Discord verification ping.
```json
Response: { "type": 1 }
```

### Type 2/3: APPLICATION_COMMAND / MESSAGE_COMPONENT
Button click to create ticket.
```json
Response: Modal with 5 input fields
```

### Type 5: MODAL_SUBMIT
User submits the ticket form.
```json
Response: Ephemeral acknowledgment message
Background: Save to Sheets + Send PM DM
```

## Deployment

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables in Production

Ensure these are set in your deployment environment:
- `DISCORD_PUBLIC_KEY`
- `DISCORD_BOT_TOKEN`
- `PM_USER_ID`
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`

## Troubleshooting

### Discord signature verification fails
- Ensure `DISCORD_PUBLIC_KEY` is correct
- Check that the request is coming from Discord
- Verify the endpoint URL is correctly configured

### Google Sheets errors
- Verify service account has edit access to the sheet
- Check that `ticket_requests` sheet exists
- Ensure credentials.json path is correct

### PM DM not sent
- Verify `PM_USER_ID` is correct
- Check bot has DM permissions
- Ensure bot token is valid

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
