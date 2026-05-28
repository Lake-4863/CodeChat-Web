-- =============================================
-- CodeChat スキーマ
-- Supabase の SQL Editor に貼って実行する
-- =============================================

-- ① プロフィール（auth.users と 1:1 で紐づく）
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio          TEXT,
  is_private   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ② フォロー関係
CREATE TABLE follows (
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- ③ 投稿
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT CHECK (type IN ('post', 'question', 'info', 'article')) DEFAULT 'post',
  parent_id   UUID REFERENCES posts(id) ON DELETE SET NULL,
  is_solved   BOOLEAN DEFAULT FALSE,
  media_urls  TEXT[],
  media_types TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ④ タグ
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag     TEXT NOT NULL,
  PRIMARY KEY (post_id, tag)
);

-- ⑤ いいね
CREATE TABLE likes (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ⑥ ブックマーク
CREATE TABLE bookmarks (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ⑦ 通知
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type       TEXT CHECK (type IN ('like', 'reply', 'follow', 'mention')) NOT NULL,
  from_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑧ フォーラムチャンネル
CREATE TABLE channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ⑨ フォーラムメッセージ
CREATE TABLE channel_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  media_urls  TEXT[],
  media_types TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ⑩ DM会話
CREATE TABLE dm_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group   BOOLEAN DEFAULT FALSE,
  group_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⑪ DM参加者
CREATE TABLE dm_members (
  conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- ⑫ DMメッセージ
CREATE TABLE dm_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE NOT NULL,
  author_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content         TEXT NOT NULL,
  media_urls      TEXT[],
  media_types     TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security（RLS）
-- =============================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages     ENABLE ROW LEVEL SECURITY;

-- プロフィール：全員が読める、自分だけ書ける
CREATE POLICY "profiles_read"   ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 投稿：公開アカウントは全員が読める
CREATE POLICY "posts_read" ON posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = posts.author_id
      AND (profiles.is_private = FALSE OR profiles.id = auth.uid())
  )
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- タグ：投稿に準ずる
CREATE POLICY "post_tags_read"   ON post_tags FOR SELECT USING (TRUE);
CREATE POLICY "post_tags_insert" ON post_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
);

-- いいね：全員が読める、自分だけ書ける
CREATE POLICY "likes_read"   ON likes FOR SELECT USING (TRUE);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- ブックマーク：自分だけ読み書きできる
CREATE POLICY "bookmarks_read"   ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- フォロー：全員が読める
CREATE POLICY "follows_read"   ON follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 通知：自分宛だけ読める
CREATE POLICY "notifications_read"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- チャンネル：全員が読める
CREATE POLICY "channels_read" ON channels FOR SELECT USING (TRUE);

-- フォーラムメッセージ：全員が読める、ログイン済みが書ける
CREATE POLICY "channel_messages_read"   ON channel_messages FOR SELECT USING (TRUE);
CREATE POLICY "channel_messages_insert" ON channel_messages FOR INSERT WITH CHECK (auth.uid() = author_id);

-- DM：参加者だけ読み書きできる
CREATE POLICY "dm_conversations_read" ON dm_conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM dm_members WHERE dm_members.conversation_id = id AND dm_members.user_id = auth.uid())
);
CREATE POLICY "dm_members_read" ON dm_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM dm_members m WHERE m.conversation_id = conversation_id AND m.user_id = auth.uid())
);
CREATE POLICY "dm_messages_read" ON dm_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM dm_members WHERE dm_members.conversation_id = conversation_id AND dm_members.user_id = auth.uid())
);
CREATE POLICY "dm_messages_insert" ON dm_messages FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (SELECT 1 FROM dm_members WHERE dm_members.conversation_id = conversation_id AND dm_members.user_id = auth.uid())
);

-- =============================================
-- ユーザー作成時に自動でプロフィールを作るトリガー
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 初期チャンネルデータ
-- =============================================

INSERT INTO channels (name, description) VALUES
  ('general',     '雑談・なんでも'),
  ('javascript',  'JS/TS全般'),
  ('help',        '質問・サポート'),
  ('rust',        'Rust言語'),
  ('ml-research', 'ML・AI研究');
