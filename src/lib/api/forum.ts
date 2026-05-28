import { supabase } from '@/lib/supabase';
import { Channel, Message } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannelRow(row: any): Channel {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    unreadCount: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessageRow(row: any): Message {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      username: row.profiles.username,
      displayName: row.profiles.display_name,
      bio: row.profiles.bio ?? undefined,
      isPrivate: row.profiles.is_private,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    content: row.content,
    channelId: row.channel_id,
    createdAt: row.created_at,
    mediaUrls: row.media_urls ?? undefined,
    mediaTypes: row.media_types ?? undefined,
  };
}

export async function fetchChannels(): Promise<Channel[]> {
  const { data, error } = await supabase.from('channels').select('*').order('name');
  if (error || !data) return [];
  return data.map(mapChannelRow);
}

export async function fetchChannelMessages(channelId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('channel_messages')
    .select('*, profiles(*)')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error || !data) return [];
  return data.map(mapMessageRow);
}

export async function insertChannelMessage(params: {
  channelId: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('channel_messages')
    .insert({
      channel_id: params.channelId,
      author_id: params.authorId,
      content: params.content,
      media_urls: params.mediaUrls?.length ? params.mediaUrls : null,
      media_types: params.mediaTypes?.length ? params.mediaTypes : null,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return data.id;
}

export async function fetchOneChannelMessage(messageId: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('channel_messages')
    .select('*, profiles(*)')
    .eq('id', messageId)
    .single();
  if (error || !data) return null;
  return mapMessageRow(data);
}
