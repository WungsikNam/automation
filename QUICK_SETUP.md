# ⚡ 빠른 설정 가이드 (Discord 봇 준비 완료)

Discord 봇이 이미 있는 경우 3단계로 끝!

---

## 📥 Step 0: 파일 다운로드

### 방법 1: GitHub ZIP 다운로드
1. https://github.com/WungsikNam/automation 접속
2. 브랜치: `claude/discord-ticket-workflow-a0kGm` 선택
3. "Code" → "Download ZIP"

### 방법 2: 터미널 (추천)
```bash
git clone https://github.com/WungsikNam/automation.git
cd automation
git checkout claude/discord-ticket-workflow-a0kGm
```

---

## ✅ Step 1: Discord Slash Command 등록

### 방법 A: 웹 브라우저에서 (가장 간단)

Discord Developer Portal API 테스트 페이지:
```
https://discord.com/developers/applications/1449985191475937383/bot
```

아래로 스크롤해서 "Reset Token" 옆에 있는 API 도구 사용

### 방법 B: cURL 사용

터미널에서 실행:
```bash
curl -X POST \
  -H "Authorization: Bot YOUR_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "create-ticket",
    "type": 1,
    "description": "새로운 티켓을 생성합니다"
  }' \
  "https://discord.com/api/v10/applications/1449985191475937383/guilds/1126326739786813442/commands"
```

**성공 응답:**
```json
{
  "id": "...",
  "application_id": "1449985191475937383",
  "name": "create-ticket",
  ...
}
```

### 방법 C: Postman/Insomnia 사용

- **Method:** POST
- **URL:** `https://discord.com/api/v10/applications/1449985191475937383/guilds/1126326739786813442/commands`
- **Headers:**
  - `Authorization: Bot YOUR_BOT_TOKEN`
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "create-ticket",
    "type": 1,
    "description": "새로운 티켓을 생성합니다"
  }
  ```

**확인:** Discord 서버에서 `/create-ticket` 입력 시 명령어가 표시되면 성공!

---

## ✅ Step 2: Google Sheets 설정

### 2-1. 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: `Discord Ticket Master`
4. **중요:** 시트 이름을 `ticket_requests`로 변경 (하단 탭)

### 2-2. 헤더 추가

**1행**에 다음을 **탭으로 구분하여** 붙여넣기:
```
request_id	ticket_type	ticket_title	ticket_description	assignee	start_date	due_date	story_point	requester_id	requester_name	status	jira_key
```

또는 다운로드한 `templates/google-sheets-schema.csv` 파일 임포트:
- "파일" → "가져오기" → CSV 선택

**확인:** 1행에 정확히 12개 컬럼이 있어야 함

### 2-3. Service Account 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. **프로젝트 생성:**
   - 프로젝트 이름: `Discord Ticket Master`
3. **Google Sheets API 활성화:**
   - 좌측 메뉴 → "API 및 서비스" → "라이브러리"
   - "Google Sheets API" 검색
   - "사용 설정" 클릭
4. **Service Account 생성:**
   - 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
   - "사용자 인증 정보 만들기" → "서비스 계정"
   - 이름: `n8n-ticket-master`
   - 역할: `편집자` (Editor)
   - "완료" 클릭
5. **JSON 키 다운로드:**
   - 생성된 서비스 계정 클릭
   - "키" 탭
   - "키 추가" → "새 키 만들기" → "JSON"
   - JSON 파일 자동 다운로드 → **안전한 곳에 보관!**

### 2-4. 스프레드시트 공유

1. JSON 파일 열기 → `client_email` 값 복사
   ```json
   {
     "client_email": "n8n-ticket-master@xxxxx.iam.gserviceaccount.com"
   }
   ```
2. Google Sheets 스프레드시트로 돌아가기
3. 우측 상단 "공유" 버튼 클릭
4. Service Account 이메일 붙여넣기
5. 권한: **편집자** 선택
6. "알림 보내지 않음" 체크 (봇이므로)
7. "공유" 클릭

### 2-5. Spreadsheet ID 확인

URL에서 ID 복사:
```
https://docs.google.com/spreadsheets/d/1abc123def456xyz/edit
                                       ↑↑↑↑↑↑↑↑↑↑↑↑↑
                                    이 부분이 ID
