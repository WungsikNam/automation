import express, { Request, Response } from 'express';
import { verifyKey } from 'discord-interactions';
import { config } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { DiscordService } from './services/discord';
import { InteractionHandler } from './handlers/interactionHandler';

const app = express();

// Middleware to verify Discord requests
const verifyDiscordRequest = (req: Request, res: Response, next: any) => {
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');

  if (!signature || !timestamp) {
    return res.status(401).send('Invalid request signature');
  }

  const isValidRequest = verifyKey(
    JSON.stringify(req.body),
    signature,
    timestamp,
    config.discord.publicKey
  );

  if (!isValidRequest) {
    return res.status(401).send('Bad request signature');
  }

  next();
};

// Parse JSON body
app.use(express.json());

// Initialize services
const googleSheets = new GoogleSheetsService(
  config.googleSheets.spreadsheetId,
  config.googleSheets.credentialsPath
);

const discord = new DiscordService(config.discord.botToken);

const interactionHandler = new InteractionHandler(
  googleSheets,
  discord,
  config.discord.pmUserId
);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Discord interaction webhook endpoint
app.post('/discord-interaction', verifyDiscordRequest, async (req: Request, res: Response) => {
  await interactionHandler.handleInteraction(req, res);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Discord Ticket Endpoint Server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/discord-interaction`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
