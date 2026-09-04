import { getRadioServer } from './radioBrowser';
import { Radio } from 'lucide-react';

export const searchRadio = async (query: string, offset: number = 0, signal?: AbortSignal) => {
  if (!query.trim()) return [];
  

  const baseUrl = await getRadioServer();
  const res = await fetch(
    `${baseUrl}/json/stations/search?limit=15&offset=${offset}&hidebroken=true&order=clickcount&reverse=true&is_https=true${query.trim() ? '&name=' + encodeURIComponent(query) : ''}`,
    { signal }
  );
  
  if (!res.ok) throw new Error('Radio search failed');
  
  const data = await res.json();
  
  return data.map((s: any) => ({
    id: s.stationuuid,
    title: s.name.trim() || 'Unknown Station',
    desc: s.tags ? `Tags: ${s.tags.split(',').slice(0, 5).join(', ')}` : 'Live Radio Broadcast',
    url: s.url_resolved,
    category: 'Audio Stream',
    icon: Radio,
    isVideo: false,
    isRadioStream: true,
    isArchive: false
  }));
};
