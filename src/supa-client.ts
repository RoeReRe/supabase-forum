import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Minimal custom fetch - ONLY fixes columns parameter
const customFetch = async (url: string, options: RequestInit = {}) => {
  const urlObj = new URL(url);

  // Fix: Remove ALL double quotes from columns parameter
  if (urlObj.searchParams.has('columns')) {
    const columns = urlObj.searchParams.get('columns');
    urlObj.searchParams.set('columns', columns?.split('"').join('') || '');
    url = urlObj.toString();
  }

  // Let Supabase client handle Authorization header
  return fetch(url, options);
};

export const supaClient = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      apikey: supabaseKey,  // Only add apikey here
    },
    fetch: customFetch,  // Only fixes columns, nothing else
  },
  db: {
    schema: "public",
  },
});
