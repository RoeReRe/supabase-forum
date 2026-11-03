import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Custom fetch that ensures ALL required headers
const customFetch = async (url: string, options: RequestInit = {}) => {
  const urlObj = new URL(url);

  // Fix 1: Remove quotes from columns parameter
  if (urlObj.searchParams.has('columns')) {
    const columns = urlObj.searchParams.get('columns');
    urlObj.searchParams.set('columns', columns?.split('"').join('') || '');
    url = urlObj.toString();
  }

  // Fix 2: Ensure apikey header is ALWAYS present
  const headers: Record<string, string> = {
    ...options.headers,
    apikey: supabaseKey,
  };

  // Fix 3: Fallback Authorization header if missing
  if (!headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

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
