import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase Environment Variables! Check Netlify configuration.');
    // Do not throw, let it fail downstream so we can see UI/Logs
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
