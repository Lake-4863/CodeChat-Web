'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { User, Post, Theme } from '@/lib/types';
import { currentUser } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { fetchPosts, insertPost, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '@/lib/api/posts';
import type { Session } from '@supabase/supabase-js';

interface AppContextValue {
  user: User;
  posts: Post[];
  postsLoading: boolean;
  theme: Theme;
  toggleTheme: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  isShortcutHelpOpen: boolean;
  setShortcutHelpOpen: (v: boolean) => void;
  isNewPostModalOpen: boolean;
  setNewPostModalOpen: (v: boolean) => void;
  addPost: (post: Post) => Promise<void>;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<string | null>;
  lastFocusedPostId: string | null;
  setLastFocusedPostId: (id: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isShortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [isNewPostModalOpen, setNewPostModalOpen] = useState(false);
  const [lastFocusedPostId, setLastFocusedPostId] = useState<string | null>(null);

  // session ref for use inside callbacks without stale closure
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  const loadPosts = useCallback(async (userId?: string) => {
    setPostsLoading(true);
    const data = await fetchPosts(userId);
    setPosts(data);
    setPostsLoading(false);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        username: data.username,
        displayName: data.display_name,
        bio: data.bio ?? undefined,
        isPrivate: data.is_private,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      });
    }
    setAuthLoading(false);
    loadPosts(userId);
  }, [loadPosts]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('light', next === 'light');
      return next;
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (
    email: string, password: string, username: string, displayName: string,
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username, display_name: displayName } },
    });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const addPost = useCallback(async (post: Post) => {
    // optimistic update
    setPosts(prev => [post, ...prev]);

    const userId = sessionRef.current?.user.id;
    if (!userId) return;

    const dbId = await insertPost({
      content: post.content,
      type: post.type,
      tags: post.tags,
      authorId: userId,
      mediaUrls: post.mediaUrls,
      mediaTypes: post.mediaTypes,
    });

    if (dbId) {
      // replace temp id with real DB id
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, id: dbId } : p));
    } else {
      // rollback on failure
      setPosts(prev => prev.filter(p => p.id !== post.id));
    }
  }, []);

  const toggleLike = useCallback((postId: string) => {
    const userId = sessionRef.current?.user.id;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const nowLiked = !p.isLiked;
      if (userId) {
        if (nowLiked) likePost(postId, userId);
        else unlikePost(postId, userId);
      }
      return { ...p, isLiked: nowLiked, likesCount: nowLiked ? p.likesCount + 1 : p.likesCount - 1 };
    }));
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    const userId = sessionRef.current?.user.id;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const nowBookmarked = !p.isBookmarked;
      if (userId) {
        if (nowBookmarked) bookmarkPost(postId, userId);
        else unbookmarkPost(postId, userId);
      }
      return { ...p, isBookmarked: nowBookmarked, bookmarksCount: nowBookmarked ? p.bookmarksCount + 1 : p.bookmarksCount - 1 };
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      user: profile ?? currentUser,
      posts,
      postsLoading,
      theme,
      toggleTheme,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      isShortcutHelpOpen,
      setShortcutHelpOpen,
      isNewPostModalOpen,
      setNewPostModalOpen,
      addPost,
      toggleLike,
      toggleBookmark,
      isAuthenticated: !!session,
      authLoading,
      signIn,
      signOut,
      signUp,
      lastFocusedPostId,
      setLastFocusedPostId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
