import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_API_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Monkey-patch postgrest-js to fix columns parameter at the source
// The library incorrectly wraps column names in quotes: columns="user_id","username"
// PostgREST expects: columns=user_id,username (no quotes)
const patchPostgrestColumns = () => {
  try {
    // @ts-ignore - Accessing internal postgrest-js
    const PostgrestQueryBuilder = window.PostgrestQueryBuilder;
    if (!PostgrestQueryBuilder) return;

    // Override insert method
    const originalInsert = PostgrestQueryBuilder.prototype.insert;
    PostgrestQueryBuilder.prototype.insert = function(values: any, options: any) {
      const result = originalInsert.call(this, values, options);
      
      // Fix columns parameter after the library sets it
      if (Array.isArray(values) && this.url.searchParams.has('columns')) {
        const columns = this.url.searchParams.get('columns');
        this.url.searchParams.set('columns', columns.replace(/""/g, ''));
      }
      
      return result;
    };

    // Override upsert method
    const originalUpsert = PostgrestQueryBuilder.prototype.upsert;
    PostgrestQueryBuilder.prototype.upsert = function(values: any, options: any) {
      const result = originalUpsert.call(this, values, options);
      
      if (Array.isArray(values) && this.url.searchParams.has('columns')) {
        const columns = this.url.searchParams.get('columns');
        this.url.searchParams.set('columns', columns.replace(/""/g, ''));
      }
      
      return result;
    };
  } catch (e) {
    // Fallback: will use fetch-level fix
  }
};

// Apply patch before creating client
patchPostgrestColumns();

// Custom fetch as fallback - ensures apikey header is always present
const customFetch = async (url: string, options: RequestInit = {}) => {
  // Final fallback: fix columns in URL if patch didn't work
  const urlObj = new URL(url);
  if (urlObj.searchParams.has('columns')) {
    const columns = urlObj.searchParams.get('columns');
    urlObj.searchParams.set('columns', columns?.replace(/""/g, '') || '');
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
