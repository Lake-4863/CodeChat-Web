import { supabase } from '@/lib/supabase';
import { Post, PostType } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Post {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      username: row.username,
      displayName: row.display_name,
      bio: row.bio ?? undefined,
      isPrivate: row.is_private,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    content: row.content,
    type: row.type as PostType,
    tags: row.tags ?? [],
    likesCount: Number(row.likes_count ?? 0),
    repliesCount: Number(row.replies_count ?? 0),
    bookmarksCount: Number(row.bookmarks_count ?? 0),
    createdAt: row.created_at,
    isLiked: row.is_liked ?? false,
    isBookmarked: row.is_bookmarked ?? false,
    parentId: row.parent_id ?? undefined,
    isSolved: row.is_solved ?? false,
    mediaUrls: row.media_urls ?? undefined,
    mediaTypes: row.media_types ?? undefined,
  };
}

export async function fetchPosts(userId?: string): Promise<Post[]> {
  const { data, error } = await supabase.rpc('get_posts', {
    requesting_user_id: userId ?? null,
  });
  if (error || !data) return [];
  return (data as unknown[]).map(mapRow);
}

export async function insertPost(params: {
  content: string;
  type: PostType;
  tags: string[];
  authorId: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: params.content,
      type: params.type,
      author_id: params.authorId,
      media_urls: params.mediaUrls?.length ? params.mediaUrls : null,
      media_types: params.mediaTypes?.length ? params.mediaTypes : null,
    })
    .select('id')
    .single();

  if (error || !data) return null;

  if (params.tags.length > 0) {
    await supabase.from('post_tags').insert(
      params.tags.map(tag => ({ post_id: data.id, tag }))
    );
  }

  return data.id;
}

export async function likePost(postId: string, userId: string) {
  await supabase.from('likes').insert({ user_id: userId, post_id: postId });
}

export async function unlikePost(postId: string, userId: string) {
  await supabase.from('likes').delete().match({ user_id: userId, post_id: postId });
}

export async function bookmarkPost(postId: string, userId: string) {
  await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId });
}

export async function unbookmarkPost(postId: string, userId: string) {
  await supabase.from('bookmarks').delete().match({ user_id: userId, post_id: postId });
}
