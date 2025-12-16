import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  discord: {
    publicKey: process.env.DISCORD_PUBLIC_KEY || '',
    botToken: process.env.DISCORD_BOT_TOKEN || '',
    pmUserId: process.env.PM_USER_ID || '1258331291846185033',
  },
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DISCORD_PUBLIC_KEY',
  'DISCORD_BOT_TOKEN',
  'GOOGLE_SPREADSHEET_ID',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file with the required variables.');
  console.error('See .env.example for reference.');
}
