import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check for environment variables (with fallback to non-prefixed names for compatibility)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '').trim();

// Debug: Log what we're getting (without exposing sensitive data)
if (import.meta.env.DEV) {
  console.log('Supabase config check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    allEnvKeys: Object.keys(import.meta.env).filter(k => k.includes('SUPABASE')),
  });
}

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  const errorMsg = `
⚠️ Supabase configuration incomplete!

Missing: ${missing.join(', ')}

To fix:
1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Ensure these EXACT variable names are set (case-sensitive):
   - VITE_SUPABASE_URL (your Supabase project URL, e.g., https://xxxxx.supabase.co)
   - VITE_SUPABASE_ANON_KEY (your Supabase anon public key)
3. After adding/updating, trigger a NEW deployment:
   - Go to Deploys tab → Click "Trigger deploy" → "Deploy site"
   
⚠️ IMPORTANT: Environment variables are read at BUILD TIME.
You MUST redeploy after adding/changing them!

Current status:
- VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ MISSING'}
- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ MISSING'}

Available env vars with "SUPABASE": ${Object.keys(import.meta.env).filter(k => k.includes('SUPABASE')).join(', ') || 'none'}
`;
  console.error(errorMsg);
  
  // Create a client that will fail gracefully with clear errors
  // This prevents the app from crashing but Supabase calls will fail
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  ) as SupabaseClient;
  } else {
    // Validate URL format
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      console.error(`Invalid VITE_SUPABASE_URL format. Expected URL starting with http:// or https://`);
      supabase = createClient(
        'https://placeholder.supabase.co',
        supabaseAnonKey,
        { auth: { persistSession: false, detectSessionInUrl: false } }
      ) as SupabaseClient;
    } else {
      // Get the current site URL for redirects
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Valid configuration - create the real client
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          // Use current site URL for redirects (will be Netlify URL when deployed)
          redirectTo: siteUrl,
        },
      });
    }
  }

export { supabase };


