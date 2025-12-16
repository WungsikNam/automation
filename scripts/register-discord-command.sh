#!/bin/bash

# Discord Slash Command 등록 스크립트
# 사용법: ./register-discord-command.sh

# .env 파일 로드
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '^#' | xargs)
fi

# 환경 변수 확인
if [ -z "$DISCORD_BOT_TOKEN" ] || [ -z "$DISCORD_APPLICATION_ID" ] || [ -z "$DISCORD_GUILD_ID" ]; then
  echo "❌ 환경 변수가 설정되지 않았습니다."
  echo "📝 .env 파일을 생성하고 다음 값을 설정하세요:"
  echo "  DISCORD_BOT_TOKEN=your_token"
  echo "  DISCORD_APPLICATION_ID=your_app_id"
  echo "  DISCORD_GUILD_ID=your_guild_id"
  exit 1
fi

BOT_TOKEN="$DISCORD_BOT_TOKEN"
APPLICATION_ID="$DISCORD_APPLICATION_ID"
GUILD_ID="$DISCORD_GUILD_ID"

echo "🤖 Discord Slash Command 등록 중..."

# /create-ticket 명령어 등록
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bot ${BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "create-ticket",
    "type": 1,
    "description": "새로운 티켓을 생성합니다"
  }' \
  "https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
  echo "✅ Slash Command 등록 성공!"
  echo "응답: $body"
else
  echo "❌ Slash Command 등록 실패 (HTTP $http_code)"
  echo "응답: $body"
  exit 1
fi

echo ""
echo "📝 다음 단계:"
echo "1. Discord Developer Portal에서 INTERACTIONS ENDPOINT URL 설정"
echo "2. URL: [n8n_webhook_url]/discord-interaction"
echo "3. Discord 서버에서 /create-ticket 명령어 테스트"
