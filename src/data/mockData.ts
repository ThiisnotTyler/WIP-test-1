import { Tv, Activity, Radio } from 'lucide-react';

export const TV_VIDEO = [
  { id: 'tv1', title: 'Global News Network', res: '4K', type: 'LIVE', status: 'ONLINE', desc: 'Live coverage of global events, breaking news, and market updates.' },
  { id: 'tv2', title: 'Sci-Fi Classics', ageRestricted: true, res: '1080p', type: 'VOD', status: 'ONLINE', desc: 'A curated marathon of 80s and 90s science fiction cinema.' },
  { id: 'tv3', title: 'Sports Central', res: '1080p', type: 'LIVE', status: 'ONLINE', desc: 'Live weekend playoffs, scores, and post-game analysis.' },
  { id: 'tv4', title: 'Documentary Channel', res: '720p', type: 'VOD', status: 'OFFLINE', desc: 'Award-winning nature and historical documentaries.' },
  { id: 'tv5', title: 'Local Broadcast', res: '1080p', type: 'LIVE', status: 'ONLINE', desc: 'Your local regional broadcast for weather and community news.' },
];

export const FEEDS: any[] = [];

export const AUDIO = [
  { id: 'a1', title: 'ATC Tower Ch-1', freq: '118.700 MHz', quality: 'HQ', desc: 'Air Traffic Control primary communications channel.' },
  { id: 'a2', title: 'Ground Control', freq: '121.900 MHz', quality: 'SQ', desc: 'Taxiway and ground movement coordination.' },
  { id: 'a3', title: 'Emergency Relay', freq: '121.500 MHz', quality: 'HQ', desc: 'International air distress and emergency frequency.' },
  { id: 'a4', title: 'Weather Broadcast', freq: '162.550 MHz', quality: 'LQ', desc: 'Automated meteorological terminal information service.' },
  { id: 'a5', title: 'Security Tac-1', ageRestricted: true, freq: '460.125 MHz', quality: 'HQ', desc: 'Encrypted tactical frequency for facility security.' },
];

export const CHANNELS: any[] = [];

export const ALL_CONTENT = [
  ...CHANNELS.flatMap(c => c.programs.map(p => ({ ...p, category: 'TV & Movies', icon: Tv }))),
  ...FEEDS.map(i => ({ ...i, category: 'Live Feed', icon: Activity })),
  ...AUDIO.map(i => ({ ...i, category: 'Audio Stream', icon: Radio }))
];