```

**메모해두기:**
```
Spreadsheet ID: _______________________________________
Service Account Email: _______________________________
```

---

## ✅ Step 3: n8n 설정

### 3-1. n8n 접속

브라우저에서 n8n 열기:
```
http://your-server-ip:5678
```
(또는 설정된 도메인/포트)

### 3-2. Credentials 추가

#### Credential 1: Discord Bot Auth

1. n8n 좌측 메뉴 → "Credentials" 클릭
2. 우측 상단 "+ Add Credential" 클릭
3. **검색:** `Header Auth` 입력
4. 선택: `Header Auth`
5. 설정:
   ```
   Credential Name: Discord Bot Auth
   Name: Authorization
   Value: Bot YOUR_BOT_TOKEN
   ```
   ⚠️ **중요:** `Bot ` 접두사 포함!
6. "Save" 클릭

#### Credential 2: Google Sheets API

1. "+ Add Credential" 클릭
2. **검색:** `Google Sheets`
3. 선택: `Google Service Account` (또는 OAuth2)
4. **Service Account 방식 (권장):**
   - Credential Name: `Google Sheets - Ticket Master`
   - Service Account Email: [JSON 파일의 `client_email` 값]
   - Private Key: [JSON 파일의 `private_key` 값 전체 복사]
     ```
     -----BEGIN PRIVATE KEY-----
     ...전체 내용...
     -----END PRIVATE KEY-----
     ```
5. "Save" 클릭

#### Credential 3: JIRA Cloud API (선택사항)

JIRA를 사용하지 않으면 건너뛰기 (워크플로우에서 JIRA 노드 삭제)

1. "+ Add Credential" 클릭
2. **검색:** `Jira Cloud`
3. 설정:
   ```
   Credential Name: JIRA Cloud API
   Email: your-jira-email@example.com
   API Token: [JIRA API Token]
   Domain: your-domain.atlassian.net
   ```
4. "Save" 클릭

### 3-3. 워크플로우 임포트

#### 워크플로우 1: 티켓 생성

1. n8n 좌측 메뉴 → "Workflows" 클릭
2. 우측 상단 "..." → "Import from File"
3. 다운로드한 `workflows/1-ticket-creation-flow.json` 선택
4. 워크플로우가 열림

**수정할 곳 (중요!):**

**A. Google Sheets 노드 ("Save to Google Sheets")**
- 노드 더블클릭
- Document: Spreadsheet ID 입력
- Credentials: "Google Sheets - Ticket Master" 선택

**B. HTTP Request 노드 ("Create PM DM Channel", "Send Approval Request")**
- 각 노드 더블클릭
- Credentials → "Discord Bot Auth" 선택

5. **상단 "Save" 클릭**
6. **상단 토글 스위치 ON (워크플로우 활성화)** ← 필수!

#### 워크플로우 2: 승인/거부 처리

1. "Import from File" → `workflows/2-approval-flow.json` 선택
2. 수정:
   - 모든 Google Sheets 노드: Spreadsheet ID 입력, Credential 선택
   - 모든 HTTP Request 노드: Discord Credential 선택
   - JIRA 노드 (사용 시): Project Key 입력, Credential 선택
   - "Notify Requester Approved" 노드: JIRA 도메인 수정
3. "Save" 클릭
4. 워크플로우 활성화 (토글 ON)

#### 워크플로우 3: 리마인더

1. "Import from File" → `workflows/3-reminder-flow.json` 선택
2. Google Sheets, Discord 노드 설정 (동일)
3. "Save" 클릭
4. 워크플로우 활성화

### 3-4. Webhook URL 복사

1. **워크플로우 1** 열기
2. "Discord Webhook" 노드 클릭
3. 하단 "Production URL" 복사
   ```
   예: http://your-server:5678/webhook/discord-interaction
   ```

### 3-5. Discord Interactions Endpoint 설정

1. [Discord Developer Portal](https://discord.com/developers/applications/1449985191475937383) 접속
2. 좌측 "General Information" 클릭
3. 아래로 스크롤 → "INTERACTIONS ENDPOINT URL"
4. 복사한 Webhook URL 붙여넣기
5. "Save Changes" 클릭

⚠️ Discord가 URL 검증 시도 → n8n 워크플로우가 활성화되어 있어야 성공!

**성공하면:** "All your edits have been carefully recorded."

---

## 🧪 테스트!

### 1. Discord에서 명령어 확인

Discord 서버 아무 채널에서:
```
/create-ticket
```

**성공:** Modal 팝업이 나타남
**실패:** "Application did not respond" → Webhook URL 재확인

### 2. 티켓 생성 테스트

Modal에 입력:
```
Ticket Type: Bug
Ticket Title: 테스트 티켓
Ticket Description: 이것은 테스트입니다
Assignee: john.doe
Dates: 2024-12-16 ~ 2024-12-20
```

제출 후:
- ✅ "티켓 요청이 접수되었습니다" 메시지 확인
- ✅ Google Sheets에 새 행 추가 확인
- ✅ PM에게 DM 전송 확인 (User ID: 1258331291846185033)

### 3. 승인 테스트

PM 계정으로:
1. Discord 확인
2. 봇 DM 확인
3. "승인" 버튼 클릭
4. JIRA 티켓 생성 확인 (JIRA 사용 시)
5. 요청자에게 알림 전송 확인

---

## ✅ 완료 체크리스트

- [ ] Discord Slash Command 등록 완료
- [ ] Google Sheets 생성 및 헤더 설정
- [ ] Service Account 생성 및 JSON 키 다운로드
- [ ] 스프레드시트에 Service Account 공유
- [ ] n8n Credentials 3개 추가
- [ ] 워크플로우 3개 임포트 및 설정
- [ ] 모든 워크플로우 활성화
- [ ] Discord Interactions Endpoint URL 설정
- [ ] Discord에서 `/create-ticket` 테스트 성공
- [ ] Google Sheets 데이터 저장 확인
- [ ] PM 승인 플로우 테스트 성공

---

## ❓ 문제 발생 시

**Discord 명령어가 안 보여요**
→ Slash Command 등록 다시 확인, Discord 재시작

**Modal이 안 떠요**
→ n8n 워크플로우 1이 활성화되었는지 확인
→ Webhook URL이 Discord에 정확히 입력되었는지 확인

**Google Sheets에 데이터가 안 들어가요**
→ Service Account 이메일이 스프레드시트에 공유되었는지 확인
→ 시트 이름이 정확히 `ticket_requests`인지 확인

**자세한 문제 해결:**
`docs/TROUBLESHOOTING.md` 참고

---

## 🎉 성공!

모든 체크박스가 체크되면 시스템이 정상 작동합니다!

이제 팀원들에게 Discord에서 `/create-ticket`으로 티켓을 생성하도록 안내하세요.
