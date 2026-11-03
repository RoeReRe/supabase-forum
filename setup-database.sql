-- DarkDuck Forum Database Setup
-- Run this entire file in Supabase SQL Editor

-- Enable ltree extension for hierarchical paths
CREATE EXTENSION IF NOT EXISTS ltree;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) NOT NULL,
  username text UNIQUE NOT NULL,
  CONSTRAINT proper_username CHECK (username ~* '^[a-zA-Z0-9_]+$'),
  CONSTRAINT username_length CHECK (char_length(username) > 3 AND char_length(username) < 15)
);

-- Posts table (hierarchical with ltree)
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT now() NOT NULL,
  path ltree NOT NULL
);

-- Post score tracking
CREATE TABLE IF NOT EXISTS post_score (
  post_id uuid PRIMARY KEY REFERENCES posts (id) NOT NULL,
  score int NOT NULL
);

-- Post content (title, body)
CREATE TABLE IF NOT EXISTS post_contents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  post_id uuid REFERENCES posts (id) NOT NULL,
  title text,
  content text,
  created_at timestamp WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User votes on posts
CREATE TABLE IF NOT EXISTS post_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  post_id uuid REFERENCES posts (id) NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  vote_type text NOT NULL,
  UNIQUE (post_id, user_id)
);

-- Function: Auto-update post score when votes change
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $update_post_score$
BEGIN
  UPDATE post_score
  SET score = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
    FROM post_votes
    WHERE post_id = NEW.post_id
  )
  WHERE post_id = NEW.post_id;
  RETURN NEW;
END;$update_post_score$;

-- Trigger for vote changes
DROP TRIGGER IF EXISTS update_post_score_trigger ON post_votes;
CREATE TRIGGER update_post_score
  AFTER INSERT OR UPDATE OR DELETE
  ON post_votes
  FOR EACH ROW EXECUTE PROCEDURE update_post_score();

-- Function: Get posts with pagination
CREATE OR REPLACE FUNCTION get_posts(page_number int)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  created_at timestamp WITH TIME ZONE,
  title text,
  score int,
  username text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    posts.id, 
    posts.user_id, 
    posts.created_at, 
    post_contents.title, 
    post_score.score, 
    user_profiles.username
  FROM posts
  JOIN post_contents ON posts.id = post_contents.post_id
  JOIN post_score ON posts.id = post_score.post_id
  JOIN user_profiles ON posts.user_id = user_profiles.user_id
  WHERE posts.path ~ 'root'
  ORDER BY post_score.score DESC, posts.created_at DESC
  LIMIT 10
  OFFSET (page_number - 1) * 10;
END;$$;

-- Function: Create new post
CREATE OR REPLACE FUNCTION create_new_post("userId" uuid, "title" text, "content" text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  WITH inserted_post AS (
    INSERT INTO posts (user_id, path)
    VALUES ($1, 'root')
    RETURNING id
  )
  INSERT INTO post_contents (post_id, title, content, user_id)
  VALUES ((SELECT id FROM inserted_post), $2, $3, $1);
  RETURN true;
END; $$;

-- Function: Initialize post score on new post
CREATE OR REPLACE FUNCTION initialize_post_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $initialize_post_score$
BEGIN
  INSERT INTO post_score (post_id, score)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;$initialize_post_score$;

-- Trigger for new posts
DROP TRIGGER IF EXISTS initialize_post_score_trigger ON posts;
CREATE TRIGGER initialize_post_score
  AFTER INSERT
  ON posts
  FOR EACH ROW EXECUTE PROCEDURE initialize_post_score();

-- Function: Get single post with comments
CREATE OR REPLACE FUNCTION get_single_post_with_comments(post_id uuid)
RETURNS TABLE (
  id uuid,
  author_name text,
  created_at timestamp WITH TIME ZONE,
  title text,
  content text,
  score int,
  path ltree
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    posts.id,
    user_profiles.username,
    posts.created_at,
    post_contents.title,
    post_contents.content,
    post_score.score,
    posts.path
  FROM posts
  JOIN post_contents ON posts.id = post_contents.post_id
  JOIN post_score ON posts.id = post_score.post_id
  JOIN user_profiles ON posts.user_id = user_profiles.user_id
  WHERE posts.path <@ text2ltree(concat('root.', replace(concat($1, ''), '-', '_')))
    OR posts.id = $1;
END;$$;

-- Function: Create new comment
CREATE OR REPLACE FUNCTION create_new_comment(user_id uuid, content text, path ltree)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  WITH inserted_post AS (
    INSERT INTO posts (user_id, path)
    VALUES ($1, $3)
    RETURNING id
  )
  INSERT INTO post_contents (post_id, title, content, user_id)
  VALUES ((SELECT id FROM inserted_post), '', $2, $1);
  RETURN true;
END; $$;

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "all can see profiles" ON user_profiles
  AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "users can insert profile" ON user_profiles
  AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update profile" ON user_profiles
  AS PERMISSIVE FOR UPDATE TO public
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "all can see posts" ON posts
  AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "owners can insert posts" ON posts
  AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- RLS Policies for post_contents
CREATE POLICY "all can see content" ON post_contents
  AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "authors can create content" ON post_contents
  AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- RLS Policies for post_score
CREATE POLICY "all can see scores" ON post_score
  AS PERMISSIVE FOR SELECT TO public USING (true);

-- RLS Policies for post_votes
CREATE POLICY "all can see votes" ON post_votes
  AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "owners can insert vote" ON post_votes
  AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update vote" ON post_votes
  AS PERMISSIVE FOR UPDATE TO public
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Real-time subscription for post_score
BEGIN;
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete');
ALTER PUBLICATION supabase_realtime ADD TABLE post_score;
COMMIT;

-- Success message
SELECT '✅ Database setup complete!' AS message;
