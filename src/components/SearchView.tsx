import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search as SearchIcon, Filter, X, Heart, Play, Pause, Volume2, Radio } from 'lucide-react';
import { playSound } from '../utils/audio';
import { ALL_CONTENT } from '../data/mockData';
import { searchRadio } from '../services/radio';
import { searchArchive } from '../services/archive';
import { searchOdysee } from '../services/odysee';
import { filterSafeContent, filterCuratedContent } from '../utils/contentFilter';



const LoadingScanner = () => {
  const [textIndex, setTextIndex] = useState(0);
  const phrases = [
    "ESTABLISHING SECURE CONNECTION...",
    "QUERYING GLOBAL RADIO DATABASES...",
    "ACCESSING INTERNET ARCHIVE...",
    "PARSING MEDIA METADATA...",
    "ISOLATING PLAYABLE STREAMS...",
    "DECRYPTING AUDIO/VIDEO PACKETS...",
    "ASSEMBLING RESULTS..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % phrases.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto py-12">
      <div className="w-full h-32 bg-panel border border-accent/30 rounded-xl relative overflow-hidden mb-8 flex items-end justify-between p-6 shadow-inner">
        {/* Scanning Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_15px_2px_rgba(var(--theme-accent-rgb),0.8)] animate-[scan_2s_linear_infinite]" style={{ top: 0, animationName: 'scan' }} />
        
        {/* Animated Data Bars */}
        {[...Array(16)].map((_, i) => (
          <div 
            key={i} 
            className="w-3 bg-accent rounded-t-sm animate-[pulse_0.4s_ease-in-out_infinite_alternate]" 
            style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s`, opacity: Math.random() * 0.5 + 0.3 }} 
          />
        ))}
      </div>
      
      <div className="font-mono text-accent flex flex-col items-center gap-3 text-center">
        <span className="text-2xl font-bold tracking-[0.2em] uppercase animate-pulse">Scanning</span>
        <span className="text-xs opacity-70 tracking-widest">{phrases[textIndex]}</span>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 100%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export const SearchView = React.memo(function SearchView({ onBack, onPlayAudio, activeMediaId, isPlaying, toggleFavorite, favorites, safeMode, curatedMode, ageRestrictedMode }: any) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSource, setActiveSource] = useState('ALL');
  const [activeType, setActiveType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMoreApi, setHasMoreApi] = useState(false);

  const sources = [
    { id: 'ALL', label: 'All Sources' },
    { id: 'RADIO', label: 'Live Radio' },
    { id: 'ARCHIVE', label: 'Internet Archive' },
    { id: 'ODYSEE', label: 'Odysee' }
  ];

  const types = [
    { id: 'ALL', label: 'All Types' },
    { id: 'VIDEO', label: 'Video / .mp4' },
    { id: 'AUDIO', label: 'Audio / .mp3' },
  ];



  useEffect(() => {
    if (!submittedQuery.trim()) {
      setApiResults([]);
      setIsSearching(false);
      setHasMoreApi(false);
      return;
    }
    
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchApiResults = async () => {
      setIsSearching(true);
      try {
        let combinedResults: any[] = [];
        const fetchPromises = [];
        
        if (activeSource === 'ALL' || activeSource === 'RADIO') {
          fetchPromises.push(searchRadio(submittedQuery, (page - 1) * 15, signal).catch(e => {
            if (e.name !== 'AbortError') console.error("Radio API Error:", e);
            return [];
          }));
        }
        
        if (activeSource === 'ALL' || activeSource === 'ARCHIVE') {
          fetchPromises.push(searchArchive(submittedQuery, page, signal).catch(e => {
            if (e.name !== 'AbortError') console.error("Archive API Error:", e);
            return [];
          }));
        }
        
        if (activeSource === 'ALL' || activeSource === 'ODYSEE') {
          fetchPromises.push(searchOdysee(submittedQuery, page, signal, curatedMode).catch(e => {
            if (e.name !== 'AbortError') console.error("Odysee API Error:", e);
            return [];
          }));
        }

        const resultsArrays = await Promise.all(fetchPromises);
        combinedResults = resultsArrays.flat();

        if (!signal.aborted) {
          setApiResults(combinedResults);
          setHasMoreApi(combinedResults.length > 0);
          setIsSearching(false);
        }
      } catch (e: any) {
        if (!signal.aborted) {
          console.error("API search failed", e);
          setIsSearching(false);
        }
      }
    };
    
    fetchApiResults();
    
    return () => {
      controller.abort();
    };
  }, [submittedQuery, activeSource, page]);



  const clearFilters = () => {
    setPage(1);
    playSound('nav');
    setActiveSource('ALL');
    setActiveType('ALL');
    setQuery('');
    setSubmittedQuery('');
  };

  const isFiltering = activeSource !== 'ALL' || activeType !== 'ALL' || query !== '';


  const getRelevanceScore = (item: any, query: string) => {
    if (!query.trim()) return 0;
    const q = query.toLowerCase().trim();
    const t = item.title.toLowerCase();
    const d = (item.desc || '').toLowerCase();
    
    let score = 0;
    
    // Exact matches
    if (t === q) score += 100;
    else if (t.startsWith(q)) score += 50;
    else if (t.includes(q)) score += 20;
    
    // Description weighting
    if (d.includes(q)) score += 10;
    
    // Quality adjustments
    // Penalize items with extremely short descriptions or titles (often low quality or noise)
    if (d.length < 10) score -= 5;
    if (t.length < 3) score -= 5;
    
    // Penalize audio-only items if they aren't explicit live radio (since users usually expect video when searching globally)
    if (!item.isVideo && item.isArchive) score -= 15;
    
    return score;
  };

  let localResults = submittedQuery.trim() 
    ? ALL_CONTENT.filter(c => c.title.toLowerCase().includes(submittedQuery.toLowerCase()) || (c.desc && c.desc.toLowerCase().includes(submittedQuery.toLowerCase())))
    : [];
    
  if (safeMode) {
    localResults = filterSafeContent(localResults);
  }
  if (curatedMode) {
    localResults = filterCuratedContent(localResults);
  }
  if (ageRestrictedMode) {
    localResults = localResults.filter((c: any) => c.ageRestricted !== true);
  }
    
  let processedApiResults = safeMode ? filterSafeContent(apiResults) : apiResults;
  if (curatedMode) {
    processedApiResults = filterCuratedContent(processedApiResults);
  }
  
  let allFetchedResults = [...localResults, ...processedApiResults];
  
  if (submittedQuery.trim()) {
    allFetchedResults = allFetchedResults
      .map(item => ({ ...item, _score: getRelevanceScore(item, submittedQuery) }))
      .sort((a, b) => b._score - a._score);
  }


  const results = allFetchedResults.filter(item => {
    if (activeSource !== 'ALL') {
      if (activeSource === 'LOCAL' && (item.isRadioStream || item.isArchive)) return false;
      if (activeSource === 'RADIO' && !item.isRadioStream) return false;
      if (activeSource === 'ARCHIVE' && !item.isArchive) return false;
      if (activeSource === 'ODYSEE') return false; // not implemented yet
    }
    if (activeType !== 'ALL') {
      const itemIsVideo = item.isVideo || item.category === 'Live Feed' || item.category === 'TV & Movies';
      if (activeType === 'VIDEO' && !itemIsVideo) return false;
      if (activeType === 'AUDIO' && itemIsVideo) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              playSound('select');
              onBack();
            }} 
            className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">Search All</h2>
        </div>
        
        {isFiltering && (
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500 hover:text-text-main text-red-400 font-bold rounded-full flex items-center gap-2 transition-colors border border-red-500/50"
          >
            <X className="w-4 h-4" /> Clear Filters
          </button>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 flex-1 min-h-0">
        <form 
          className="relative shrink-0 flex gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
            setPage(1);
          }}
        >
          <div className="relative flex-1">
            <input 
              autoFocus
              type="text" 
              placeholder="Search TV, Feeds, & Audio streams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-panel border-2 border-panel-border rounded-full px-8 py-4 pl-16 text-2xl text-text-main font-bold outline-none focus:border-accent focus:bg-white/20 transition-all placeholder:text-text-main/30 shadow-lg"
            />
            <SearchIcon className="w-8 h-8 text-text-dim absolute left-6 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 rounded-full font-bold text-text-inv bg-accent hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)] shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 bg-panel p-4 rounded-2xl border border-panel-border">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-text-dim" />
            <span className="text-text-dim font-bold uppercase tracking-wider text-sm">Source</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map(s => (
              <button 
                key={s.id}
                onClick={() => { playSound('nav'); setActiveSource(s.id); setPage(1); setPage(1); }}
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors border ${activeSource === s.id ? 'bg-accent border-accent text-text-inv shadow-md scale-[1.02]' : 'bg-panel border-panel-border text-text-dim hover:bg-panel-hover hover:text-text-main'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 bg-panel p-4 rounded-2xl border border-panel-border mt-[-1rem]">
           <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-text-dim" />
            <span className="text-text-dim font-bold uppercase tracking-wider text-sm">Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button 
                key={t.id}
                onClick={() => { playSound('nav'); setActiveType(t.id); setPage(1); }}
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors border ${activeType === t.id ? 'bg-accent border-accent text-text-inv shadow-md scale-[1.02]' : 'bg-panel border-panel-border text-text-dim hover:bg-panel-hover hover:text-text-main'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-panel rounded-3xl p-4 flex-1 overflow-y-auto border border-panel-border hide-scrollbar shadow-inner">
          {(!submittedQuery.trim()) ? (
            <div className="flex flex-col items-center justify-center h-full text-text-dim">
              <SearchIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-xl font-bold">Press Search to begin...</p>
            </div>
          ) : isSearching ? (
             <LoadingScanner />
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-2 pb-8">
              {results.map((item: any) => (
                <div key={item.id} className="flex gap-2">
                  <button
                    onClick={() => {
                      playSound('select');
                      if (onPlayAudio) {
                        onPlayAudio(item);
                      }
                    }}
                    className={`group flex items-center justify-between flex-1 min-w-0 text-left py-4 px-6 rounded-2xl transition-all duration-200 border-2 border-transparent hover:bg-accent hover:border-accent ${activeMediaId === (item.url || item.id) ? 'bg-white text-text-inv shadow-[0_4px_15px_rgba(255,255,255,0.2)]' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {item.thumbnail ? (
                        <div className="w-24 h-16 sm:w-32 sm:h-20 bg-panel rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-panel-border group-hover:border-black/20">
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon on image load failure
                              (e.target as HTMLElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent && parent.nextElementSibling) {
                                (parent.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center">
                            {item.icon ? <item.icon className={`w-6 h-6 ${activeMediaId === (item.url || item.id) ? 'text-text-inv' : 'text-text-dim'} group-hover:text-text-inv/60`} /> : <Radio className="w-6 h-6 text-text-dim" />}
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-16 sm:w-32 sm:h-20 bg-panel rounded-lg shrink-0 flex items-center justify-center border border-panel-border group-hover:border-black/20">
                          {item.icon ? <item.icon className={`w-8 h-8 ${activeMediaId === (item.url || item.id) ? 'text-text-inv' : 'text-text-dim'} group-hover:text-text-inv/60`} /> : <Radio className="w-8 h-8 text-text-dim" />}
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1 flex flex-col pt-1">
                        <div className={`text-lg sm:text-xl font-bold truncate ${activeMediaId === (item.url || item.id) ? 'text-text-inv' : 'text-text-main'} group-hover:text-text-inv`}>{item.title}</div>
                        <div className={`text-xs sm:text-sm font-bold truncate ${activeMediaId === (item.url || item.id) ? 'text-text-inv/60' : 'text-accent group-hover:text-text-inv/60'} mb-1`}>{item.category}</div>
                        {item.desc && (
                          <div className={`text-xs sm:text-sm line-clamp-2 leading-tight ${activeMediaId === (item.url || item.id) ? 'text-text-inv/80' : 'text-text-dim'} group-hover:text-text-inv/80`}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center ml-4">
                      {activeMediaId === (item.url || item.id) && isPlaying ? (
                        <Pause className="w-6 h-6 text-text-inv" />
                      ) : (
                        <Play className={`w-6 h-6 ${activeMediaId === (item.url || item.id) ? 'text-text-inv' : 'text-text-main/30'} group-hover:text-text-inv`} />
                      )}
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      playSound('select');
                      toggleFavorite(item);
                    }}
                    className="w-16 shrink-0 bg-panel hover:bg-panel-hover rounded-2xl flex items-center justify-center transition-colors group border-2 border-transparent hover:border-panel-border"
                  >
                    <Heart className={`w-6 h-6 transition-colors ${favorites.some((f: any) => f.id === item.id) ? 'fill-accent text-accent' : 'text-text-main group-hover:text-accent'}`} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between mt-4 gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isSearching}
                  className="flex-1 py-4 rounded-2xl font-bold text-text-main bg-panel border border-panel-border hover:bg-accent hover:text-text-inv hover:border-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous Page
                </button>
                <div className="text-text-dim font-bold px-4">
                  Page {page}
                </div>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMoreApi || isSearching}
                  className="flex-1 py-4 rounded-2xl font-bold text-text-main bg-panel border border-panel-border hover:bg-accent hover:text-text-inv hover:border-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next Page
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-dim">
              <SearchIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl font-bold">No results found.</p>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}


);
