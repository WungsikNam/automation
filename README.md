# n8n Discord Ticket Master

Discord 봇을 통해 티켓을 생성하고, Google Sheets에 저장하며, PM 승인 후 JIRA에 자동 생성하는 자동화 시스템입니다.

## 🎯 주요 기능

- **Discord Slash Command**: `/create-ticket` 명령어로 티켓 생성
- **Modal 입력 폼**: 사용자 친화적인 티켓 정보 입력
- **Google Sheets 저장**: 모든 티켓 요청 기록 보관
- **PM 승인 워크플로우**: Discord DM을 통한 승인/거부
- **JIRA 자동 생성**: 승인된 티켓 자동 JIRA 등록
- **자동 리마인더**: 2시간마다 미승인 티켓 알림

## 📋 시스템 구성

- **Discord Bot**: 티켓 생성 및 알림
- **Google Sheets**: 티켓 데이터베이스
- **JIRA Cloud**: 최종 티켓 저장소
- **n8n**: 워크플로우 자동화 엔진

## 🚀 빠른 시작

### 1. 필수 요구사항

- n8n 인스턴스 (클라우드 또는 셀프 호스팅)
- Discord Bot Token
- Google Cloud Service Account
- JIRA Cloud API Token

### 2. 환경 변수 설정

1. `.env.example` 파일을 `.env`로 복사:
   ```bash
   cp .env.example .env
   ```

2. `.env` 파일에 실제 값 입력:
   ```bash
   # Discord Developer Portal에서 확인
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_APPLICATION_ID=your_application_id_here
   DISCORD_GUILD_ID=your_guild_id_here
   DISCORD_PM_USER_ID=your_pm_user_id_here

   # Google Sheets ID
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

   # JIRA 설정
   JIRA_DOMAIN=your_domain.atlassian.net
   JIRA_PROJECT_KEY=YOUR_PROJECT_KEY
   JIRA_API_TOKEN=your_jira_api_token_here
   JIRA_EMAIL=your_email@example.com
   ```

⚠️ **보안 주의**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

### 3. 설치 단계

#### Step 1: Discord 설정

1. Discord Slash Command 등록:
   ```bash
   cd scripts
   chmod +x register-discord-command.sh
   ./register-discord-command.sh
   ```

   또는 Node.js 사용:
   ```bash
   node register-discord-command.js
   ```

2. Discord Developer Portal에서 Interactions Endpoint URL 설정:
   - URL: `https://your-n8n-instance.com/webhook/discord-interaction`

#### Step 2: Google Sheets 설정

1. [Google Sheets 설정 가이드](./templates/google-sheets-setup.md) 참고
2. Service Account 생성 및 JSON 키 다운로드
3. 스프레드시트 생성 및 헤더 설정
4. Service Account에 편집 권한 부여

#### Step 3: JIRA 설정

