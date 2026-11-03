-- ============================================
-- DARK DUCK FORUM - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable ltree extension for hierarchical paths
CREATE EXTENSION IF NOT EXISTS ltree;

-- ============================================
-- TABLES
-- ============================================

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts (hierarchical structure)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path ltree NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post contents
CREATE TABLE IF NOT EXISTS post_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post score
CREATE TABLE IF NOT EXISTS post_score (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id)
);

-- Post votes
CREATE TABLE IF NOT EXISTS post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- User profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to user_profiles"
ON user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to posts"
ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Post contents
ALTER TABLE post_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to post_contents"
ON post_contents FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create post_contents"
ON post_contents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Post score
ALTER TABLE post_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to post_score"
ON post_score FOR SELECT USING (true);

CREATE POLICY "Public can update post_score"
ON post_score FOR UPDATE USING (true);

-- Post votes
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to post_votes"
ON post_votes FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes"
ON post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
ON post_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REALTIME CONFIGURATION
-- ============================================

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication with all tables
CREATE PUBLICATION supabase_realtime
FOR TABLE
  user_profiles, posts, post_contents, post_score, post_votes;

-- Enable realtime on all tables
ALTER TABLE user_profiles SET (realtime.enable = true);
ALTER TABLE posts SET (realtime.enable = true);
ALTER TABLE post_contents SET (realtime.enable = true);
ALTER TABLE post_score SET (realtime.enable = true);
ALTER TABLE post_votes SET (realtime.enable = true);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Get posts (paginated)
CREATE OR REPLACE FUNCTION get_posts(page_number integer)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  score integer,
  title TEXT,
  user_id UUID,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.created_at,
    COALESCE(ps.score, 0) as score,
    pc.title,
    p.user_id,
    up.username
  FROM posts p
  JOIN post_contents pc ON p.id = pc.post_id
  LEFT JOIN post_score ps ON p.id = ps.post_id
  LEFT JOIN user_profiles up ON p.user_id = up.user_id
  ORDER BY ps.score DESC NULLS LAST, p.created_at DESC
  LIMIT 25
  OFFSET (page_number - 1) * 25;
END;
$$;

-- Get single post with comments
CREATE OR REPLACE FUNCTION get_single_post_with_comments(post_id UUID)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  score integer,
  title TEXT,
  content TEXT,
  user_id UUID,
  author_name TEXT,
  path ltree
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH post_tree AS (
    SELECT
      p.id,
      p.created_at,
      COALESCE(ps.score, 0) as score,
      pc.title,
      pc.content,
      p.user_id,
      up.username as author_name,
      p.path
    FROM posts p
    JOIN post_contents pc ON p.id = pc.post_id
    LEFT JOIN post_score ps ON p.id = ps.post_id
    LEFT JOIN user_profiles up ON p.user_id = up.user_id
    WHERE p.path[0] = post_id::text
    ORDER BY p.path
  )
  SELECT * FROM post_tree;
END;
$$;

-- Create new post
CREATE OR REPLACE FUNCTION create_new_post(
  userId UUID,
  title TEXT,
  content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_post_id UUID;
BEGIN
  -- Create the post
  INSERT INTO posts (user_id, path)
  VALUES (userId, 'root.' || gen_random_uuid()::text)
  RETURNING id INTO new_post_id;

  -- Create the post content
  INSERT INTO post_contents (post_id, title, content, user_id)
  VALUES (new_post_id, title, content, userId);

  -- Initialize score
  INSERT INTO post_score (post_id, score)
  VALUES (new_post_id, 0)
  ON CONFLICT (post_id) DO UPDATE SET score = 0;

  RETURN new_post_id;
END;
$$;

-- Create new comment
CREATE OR REPLACE FUNCTION create_new_comment(
  user_id UUID,
  content TEXT,
  path ltree
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_comment_id UUID;
BEGIN
  -- Create the comment post
  INSERT INTO posts (user_id, path)
  VALUES (user_id, path)
  RETURNING id INTO new_comment_id;

  -- Create the comment content
  INSERT INTO post_contents (post_id, content, user_id)
  VALUES (new_comment_id, content, user_id);

  -- Initialize score
  INSERT INTO post_score (post_id, score)
  VALUES (new_comment_id, 0)
  ON CONFLICT (post_id) DO UPDATE SET score = 0;

  RETURN new_comment_id;
END;
$$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'posts', 'post_contents', 'post_score', 'post_votes');

-- Check RLS is enabled
SELECT table_name, row_security FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'posts', 'post_contents', 'post_score', 'post_votes');

-- Check realtime is enabled
SELECT table_name, realtime.enable FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'posts', 'post_contents', 'post_score', 'post_votes');
