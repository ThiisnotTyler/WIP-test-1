import { Film, Music } from 'lucide-react';

export const searchArchive = async (query: string, page: number = 1, signal?: AbortSignal) => {
  if (!query.trim()) return [];
  

  // Use the advanced search API, looking specifically for movies or audio
  // We request identifier, title, mediatype, and description
  const curatedCollections = '(collection:feature_films OR collection:moviesandfilms OR collection:opensource_movies OR collection:classic_tv OR collection:SciFi_Horror OR collection:Comedy_Films OR collection:animationandcartoons OR collection:oldtimeradio OR collection:radioprograms OR collection:educationalfilms OR collection:prelinger)';
  let searchUrl = '';
  if (query.trim()) {
    const q = query.trim();
    const qWords = q.split(/\s+/).join(' AND ');
    // We search the exact phrase, all words in title, or the exact phrase in description.
    // By sorting by downloads, we ensure the most popular (highest quality) versions rise to the top.
    const solrQuery = `((title:("${q}") OR title:(${qWords}) OR description:("${q}")) AND ${curatedCollections})`;
    searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(solrQuery)}&fl[]=identifier,title,mediatype,description&sort[]=downloads+desc&rows=15&page=${page}&output=json`;
  } else {
    searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(curatedCollections)}&fl[]=identifier,title,mediatype,description&sort[]=downloads+desc&rows=15&page=${page}&output=json`;
  }

  const response = await fetch(searchUrl, { signal });
  if (!response.ok) throw new Error('Archive search failed');
  
  const data = await response.json();
  const docs = data.response?.docs || [];

  if (docs.length === 0) return [];

  // Fetch metadata concurrently for the top 10 items to find playable files
  const detailedResults = await Promise.all(
    docs.map(async (doc: any) => {
      try {
        const metaRes = await fetch(`https://archive.org/metadata/${doc.identifier}`, { signal });
        if (!metaRes.ok) return null;
        const metaData = await metaRes.json();
        const files = metaData.files || [];

        // Attempt to find a playable media file
        let playableFile = null;
        let isVideo = doc.mediatype === 'movies';

        if (isVideo) {
          // Prefer mp4 or standard h.264
          playableFile = files.find((f: any) => 
            f.name.endsWith('.mp4') || 
            f.format === 'h.264' || 
            f.format === '512Kb MPEG4'
          );
        } else {
          // Prefer mp3
          playableFile = files.find((f: any) => 
            f.name.endsWith('.mp3') || 
            f.format === 'VBR MP3' || 
            f.format === '128Kbps MP3'
          );
        }

        if (!playableFile) return null;

        const description = doc.description 
          ? doc.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...' 
          : 'Internet Archive Broadcast';

        return {
          id: doc.identifier,
          thumbnail: `https://archive.org/services/img/${doc.identifier}`,
          title: doc.title || 'Unknown Archive',
          desc: description,
          url: `https://archive.org/download/${doc.identifier}/${playableFile.name}`,
          category: isVideo ? 'Archive Video' : 'Archive Audio',
          icon: isVideo ? Film : Music,
          isVideo: isVideo,
          isRadioStream: false,
          isArchive: true
        };
      } catch (err) {
        // If an individual metadata fetch fails or aborts, ignore it
        return null;
      }
    })
  );

  // Filter out any nulls where we couldn't find a playable file
  return detailedResults.filter(Boolean);
};
