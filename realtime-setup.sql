-- Supabase Realtime を有効化する
-- Supabase SQL Editor に貼って実行する

ALTER PUBLICATION supabase_realtime ADD TABLE channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE dm_messages;
