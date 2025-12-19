# 카드 뒤집기 게임

Canvas API와 JavaScript로 만든 간단한 카드 뒤집기 메모리 게임입니다.

## 기능

- 🎴 4x4 그리드 카드 게임 (8쌍)
- 🎨 부드러운 카드 뒤집기 애니메이션
- 📊 시도 횟수 및 매칭 수 추적
- 💾 Supabase를 통한 점수 기록
- 🎯 게임 완료 시 자동 점수 저장

## Supabase 데이터베이스

### 프로젝트 정보
- **프로젝트 ID**: `wvztngfyfwmbxnffuuvz`
- **URL**: `https://wvztngfyfwmbxnffuuvz.supabase.co`

### 테이블 구조

#### `game_scores` 테이블
점수 기록을 저장하는 테이블입니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | BIGSERIAL | 자동 증가 기본 키 |
| `player_name` | TEXT | 플레이어 이름 (선택사항) |
| `moves` | INTEGER | 시도 횟수 |
| `matches` | INTEGER | 매칭된 쌍 수 |
| `total_pairs` | INTEGER | 전체 쌍 수 (기본값: 8) |
| `game_time_seconds` | INTEGER | 게임 소요 시간 (초) |
| `created_at` | TIMESTAMPTZ | 기록 생성 시간 |

#### `top_scores` 뷰
최고 점수를 조회하기 위한 뷰입니다. 시도 횟수가 적을수록 좋은 점수입니다.

## 설정 방법

### 방법 1: 자동 빌드 스크립트 사용 (권장)

#### 1-1. 환경 변수 사용

```bash
# 환경 변수로 직접 설정
SUPABASE_URL=your-url SUPABASE_ANON_KEY=your-key npm run build:config
```

#### 1-2. .env 파일 사용

```bash
# .env.example을 복사
cp .env.example .env

# .env 파일 편집하여 실제 키 입력
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key-here

# 빌드 실행
npm run build:config
```

### 방법 2: 수동 생성

```bash
# 예제 파일을 복사
cp supabase-config.example.js supabase-config.js

# 파일을 열고 실제 키 입력
```

**⚠️ 보안 주의사항:**
- `supabase-config.js` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- `.env` 파일도 Git에 커밋되지 않습니다.
- 절대 실제 키를 GitHub에 업로드하지 마세요.
- 배포 시에는 배포 플랫폼의 환경 변수 기능을 사용하세요.

## 실행 방법

### 1. 의존성 설치 (선택사항)

```bash
npm install
```

### 2. Supabase 설정 파일 생성

위의 "설정 방법"을 참고하여 `supabase-config.js` 파일을 생성하세요.

### 3. 로컬 서버 실행

```bash
# npm 스크립트 사용 (권장)
npm start
# 또는
npm run dev  # 설정 빌드 + 서버 시작

# 또는 직접 실행
npx http-server -p 8000

# Python 3
python -m http.server 8000
```

그 다음 브라우저에서 `http://localhost:8000` 접속

## 게임 방법

1. 카드를 클릭하여 뒤집습니다
2. 같은 색상의 카드 쌍을 찾습니다
3. 모든 카드를 매칭하면 게임 완료!
4. 게임 완료 시 점수가 자동으로 Supabase에 저장됩니다

## 점수 확인

Supabase 대시보드에서 `game_scores` 테이블을 확인하거나, `top_scores` 뷰를 조회하여 최고 점수를 확인할 수 있습니다.

## 파일 구조

- `index.html` - 게임 HTML 구조
- `style.css` - 스타일링
- `game.js` - 게임 로직 (Canvas API)
- `supabase-config.js` - Supabase 클라이언트 설정

