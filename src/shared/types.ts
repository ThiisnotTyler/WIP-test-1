export interface MediaItem {
  id: string;
  title: string;
  url?: string;
  thumbnail?: string;
  isStream?: boolean;
  type?: 'VIDEO' | 'AUDIO';
  description?: string;
  viewerCount?: number;
  category?: string;
  nsfw?: boolean;
  requiresTier?: number;
}

export interface TorrentItem {
  id: string;
  title: string;
  magnet: string;
}

export interface User {
  id: string;
  email: string;
  tier: number;
}
