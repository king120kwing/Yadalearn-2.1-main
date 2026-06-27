import { createClient } from '@supabase/supabase-js';

const sanitizeEnvVal = (val: string | undefined): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const supabaseUrl = sanitizeEnvVal(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnvVal(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase Environment Variables! Check Netlify configuration.');
    // Do not throw, let it fail downstream so we can see UI/Logs
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

