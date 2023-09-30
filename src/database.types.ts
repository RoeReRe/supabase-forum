export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface GetPostsResponse {
  created_at: string;
  id: string;
  score: number;
  title: string;
  user_id: string;
  username: string;
}

export interface GetSinglePostWithCommentResponse {
  author_name: string;
  content: string;
  created_at: string;
  id: string;
  path: string;
  score: number;
  title: string;
}

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      post_contents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          post_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          post_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          post_id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_contents_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_contents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_score: {
        Row: {
          post_id: string
          score: number
        }
        Insert: {
          post_id: string
          score: number
        }
        Update: {
          post_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_score_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      post_votes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          created_at: string
          id: string
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          user_id: string
          username: string
        }
        Insert: {
          user_id: string
          username: string
        }
        Update: {
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _ltree_compress: {
        Args: {
          "": string
        }
        Returns: string
      }
      _ltree_gist_options: {
        Args: {
          "": string
        }
        Returns: undefined
      }
      create_new_comment: {
        Args: {
          user_id: string
          content: string
          path: string
        }
        Returns: boolean
      }
      create_new_post: {
        Args: {
          userId: string
          title: string
          content: string
        }
        Returns: boolean
      }
      get_posts: {
        Args: {
          page_number: number
        }
        Returns: {
          id: string
          user_id: string
          created_at: string
          title: string
          score: number
          username: string
        }[]
      }
      get_single_post_with_comments: {
        Args: {
          post_id: string
        }
        Returns: {
          id: string
          author_name: string
          created_at: string
          title: string
          content: string
          score: number
          path: string
        }[]
      }
      lca: {
        Args: {
          "": string[]
        }
        Returns: string
      }
      lquery_in: {
        Args: {
          "": string
        }
        Returns: string
      }
      lquery_out: {
        Args: {
          "": string
        }
        Returns: string
      }
      lquery_recv: {
        Args: {
          "": string
        }
        Returns: string
      }
      lquery_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_compress: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_decompress: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_gist_in: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_gist_options: {
        Args: {
          "": string
        }
        Returns: undefined
      }
      ltree_gist_out: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_in: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_out: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_recv: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltree2text: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltxtq_in: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltxtq_out: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltxtq_recv: {
        Args: {
          "": string
        }
        Returns: string
      }
      ltxtq_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      nlevel: {
        Args: {
          "": string
        }
        Returns: number
      }
      text2ltree: {
        Args: {
          "": string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}