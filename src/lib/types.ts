export type PostType = 'post' | 'question' | 'info' | 'article';

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  type: PostType;
  tags: string[];
  likesCount: number;
  repliesCount: number;
  bookmarksCount: number;
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
  parentId?: string;
  replies?: Post[];
  isSolved?: boolean;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}

export interface Notification {
  id: string;
  type: 'like' | 'reply' | 'follow' | 'mention';
  from: User;
  post?: Post;
  createdAt: string;
  read: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  unreadCount: number;
  lastMessage?: string;
}

export interface Message {
  id: string;
  author: User;
  content: string;
  channelId: string;
  createdAt: string;
  threadCount?: number;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}

export interface DMConversation {
  id: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt: string;
}

export interface DMMessage {
  id: string;
  author: User;
  content: string;
  conversationId: string;
  createdAt: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'video')[];
}

export type Theme = 'dark' | 'light';
