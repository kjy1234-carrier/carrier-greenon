import { createClient } from '@supabase/supabase-js';

// 브라우저에는 공개용 프로젝트 URL과 publishable key만 전달합니다.
// service_role 또는 secret key는 어떤 경우에도 프런트엔드 환경변수로 사용하지 않습니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
