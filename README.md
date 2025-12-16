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
- **JIRA Cloud**: 최종 티켓 저장소 (선택사항)
- **n8n**: 워크플로우 자동화 엔진

## 🚀 빠른 시작

자세한 설정 가이드는 **`LOCAL_SETUP.md`** 파일을 참고하세요.

### 설정 단계 요약

1. **Discord Slash Command 등록**
2. **Google Sheets 설정** (Service Account 생성 및 공유)
3. **n8n 워크플로우 임포트** (3개 JSON 파일)
4. **Discord Interactions Endpoint 설정**
5. **테스트**: Discord에서 `/create-ticket` 실행

## 📁 프로젝트 구조

```
.
├── workflows/              # n8n 워크플로우 JSON 파일
│   ├── 1-ticket-creation-flow.json
│   ├── 2-approval-flow.json
│   └── 3-reminder-flow.json
├── scripts/               # Discord 명령어 등록 스크립트
│   ├── register-discord-command.sh
│   └── register-discord-command.js
├── templates/             # 템플릿 파일
│   ├── google-sheets-schema.csv
│   └── google-sheets-setup.md
├── docs/                  # 문서
│   ├── SETUP.md
│   ├── TESTING.md
│   └── TROUBLESHOOTING.md
├── LOCAL_SETUP.md         # 실제 설정 가이드 (로컬 전용)
├── QUICK_SETUP.md         # 빠른 설정 가이드
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
2. JIRA에 티켓 생성 (JIRA 사용 시)
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
   - JIRA 티켓 생성 확인 (사용 시)
   - 요청자 알림 수신 확인

3. **거부 테스트**
   - PM 계정으로 "거부" 버튼 클릭
   - Google Sheets 상태 확인
   - 요청자 알림 수신 확인

## 🔧 문제 해결

일반적인 문제와 해결 방법은 [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)를 참고하세요.

### 자주 발생하는 오류

1. **Discord API 401 Unauthorized**
   - Bot Token 확인
   - Credential 설정 확인

2. **Google Sheets Permission Denied**
   - Service Account 권한 확인
   - 스프레드시트 공유 설정 확인

3. **Modal이 표시되지 않음**
   - n8n 워크플로우 활성화 확인
   - Webhook URL이 Discord에 정확히 설정되었는지 확인

## 📝 설정 가이드

- **LOCAL_SETUP.md** ⭐ - 실제 설정값 포함 (로컬 전용, Git 제외)
- **QUICK_SETUP.md** - 빠른 설정 가이드
- **docs/SETUP.md** - 상세 설정 가이드
- **SETUP_CHECKLIST.md** - 단계별 체크리스트

## 🤝 기여

개선 사항이나 버그 리포트는 이슈로 등록해 주세요.

## 📄 라이선스

MIT License

## 🔗 관련 링크

- [n8n Documentation](https://docs.n8n.io/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Google Cloud Console](https://console.cloud.google.com/)
- [JIRA Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