1. JIRA Cloud API Token 생성:
   - [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - "Create API token" 클릭
   - 토큰 복사 및 안전하게 보관

2. JIRA Project Key 확인:
   - 프로젝트 설정에서 Key 확인 (예: PROJ)

#### Step 4: n8n 워크플로우 임포트

1. n8n 접속
2. Credentials 추가:
   - Discord Bot Auth (HTTP Header Auth)
   - Google Sheets API (Service Account)
   - JIRA Cloud API (OAuth2)

3. 워크플로우 임포트:
   - `workflows/1-ticket-creation-flow.json`
   - `workflows/2-approval-flow.json`
   - `workflows/3-reminder-flow.json`

4. 각 워크플로우에서 다음 값 수정:
   - `YOUR_SPREADSHEET_ID`: Google Sheets ID
   - `YOUR_GOOGLE_SHEETS_CREDENTIAL_ID`: Google Sheets Credential
   - `YOUR_DISCORD_BOT_CREDENTIAL_ID`: Discord Bot Credential
   - `YOUR_JIRA_CREDENTIAL_ID`: JIRA Credential
   - `YOUR_PROJECT_KEY`: JIRA Project Key
   - `YOUR_DOMAIN`: JIRA 도메인 (예: mycompany)

5. 모든 워크플로우 활성화

## 📁 프로젝트 구조

```
.
├── workflows/              # n8n 워크플로우 JSON 파일
│   ├── 1-ticket-creation-flow.json
│   ├── 2-approval-flow.json
│   └── 3-reminder-flow.json
├── scripts/               # 유틸리티 스크립트
│   ├── register-discord-command.sh
│   └── register-discord-command.js
├── templates/             # 템플릿 파일
│   ├── google-sheets-schema.csv
│   └── google-sheets-setup.md
├── docs/                  # 문서
│   ├── SETUP.md
│   ├── TESTING.md
│   └── TROUBLESHOOTING.md
└── README.md
```

## 🔄 워크플로우 설명

### 워크플로우 1: 티켓 생성 플로우

1. Discord에서 `/create-ticket` 명령어 입력
2. Modal 폼 표시
3. 사용자 정보 입력 (Type, Title, Description, Assignee, Dates)
4. Google Sheets에 저장
5. PM에게 DM으로 승인 요청 전송

### 워크플로우 2: 승인/거부 처리 플로우

**승인 시:**
1. PM이 "승인" 버튼 클릭
2. JIRA에 티켓 생성
3. Google Sheets 상태 업데이트 (approved)
4. 요청자에게 완료 알림 전송

**거부 시:**
1. PM이 "거부" 버튼 클릭
2. Google Sheets 상태 업데이트 (rejected)
3. 요청자에게 거부 알림 전송

### 워크플로우 3: 리마인더 플로우

1. 2시간마다 자동 실행
2. Google Sheets에서 pending 티켓 조회
3. 2시간 이상 대기 중인 티켓 필터링
4. PM에게 리마인더 DM 전송

## 📊 Google Sheets 스키마

| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| request_id | 고유 ID (timestamp) | 1702800000000 |
| ticket_type | 티켓 유형 | Bug, Feature, Task |
| ticket_title | 티켓 제목 | 로그인 버튼 오류 |
| ticket_description | 상세 설명 | 크롬에서 로그인... |
| assignee | 담당자 | john.doe |
| start_date | 시작일 | 2024-12-16 |
| due_date | 마감일 | 2024-12-20 |
| story_point | 스토리 포인트 | 5 |
| requester_id | 요청자 Discord ID | 1234567890 |
| requester_name | 요청자 이름 | sam_dev |
| status | 상태 | pending/approved/rejected |
| jira_key | JIRA 티켓 키 | PROJ-123 |

## 🧪 테스트

자세한 테스트 가이드는 [TESTING.md](./docs/TESTING.md)를 참고하세요.

### 기본 테스트 시나리오

1. **티켓 생성 테스트**
   - Discord에서 `/create-ticket` 입력
   - Modal 폼 작성 및 제출
   - Google Sheets에 데이터 확인
   - PM DM 수신 확인

2. **승인 테스트**
   - PM 계정으로 "승인" 버튼 클릭
   - JIRA 티켓 생성 확인
   - 요청자 알림 수신 확인

3. **거부 테스트**
   - PM 계정으로 "거부" 버튼 클릭
   - Google Sheets 상태 확인
   - 요청자 알림 수신 확인

4. **리마인더 테스트**
   - n8n에서 워크플로우 3 수동 실행
   - PM에게 리마인더 DM 확인

## 🔧 문제 해결

일반적인 문제와 해결 방법은 [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)를 참고하세요.

### 자주 발생하는 오류

1. **Discord API 401 Unauthorized**
   - Bot Token 확인
   - Credential 설정 확인

2. **Google Sheets Permission Denied**
   - Service Account 권한 확인
   - 스프레드시트 공유 설정 확인

3. **JIRA API 400 Bad Request**
   - Project Key 확인
   - Issue Type 존재 여부 확인
   - Assignee가 JIRA에 존재하는지 확인

## 📝 개발 노트

### n8n Credential 설정

#### 1. Discord Bot Auth (HTTP Header Auth)
```
Name: Discord Bot Auth
Header Name: Authorization
Header Value: Bot YOUR_BOT_TOKEN
```

#### 2. Google Sheets (Service Account)
```
Name: Google Sheets - Ticket Master
Service Account Email: [from JSON]
Private Key: [from JSON]
```

#### 3. JIRA Cloud API
```
Name: JIRA Cloud API
Email: your-email@example.com
API Token: YOUR_API_TOKEN
Domain: your-domain.atlassian.net
```

## 🤝 기여

개선 사항이나 버그 리포트는 이슈로 등록해 주세요.

## 📄 라이선스

MIT License

## 🔗 관련 링크

- [n8n Documentation](https://docs.n8n.io/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Google Cloud Console](https://console.cloud.google.com/)
- [JIRA Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
