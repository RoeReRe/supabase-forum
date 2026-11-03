import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Custom fetch that ensures apikey header and fixes columns parameter
const customFetch = async (url: string, options: RequestInit = {}) => {
  // Fix: Remove quotes from columns parameter
  const urlObj = new URL(url);
  if (urlObj.searchParams.has('columns')) {
    const columns = urlObj.searchParams.get('columns');
    urlObj.searchParams.set('columns', columns?.replace(/"/g, '')  || '');
    url = urlObj.toString();
  }

  // Ensure apikey header is present (for REST API)
  // Let Supabase client handle Authorization header (session token vs anon key)
  const headers = {
    apikey: supabaseKey,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export const supaClient = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      apikey: supabaseKey,
    },
    fetch: customFetch,
  },
  db: {
    schema: "public",
  },
});
