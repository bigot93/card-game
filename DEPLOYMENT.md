# 배포 가이드

## 보안 설정

이 프로젝트는 Supabase를 사용하므로, 배포 시 API 키를 안전하게 관리해야 합니다.

## 배포 플랫폼별 설정

### Netlify

1. Netlify 대시보드에서 프로젝트 설정 → Environment variables로 이동
2. 다음 환경 변수 추가:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase Anon Key

3. `netlify.toml` 파일 생성 (선택사항):
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

4. 빌드 시 환경 변수를 주입하는 스크립트 필요:
   - Netlify Functions 사용
   - 또는 빌드 시 `supabase-config.js` 파일 생성

### Vercel

1. Vercel 대시보드에서 프로젝트 설정 → Environment Variables로 이동
2. 다음 환경 변수 추가:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. `vercel.json` 파일 생성:
```json
{
  "buildCommand": "node scripts/build-config.js",
  "outputDirectory": "."
}
```

### GitHub Pages

GitHub Pages는 환경 변수를 직접 지원하지 않으므로:
1. 빌드 스크립트를 사용하여 배포 전에 `supabase-config.js` 생성
2. 또는 GitHub Secrets를 사용하는 GitHub Actions 워크플로우 설정

### 수동 배포

배포 전에 `supabase-config.js` 파일을 생성하고 실제 키를 입력한 후 배포하세요.

**⚠️ 주의:** 배포된 사이트의 소스 코드에서 키가 노출될 수 있으므로, Supabase의 Row Level Security (RLS) 정책을 반드시 설정하세요.

## Supabase 보안 설정

1. Supabase 대시보드 → Authentication → Policies
2. `game_scores` 테이블에 RLS (Row Level Security) 활성화
3. 적절한 정책 설정:
   - SELECT: 모든 사용자 허용 (리더보드 조회)
   - INSERT: 모든 사용자 허용 (점수 저장)

```sql
-- 예제 정책
CREATE POLICY "Allow public read access" ON game_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON game_scores
  FOR INSERT WITH CHECK (true);
```

