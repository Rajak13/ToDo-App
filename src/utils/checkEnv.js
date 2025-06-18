// This utility helps check if environment variables are properly set
// It's useful for debugging connection issues with Supabase

export function checkSupabaseEnv() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  const issues = [];
  
  if (!supabaseUrl) {
    issues.push('REACT_APP_SUPABASE_URL is not set');
  } else if (!supabaseUrl.includes('supabase.co')) {
    issues.push('REACT_APP_SUPABASE_URL does not appear to be a valid Supabase URL');
  }
  
  if (!supabaseKey) {
    issues.push('REACT_APP_SUPABASE_ANON_KEY is not set');
  } else if (supabaseKey.length < 20) {
    issues.push('REACT_APP_SUPABASE_ANON_KEY appears to be too short to be valid');
  }
  
  return {
    isConfigured: issues.length === 0,
    issues,
    supabaseUrlSet: !!supabaseUrl,
    supabaseKeySet: !!supabaseKey,
  };
} 