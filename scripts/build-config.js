#!/usr/bin/env node

/**
 * Supabase 설정 파일 자동 생성 스크립트
 * 
 * 사용 방법:
 * 1. 환경 변수 사용:
 *    SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy node scripts/build-config.js
 * 
 * 2. .env 파일 사용:
 *    node scripts/build-config.js
 * 
 * 3. package.json 스크립트 사용:
 *    npm run build:config
 */

const fs = require('fs');
const path = require('path');

// 환경 변수에서 키 읽기
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// .env 파일이 있으면 읽기
let envVars = {};
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });
}

// 환경 변수 또는 .env 파일에서 값 가져오기
const finalUrl = SUPABASE_URL || envVars.SUPABASE_URL || '';
const finalKey = SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY || '';

// 값 검증
if (!finalUrl || !finalKey) {
    console.error('❌ 오류: SUPABASE_URL과 SUPABASE_ANON_KEY가 필요합니다.');
    console.error('');
    console.error('다음 중 하나의 방법으로 설정하세요:');
    console.error('1. 환경 변수:');
    console.error('   SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy node scripts/build-config.js');
    console.error('2. .env 파일 생성:');
    console.error('   SUPABASE_URL=xxx');
    console.error('   SUPABASE_ANON_KEY=yyy');
    console.error('3. package.json 스크립트 사용:');
    console.error('   npm run build:config');
    process.exit(1);
}

// 예제 파일 읽기
const examplePath = path.join(__dirname, '..', 'supabase-config.example.js');
if (!fs.existsSync(examplePath)) {
    console.error('❌ 오류: supabase-config.example.js 파일을 찾을 수 없습니다.');
    process.exit(1);
}

let template = fs.readFileSync(examplePath, 'utf8');

// 플레이스홀더 치환
template = template.replace(
    /const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';/,
    `const SUPABASE_URL = '${finalUrl}';`
);
template = template.replace(
    /const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';/,
    `const SUPABASE_ANON_KEY = '${finalKey}';`
);

// supabase-config.js 파일 생성
const outputPath = path.join(__dirname, '..', 'supabase-config.js');
fs.writeFileSync(outputPath, template, 'utf8');

console.log('✅ supabase-config.js 파일이 성공적으로 생성되었습니다!');
console.log(`   URL: ${finalUrl.substring(0, 30)}...`);
console.log(`   Key: ${finalKey.substring(0, 20)}...`);

