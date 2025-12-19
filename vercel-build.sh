#!/bin/bash
# Vercel 빌드 스크립트

echo "🔨 Vercel 빌드 시작..."

# 환경 변수 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 오류: SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다."
    echo "Vercel 대시보드에서 Environment Variables를 설정해주세요."
    exit 1
fi

echo "✅ 환경 변수 확인 완료"
echo "   SUPABASE_URL: ${SUPABASE_URL:0:30}..."
echo "   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."

# supabase-config.js 생성
npm run build:config

if [ $? -eq 0 ]; then
    echo "✅ supabase-config.js 생성 완료"
else
    echo "❌ supabase-config.js 생성 실패"
    exit 1
fi

echo "✅ 빌드 완료"

