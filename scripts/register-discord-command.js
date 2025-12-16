#!/usr/bin/env node

/**
 * Discord Slash Command 등록 스크립트 (Node.js 버전)
 * 사용법: node register-discord-command.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// .env 파일 로드
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

// 환경 변수
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// 환경 변수 확인
if (!BOT_TOKEN || !APPLICATION_ID || !GUILD_ID) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('📝 .env 파일을 생성하고 다음 값을 설정하세요:');
  console.error('  DISCORD_BOT_TOKEN=your_token');
  console.error('  DISCORD_APPLICATION_ID=your_app_id');
  console.error('  DISCORD_GUILD_ID=your_guild_id');
  process.exit(1);
}

const command = {
  name: 'create-ticket',
  type: 1,
  description: '새로운 티켓을 생성합니다'
};

const options = {
  hostname: 'discord.com',
  port: 443,
  path: `/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
  method: 'POST',
  headers: {
    'Authorization': `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

console.log('🤖 Discord Slash Command 등록 중...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Slash Command 등록 성공!');
      console.log('응답:', JSON.parse(data));
      console.log('');
      console.log('📝 다음 단계:');
      console.log('1. Discord Developer Portal에서 INTERACTIONS ENDPOINT URL 설정');
      console.log('2. URL: [n8n_webhook_url]/discord-interaction');
      console.log('3. Discord 서버에서 /create-ticket 명령어 테스트');
    } else {
      console.error(`❌ Slash Command 등록 실패 (HTTP ${res.statusCode})`);
      console.error('응답:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 요청 오류:', error);
  process.exit(1);
});

req.write(JSON.stringify(command));
req.end();
