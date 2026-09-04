import { Video } from 'lucide-react';

export const searchOdysee = async (query: string, page: number = 1, signal?: AbortSignal, curatedMode: boolean = false) => {
  if (!query.trim() || query.trim().length < 3) return [];

  const fetchSize = curatedMode ? 50 : 15;
  const offset = (page - 1) * fetchSize;
  
  // Step 1: Search Lighthouse for claim IDs
  const searchRes = await fetch(
    `https://lighthouse.odysee.com/search?s=${encodeURIComponent(query)}&size=${fetchSize}&from=${offset}&mediaType=video`, 
    { signal }
  );
  
  if (!searchRes.ok) throw new Error(`Odysee Lighthouse search failed: ${searchRes.status} ${searchRes.statusText} - ${await searchRes.text()}`);
  
  const searchData = await searchRes.json();
  if (!searchData || !searchData.length) return [];

  const claimIds = searchData.map((d: any) => d.claimId).filter(Boolean);
  if (!claimIds.length) return [];

  // Step 2: Resolve claim IDs to metadata via LBRY API
  const resolveRes = await fetch('https://api.na-backend.odysee.com/api/v1/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'claim_search',
      params: {
        claim_ids: claimIds
      },
      id: 1
    }),
    signal
  });

  if (!resolveRes.ok) throw new Error('Odysee resolve failed');

  const resolveData = await resolveRes.json();
  const items = resolveData?.result?.items || [];

  return items.map((item: any) => {
    const value = item.value || {};
    const title = value.title || item.name || 'Unknown Video';
    const desc = (value.description || '').replace(/<[^>]+>/g, '').substring(0, 120) + '...';
    const thumbnailUrl = value.thumbnail?.url || null;
    
    return {
      id: item.claim_id,
      title: title,
      desc: desc,
      thumbnail: thumbnailUrl,
      url: `https://odysee.com/$/download/${item.name}/${item.claim_id}`,
      category: 'Odysee Video',
      icon: Video,
      isVideo: true,
      isRadioStream: false,
      isArchive: false,
      duration: value.video?.duration || 0
    };
  });
};
