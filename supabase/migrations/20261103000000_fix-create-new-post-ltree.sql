-- Fix create_new_post: cast text to ltree and make UUID ltree-safe
-- Error 42804: column "path" is of type ltree but expression is of type text

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
  -- Create the post (replace '-' with '_' since hyphens are invalid in ltree labels)
  INSERT INTO posts (user_id, path)
  VALUES (userId, ('root.' || replace(gen_random_uuid()::text, '-', '_'))::ltree)
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
