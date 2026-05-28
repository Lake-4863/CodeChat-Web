import { User } from './types';

interface StoredUser extends User {
  password: string;
}

// Seed accounts — username / password: "password"
const seedUsers: StoredUser[] = [
  { id: 'u0', username: 'lake',        password: 'password', displayName: 'Lake',       bio: 'Builder. Keyboard enthusiast. #TypeScript #React', isPrivate: false, followersCount: 142, followingCount: 87,  postsCount: 203 },
  { id: 'u1', username: 'tsuru',       password: 'password', displayName: 'Tsuru Dev',  bio: 'Rust & systems programming',                       isPrivate: false, followersCount: 891, followingCount: 234, postsCount: 512 },
  { id: 'u2', username: 'akari_codes', password: 'password', displayName: 'Akari',      bio: 'Frontend wizard. CSS is magic.',                   isPrivate: false, followersCount: 1203, followingCount: 445, postsCount: 678 },
  { id: 'u3', username: 'zen_backend', password: 'password', displayName: 'Zen',        bio: 'Go, PostgreSQL, k8s. Keep it simple.',             isPrivate: true,  followersCount: 320, followingCount: 98,  postsCount: 180 },
  { id: 'u4', username: 'nova_ml',     password: 'password', displayName: 'Nova ML',    bio: 'LLMs, embeddings, inference optimization',         isPrivate: false, followersCount: 4200, followingCount: 201, postsCount: 934 },
];

// In-memory store (resets on page refresh)
let users: StoredUser[] = [...seedUsers];

export function authenticate(username: string, password: string): User | null {
  const found = users.find(u => u.username === username && u.password === password);
  if (!found) return null;
  const { password: _, ...user } = found;
  return user;
}

export function register(username: string, password: string, displayName: string): { user: User } | { error: string } {
  if (users.find(u => u.username === username)) {
    return { error: 'このユーザー名は既に使われています' };
  }
  if (username.length < 3) return { error: 'ユーザー名は3文字以上にしてください' };
  if (password.length < 6) return { error: 'パスワードは6文字以上にしてください' };

  const newUser: StoredUser = {
    id: `u${Date.now()}`,
    username,
    password,
    displayName: displayName || username,
    isPrivate: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  };
  users.push(newUser);
  const { password: _, ...user } = newUser;
  return { user };
}
