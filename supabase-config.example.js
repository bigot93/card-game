// Supabase 설정 예제 파일
// 이 파일을 복사하여 supabase-config.js로 이름을 변경하고 실제 키를 입력하세요.

// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Supabase 클라이언트 초기화 (간단한 fetch 기반)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
    }

    async insert(table, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase insert failed: ${error}`);
        }

        return await response.json();
    }

    async select(table, options = {}) {
        let url = `${this.url}/rest/v1/${table}?select=*`;
        
        if (options.orderBy) {
            // PostgREST 형식: order=column.asc 또는 order=column.desc
            const orderDirection = options.orderDirection || 'asc';
            url += `&order=${options.orderBy}.${orderDirection}`;
        }
        
        if (options.limit) {
            url += `&limit=${options.limit}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase select failed: ${error}`);
        }

        return await response.json();
    }
}

// Supabase 클라이언트 인스턴스 생성
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역 변수로도 설정 (호환성)
if (typeof window !== 'undefined') {
    window.supabase = supabase;
}

