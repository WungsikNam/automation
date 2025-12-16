# 🚀 n8n Discord Ticket Master 설정 체크리스트

실제로 수행해야 할 단계들을 체크하면서 진행하세요.

---

## ✅ 1단계: Discord 설정

### 1-1. Slash Command 등록 ⬜

로컬 터미널에서:
```bash
cd /home/user/automation/scripts
node register-discord-command.js
```

**확인사항:**
- [ ] "✅ Slash Command 등록 성공!" 메시지 확인
- [ ] Discord 서버에서 `/create-ticket` 입력 시 명령어 표시 확인

### 1-2. Interactions Endpoint URL 설정 ⬜

**나중에 설정** (n8n 워크플로우 활성화 후)

1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. Application 선택 (ID: 1449985191475937383)
3. "General Information" 탭
4. "INTERACTIONS ENDPOINT URL": `http://your-n8n-server:port/webhook/discord-interaction`
5. "Save Changes"

---

## ✅ 2단계: Google Sheets 설정

### 2-1. 스프레드시트 생성 ⬜

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: `Discord Ticket Master`
4. 시트 이름: `ticket_requests`

### 2-2. 헤더 설정 ⬜

1행에 다음 복사/붙여넣기 (탭으로 구분):
```
request_id	ticket_type	ticket_title	ticket_description	assignee	start_date	due_date	story_point	requester_id	requester_name	status	jira_key
```

또는 `/home/user/automation/templates/google-sheets-schema.csv` 파일 임포트

**확인사항:**
- [ ] 12개 컬럼이 정확히 입력됨
- [ ] 컬럼 이름에 공백 없음

### 2-3. Service Account 생성 ⬜

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성: `Discord Ticket Master`
3. Google Sheets API 활성화:
   - "API 및 서비스" > "라이브러리"
   - "Google Sheets API" 검색 후 활성화
4. Service Account 생성:
   - "API 및 서비스" > "사용자 인증 정보"
   - "사용자 인증 정보 만들기" > "서비스 계정"
   - 이름: `n8n-ticket-master`
   - 역할: `편집자`
5. JSON 키 다운로드:
   - 생성된 서비스 계정 클릭
   - "키" 탭
   - "키 추가" > "새 키 만들기" > "JSON"
   - JSON 파일 다운로드 및 안전하게 보관

**기록해두기:**
```
Service Account Email: ________________________@_____________.iam.gserviceaccount.com
JSON 파일 위치: ___________________________________________
```

### 2-4. 스프레드시트 공유 ⬜

1. Google Sheets 스프레드시트 열기
2. "공유" 버튼 클릭
3. Service Account 이메일 추가
4. 권한: `편집자`
5. "보내기"

### 2-5. Spreadsheet ID 확인 ⬜

URL에서 ID 복사:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                                       ↑↑↑↑↑↑↑↑↑↑↑↑
```

**기록해두기:**
```
Spreadsheet ID: ___________________________________________
```

**`.env` 파일 업데이트:**
```bash
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

---

## ✅ 3단계: JIRA 설정 (옵션)

JIRA를 사용하지 않으면 이 단계는 건너뛰고 워크플로우에서 JIRA 노드를 제거하세요.

### 3-1. API Token 생성 ⬜

1. [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) 접속
2. "Create API token" 클릭
3. Label: `n8n Discord Ticket Master`
4. Token 복사

**기록해두기:**
```
JIRA Email: ___________________________________________
JIRA API Token: ___________________________________________
```

### 3-2. 필요한 정보 수집 ⬜

**기록해두기:**
```
JIRA Domain: _______________.atlassian.net
Project Key: __________ (예: PROJ, TICKET)
```

**`.env` 파일 업데이트:**
```bash
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_PROJECT_KEY=YOUR_PROJECT_KEY
JIRA_API_TOKEN=your_api_token
JIRA_EMAIL=your_email@example.com
```

---

## ✅ 4단계: n8n 설정

### 4-1. n8n 접속 ⬜

브라우저에서 n8n 서버 접속:
```
http://your-n8n-server:port
```

### 4-2. Credentials 추가 ⬜

#### Credential 1: Discord Bot Auth

1. n8n > "Credentials" > "Add Credential"
2. Type: `Header Auth`
3. 설정:
   ```
   Name: Discord Bot Auth
   Header Name: Authorization
   Header Value: Bot [.env 파일의 DISCORD_BOT_TOKEN 값]
   ```
   ⚠️ **중요**: "Bot " 접두사 포함!
4. "Save" 클릭

**Credential ID 기록:**
```
Discord Bot Auth ID: ___________________________________________
```

#### Credential 2: Google Sheets API

1. Type: `Google Sheets OAuth2 API` 또는 `Service Account`
2. **Service Account** 선택 (권장)
3. 설정:
   - Name: `Google Sheets - Ticket Master`
   - Service Account Email: [JSON 파일에서 복사]
   - Private Key: [JSON 파일에서 복사 - -----BEGIN PRIVATE KEY----- 부터 -----END PRIVATE KEY----- 까지 전체]
4. "Save" 클릭

**Credential ID 기록:**
```
Google Sheets Credential ID: ___________________________________________
```

#### Credential 3: JIRA Cloud API (옵션)

