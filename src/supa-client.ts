import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Custom fetch that adds headers to ALL requests
const customFetch = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

export const supaClient = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});
