-- get_posts RPC 関数
-- Supabase の SQL Editor に貼って実行する
-- posts + profiles + tags + counts + is_liked/is_bookmarked を1クエリで返す

CREATE OR REPLACE FUNCTION get_posts(requesting_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id              UUID,
  author_id       UUID,
  username        TEXT,
  display_name    TEXT,
  bio             TEXT,
  is_private      BOOLEAN,
  content         TEXT,
  type            TEXT,
  parent_id       UUID,
  is_solved       BOOLEAN,
  media_urls      TEXT[],
  media_types     TEXT[],
  created_at      TIMESTAMPTZ,
  tags            TEXT[],
  likes_count     BIGINT,
  replies_count   BIGINT,
  bookmarks_count BIGINT,
  is_liked        BOOLEAN,
  is_bookmarked   BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.author_id,
    pr.username,
    pr.display_name,
    pr.bio,
    pr.is_private,
    p.content,
    p.type,
    p.parent_id,
    p.is_solved,
    p.media_urls,
    p.media_types,
    p.created_at,
    COALESCE(ARRAY_AGG(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '{}') AS tags,
    COUNT(DISTINCT l.user_id)  AS likes_count,
    COUNT(DISTINCT r.id)       AS replies_count,
    COUNT(DISTINCT bk.user_id) AS bookmarks_count,
    COALESCE(BOOL_OR(l.user_id  = requesting_user_id), FALSE) AS is_liked,
    COALESCE(BOOL_OR(bk.user_id = requesting_user_id), FALSE) AS is_bookmarked
  FROM posts p
  JOIN  profiles  pr ON pr.id       = p.author_id
  LEFT JOIN post_tags pt ON pt.post_id   = p.id
  LEFT JOIN likes     l  ON l.post_id    = p.id
  LEFT JOIN posts     r  ON r.parent_id  = p.id
  LEFT JOIN bookmarks bk ON bk.post_id   = p.id
  WHERE p.parent_id IS NULL
    AND (pr.is_private = FALSE OR p.author_id = requesting_user_id)
  GROUP BY p.id, pr.username, pr.display_name, pr.bio, pr.is_private
  ORDER BY p.created_at DESC;
$$;
