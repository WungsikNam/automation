# 상세 설정 가이드

이 문서는 n8n Discord Ticket Master의 상세 설정 과정을 설명합니다.

## 목차

1. [Discord Bot 설정](#1-discord-bot-설정)
2. [Google Sheets 설정](#2-google-sheets-설정)
3. [JIRA 설정](#3-jira-설정)
4. [n8n 설정](#4-n8n-설정)
5. [워크플로우 임포트](#5-워크플로우-임포트)
6. [최종 확인](#6-최종-확인)

---

## 1. Discord Bot 설정

### 1.1 Bot Token 확인

현재 프로젝트에서 사용 중인 Bot:
```
Bot Token: YOUR_BOT_TOKEN_HERE
Application ID: YOUR_APPLICATION_ID
Guild ID: YOUR_GUILD_ID
```

### 1.2 Bot 권限 확인

Discord Developer Portal에서 다음 권한이 활성화되어 있는지 확인:

**Bot Permissions:**
- ✅ Send Messages
- ✅ Send Messages in Threads
- ✅ Use Slash Commands
- ✅ Read Message History

**OAuth2 Scopes:**
- ✅ bot
- ✅ applications.commands

### 1.3 Slash Command 등록

#### 방법 1: Shell Script 사용

```bash
cd scripts
chmod +x register-discord-command.sh
./register-discord-command.sh
```

#### 방법 2: Node.js Script 사용

```bash
cd scripts
node register-discord-command.js
```

#### 방법 3: cURL 직접 사용

```bash
curl -X POST \
  -H "Authorization: Bot YOUR_BOT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "create-ticket",
    "type": 1,
    "description": "새로운 티켓을 생성합니다"
  }' \
  "https://discord.com/api/v10/applications/YOUR_APPLICATION_ID/guilds/YOUR_GUILD_ID/commands"
```

### 1.4 Interactions Endpoint URL 설정

1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. Application 선택 (ID: YOUR_APPLICATION_ID)
3. "General Information" 탭 이동
4. "INTERACTIONS ENDPOINT URL" 설정:
   ```
   https://your-n8n-instance.com/webhook/discord-interaction
   ```
5. "Save Changes" 클릭

⚠️ **중요**: n8n 워크플로우 1을 먼저 활성화해야 URL 검증이 성공합니다.

---

## 2. Google Sheets 설정

자세한 내용은 [templates/google-sheets-setup.md](../templates/google-sheets-setup.md)를 참고하세요.

### 2.1 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: `Discord Ticket Master`
4. 시트 이름: `ticket_requests`

### 2.2 헤더 설정

1행에 다음 헤더 추가:
```
request_id | ticket_type | ticket_title | ticket_description | assignee | start_date | due_date | story_point | requester_id | requester_name | status | jira_key
```

또는 CSV 파일 임포트:
```bash
# templates/google-sheets-schema.csv 다운로드
# Google Sheets에서 "파일" > "가져오기" 사용
```

### 2.3 Service Account 설정

#### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성: `Discord Ticket Master`
3. Google Sheets API 활성화:
   - "API 및 서비스" > "라이브러리"
   - "Google Sheets API" 검색 및 활성화

#### Service Account 생성

1. "API 및 서비스" > "사용자 인증 정보"
2. "사용자 인증 정보 만들기" > "서비스 계정"
3. 정보 입력:
   - 이름: `n8n-ticket-master`
   - 역할: `편집자`
4. "키 추가" > "새 키 만들기" > "JSON"
5. JSON 파일 다운로드

#### 스프레드시트 공유

1. JSON 파일에서 `client_email` 복사
   ```json
   {
     "client_email": "n8n-ticket-master@project-id.iam.gserviceaccount.com"
   }
   ```
2. Google Sheets에서 "공유" 클릭
3. Service Account 이메일 추가
4. 권한: `편집자` 선택

### 2.4 스프레드시트 ID 확인

URL에서 ID 추출:
```
https://docs.google.com/spreadsheets/d/1abc123def456/edit
                                       ↑
                                  이 부분이 ID
```

---

## 3. JIRA 설정

### 3.1 API Token 생성

1. [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens) 접속
2. "Create API token" 클릭
3. Label 입력: `n8n Discord Ticket Master`
4. Token 복사 및 안전하게 보관

### 3.2 필요한 정보 수집

다음 정보를 확인하세요:

1. **JIRA 도메인**:
   ```
   https://YOUR_DOMAIN.atlassian.net
   예: https://mycompany.atlassian.net
   → YOUR_DOMAIN: mycompany
   ```

2. **Project Key**:
   - JIRA 프로젝트 설정 > "Details" 확인
   - 예: `PROJ`, `TICKET`, `DEV`

3. **Issue Types**:
   - 사용 가능한 Issue Type 확인
   - 예: `Bug`, `Task`, `Story`, `Feature`

4. **Assignee 이름**:
   - JIRA 사용자 이름 확인
   - 예: `john.doe`, `jane.smith`

### 3.3 권한 확인

API Token을 사용할 계정이 다음 권한을 가지고 있는지 확인:
- ✅ 프로젝트에서 이슈 생성 가능
- ✅ 이슈에 담당자 할당 가능
- ✅ 이슈 필드 편집 가능

---

## 4. n8n 설정

### 4.1 Credential 추가

#### Credential 1: Discord Bot Auth

1. n8n > "Credentials" > "Add Credential"
2. Type: `Header Auth`
3. 설정:
   ```
   Name: Discord Bot Auth
   Header Name: Authorization
   Header Value: Bot YOUR_BOT_TOKEN_HERE
   ```
4. "Save" 클릭

#### Credential 2: Google Sheets API

1. Type: `Google Sheets OAuth2 API` 또는 `Service Account`
2. **Service Account 사용 권장**:
   ```
   Name: Google Sheets - Ticket Master
   Service Account Email: [JSON 파일의 client_email]
   Private Key: [JSON 파일의 private_key 전체 복사]
   ```
3. "Save" 클릭

#### Credential 3: JIRA Cloud API

1. Type: `Jira Cloud API`
2. 설정:
   ```
   Name: JIRA Cloud API
   Email: your-jira-email@example.com
   API Token: [생성한 API Token]
   Domain: YOUR_DOMAIN.atlassian.net
   ```
3. "Save" 클릭

### 4.2 Credential ID 확인

각 Credential 저장 후 ID를 기록하세요:
```
Discord Bot Auth ID: _____________
Google Sheets Credential ID: _____________
JIRA Credential ID: _____________
```

이 ID들은 워크플로우 JSON 파일에서 사용됩니다.

---

## 5. 워크플로우 임포트

### 5.1 워크플로우 1: 티켓 생성 플로우

1. n8n에서 "Workflows" > "Import from File" 클릭
2. `workflows/1-ticket-creation-flow.json` 선택
3. 다음 값을 수정:

   **Google Sheets 노드:**
   ```json
   "documentId": "YOUR_SPREADSHEET_ID"
   ```

   **모든 HTTP Request 노드 (Discord):**
   ```json
   "credentials": {
     "httpHeaderAuth": {
       "id": "YOUR_DISCORD_BOT_CREDENTIAL_ID"
     }
   }
   ```

4. "Save" 클릭
5. 워크플로우 **활성화**

### 5.2 워크플로우 2: 승인/거부 처리 플로우

1. `workflows/2-approval-flow.json` 임포트
2. 다음 값을 수정:

   **Google Sheets 노드:**
   ```json
   "documentId": "YOUR_SPREADSHEET_ID"
   ```

   **JIRA 노드:**
   ```json
   "project": "YOUR_PROJECT_KEY"
   ```

   **HTTP Request 노드 (JIRA 링크):**
   ```
   https://YOUR_DOMAIN.atlassian.net/browse/...
   ```

3. "Save" 클릭
4. 워크플로우 **활성화**

### 5.3 워크플로우 3: 리마인더 플로우

1. `workflows/3-reminder-flow.json` 임포트
2. Google Sheets ID 수정
3. "Save" 클릭
4. 워크플로우 **활성화**

### 5.4 Webhook URL 확인

워크플로우 1의 Webhook 노드에서 Production URL 복사:
```
https://your-n8n-instance.com/webhook/discord-interaction
```

이 URL을 Discord Developer Portal의 INTERACTIONS ENDPOINT URL에 설정합니다.

---

## 6. 최종 확인

### 6.1 체크리스트

- [ ] Discord Slash Command 등록 완료
- [ ] Discord Interactions Endpoint URL 설정 완료
- [ ] Google Sheets 스프레드시트 생성 및 헤더 설정
- [ ] Service Account 생성 및 권한 부여
- [ ] JIRA API Token 생성
- [ ] n8n Credential 3개 추가 완료
- [ ] 워크플로우 3개 임포트 및 수정 완료
- [ ] 모든 워크플로우 활성화 완료

### 6.2 연결 테스트

#### Discord Webhook 테스트

워크플로우 1에서 "Test webhook" 클릭 후:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"type": 1}' \
  https://your-n8n-instance.com/webhook/discord-interaction
```

#### Google Sheets 테스트

워크플로우에서 Google Sheets 노드 테스트 실행

#### JIRA 테스트

워크플로우에서 JIRA 노드 테스트 실행

### 6.3 엔드-투-엔드 테스트

1. Discord 서버에서 `/create-ticket` 입력
2. Modal 폼 작성 및 제출
3. Google Sheets에 데이터 추가 확인
4. PM에게 DM 전송 확인
5. PM 계정에서 "승인" 클릭
6. JIRA 티켓 생성 확인
7. 요청자에게 알림 전송 확인

---

## 문제 해결

설정 중 문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요.

## 다음 단계

- [테스트 가이드](./TESTING.md) 확인
- 팀원들에게 사용법 공유
- 커스터마이징 (필드 추가, 알림 메시지 수정 등)
