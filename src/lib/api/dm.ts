import { supabase } from '@/lib/supabase';
import { DMConversation, DMMessage } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapConversationRow(row: any, currentUserId: string): DMConversation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members: any[] = row.dm_members ?? [];
  const participants = members
    .filter((m) => m.user_id !== currentUserId && m.profiles)
    .map((m) => ({
      id: m.profiles.id,
      username: m.profiles.username,
      displayName: m.profiles.display_name,
      bio: m.profiles.bio ?? undefined,
      isPrivate: m.profiles.is_private,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    }));
  return {
    id: row.id,
    isGroup: row.is_group,
    groupName: row.group_name ?? undefined,
    participants,
    unreadCount: 0,
    lastMessageAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDMMessageRow(row: any): DMMessage {
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
    conversationId: row.conversation_id,
    createdAt: row.created_at,
    mediaUrls: row.media_urls ?? undefined,
    mediaTypes: row.media_types ?? undefined,
  };
}

export async function fetchMyConversations(userId: string): Promise<DMConversation[]> {
  const { data, error } = await supabase
    .from('dm_conversations')
    .select('*, dm_members(user_id, profiles(*))')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => mapConversationRow(row, userId));
}

export async function fetchDMMessages(conversationId: string): Promise<DMMessage[]> {
  const { data, error } = await supabase
    .from('dm_messages')
    .select('*, profiles(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error || !data) return [];
  return data.map(mapDMMessageRow);
}

export async function insertDMMessage(params: {
  conversationId: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('dm_messages')
    .insert({
      conversation_id: params.conversationId,
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

export async function fetchOneDMMessage(messageId: string): Promise<DMMessage | null> {
  const { data, error } = await supabase
    .from('dm_messages')
    .select('*, profiles(*)')
    .eq('id', messageId)
    .single();
  if (error || !data) return null;
  return mapDMMessageRow(data);
}