1. Type: `Jira Cloud API`
2. 설정:
   ```
   Name: JIRA Cloud API
   Email: your_jira_email
   API Token: your_api_token
   Domain: your-domain.atlassian.net
   ```
3. "Save" 클릭

**Credential ID 기록:**
```
JIRA Credential ID: ___________________________________________
```

### 4-3. 워크플로우 1 임포트 ⬜

1. n8n > "Workflows" > "Import from File"
2. `/home/user/automation/workflows/1-ticket-creation-flow.json` 선택
3. 워크플로우 열림

**수정해야 할 부분:**

#### A. Google Sheets 노드 ("Save to Google Sheets")
```json
"documentId": "YOUR_SPREADSHEET_ID"
→ 실제 Spreadsheet ID로 변경

"credentials": {
  "googleSheetsOAuth2Api": {
    "id": "YOUR_GOOGLE_SHEETS_CREDENTIAL_ID"
  }
}
→ 실제 Credential ID로 변경
```

#### B. HTTP Request 노드들 ("Create PM DM Channel", "Send Approval Request")
```json
"credentials": {
  "httpHeaderAuth": {
    "id": "YOUR_DISCORD_BOT_CREDENTIAL_ID"
  }
}
→ 실제 Discord Credential ID로 변경
```

4. "Save" 클릭
5. **워크플로우 활성화** (상단 토글 스위치)

### 4-4. Webhook URL 확인 ⬜

1. "Discord Webhook" 노드 클릭
2. "Production URL" 복사

**기록해두기:**
```
Webhook URL: ___________________________________________
```

### 4-5. Discord Interactions Endpoint URL 설정 ⬜

1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. Application 선택
3. "General Information" > "INTERACTIONS ENDPOINT URL"
4. 위에서 복사한 Webhook URL 입력
5. "Save Changes"

⚠️ Discord가 URL을 검증합니다 (n8n 워크플로우가 활성화되어 있어야 함)

### 4-6. 워크플로우 2 임포트 ⬜

1. n8n > "Workflows" > "Import from File"
2. `/home/user/automation/workflows/2-approval-flow.json` 선택

**수정해야 할 부분:**

#### A. Google Sheets 노드들
- "Lookup Ticket in Sheets"
- "Update Approved Status"
- "Update Rejected Status"

모두 동일하게:
```json
"documentId": "YOUR_SPREADSHEET_ID"
"credentials": { ... }
```

#### B. JIRA 노드 ("Create JIRA Ticket")
```json
"project": "YOUR_PROJECT_KEY"
"credentials": {
  "jiraCloudApi": {
    "id": "YOUR_JIRA_CREDENTIAL_ID"
  }
}
```

#### C. HTTP Request 노드들
모든 Discord 관련 노드에 Credential ID 설정

#### D. JIRA 링크 수정
"Notify Requester Approved" 노드에서:
```
https://YOUR_DOMAIN.atlassian.net/browse/...
→ 실제 도메인으로 변경
```

3. "Save" 클릭
4. **워크플로우 활성화**

### 4-7. 워크플로우 3 임포트 ⬜

1. n8n > "Workflows" > "Import from File"
2. `/home/user/automation/workflows/3-reminder-flow.json` 선택
3. Google Sheets 노드와 Discord 노드들 수정 (동일한 방법)
4. "Save" 클릭
5. **워크플로우 활성화**

---

## ✅ 5단계: 테스트

### 5-1. 엔드-투-엔드 테스트 ⬜

1. Discord 서버에서 `/create-ticket` 입력
2. Modal 팝업 확인
3. 모든 필드 입력:
   ```
   Ticket Type: Bug
   Ticket Title: 테스트 티켓
   Ticket Description: 이것은 테스트입니다
   Assignee: john.doe
   Dates: 2024-12-16 ~ 2024-12-20
   ```
4. 제출
5. "✅ 티켓 요청이 접수되었습니다" 메시지 확인

### 5-2. Google Sheets 확인 ⬜

1. Google Sheets 열기
2. 새 행이 추가되었는지 확인
3. 모든 데이터가 정확한지 확인
4. status가 "pending"인지 확인

### 5-3. PM 승인 테스트 ⬜

1. PM 계정 (User ID: 1258331291846185033)으로 Discord 확인
2. 봇의 DM 수신 확인
3. 티켓 정보 확인
4. "승인" 버튼 클릭
5. "✅ 티켓이 승인되어 JIRA에 생성되었습니다" 확인

### 5-4. JIRA 확인 ⬜ (옵션)

1. JIRA 접속
2. 새 티켓 생성 확인
3. 모든 필드 정확성 확인

### 5-5. 요청자 알림 확인 ⬜

1. 원래 티켓 생성자 계정으로 Discord 확인
2. 봇의 DM 수신 확인
3. JIRA 링크 클릭하여 작동 확인

---

## 🎉 완료!

모든 체크박스가 체크되면 시스템이 정상 작동합니다!

## 🔧 문제 발생 시

`/home/user/automation/docs/TROUBLESHOOTING.md` 참고

## 📝 추가 참고 문서

- 상세 설정: `/home/user/automation/docs/SETUP.md`
- 테스트 가이드: `/home/user/automation/docs/TESTING.md`
- README: `/home/user/automation/README.md`
