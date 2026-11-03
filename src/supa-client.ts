import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Custom fetch that ensures apikey header and fixes columns parameter
const customFetch = async (url: string, options: RequestInit = {}) => {
  // Fix: Remove ALL double quotes from columns parameter
  // Input:  columns="user_id","username"
  // Output: columns=user_id,username
  const urlObj = new URL(url);
  if (urlObj.searchParams.has('columns')) {
    const columns = urlObj.searchParams.get('columns');
    // Use split/join instead of regex to avoid escaping issues
    urlObj.searchParams.set('columns', columns?.split('"').join('') || '');
    url = urlObj.toString();
  }

  // Ensure apikey header is ALWAYS present
  const headers = {
    ...options.headers,
    apikey: supabaseKey,
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
