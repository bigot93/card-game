// Supabase 설정
const SUPABASE_URL = 'https://wvztngfyfwmbxnffuuvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2enRuZ2Z5ZndtYnhuZmZ1dXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDk0OTcsImV4cCI6MjA4MTY4NTQ5N30.kIyuj2hmq0KTIDDaxewsIUHXSFSdDjE25uSaV2RIhpE';

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

