import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, ChevronLeft, Filter, Music, Radio, Loader2, AlertTriangle } from 'lucide-react';
import { getRadioServer } from '../services/radioBrowser';
import { playSound } from '../utils/audio';
import { filterSafeContent } from '../utils/contentFilter';
import { DvrList } from './DvrList';

const POPULAR_TAGS = ['pop', 'news', 'jazz', 'rock', 'classical', 'hip hop', 'country', 'dance', 'talk'];
const POPULAR_COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'France', 'Germany', 'Japan', 'Brazil'];

export const RadioView = ({ onBack, ageRestrictedMode, safeMode, favorites, toggleFavorite, activeMediaId, onPlayAudio, isPlaying, onToggleFullscreen }: any) => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchStations = useCallback(async (currentOffset = 0, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = await getRadioServer();
      const params = new URLSearchParams({
        limit: '30',
        offset: currentOffset.toString(),
        hidebroken: 'true',
        order: 'clickcount',
        reverse: 'true',
        is_https: 'true'
      });

      if (searchQuery) params.append('name', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      if (selectedCountry) params.append('country', selectedCountry);

      const res = await fetch(`${baseUrl}/json/stations/search?${params.toString()}`);
      const data = await res.json();
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const formatted = data.map((s: any) => ({
        id: s.stationuuid,
        title: s.name.trim() || 'Unknown Station',
        desc: s.tags ? `Tags: ${s.tags.split(',').slice(0, 5).join(', ')}` : 'Live Radio Broadcast',
        freq: s.bitrate ? `${s.bitrate} kbps` : 'Auto',
        url: s.url_resolved,
        category: 'Audio Stream',
        isRadioStream: true
      }));

      setStations(prev => {
        if (reset) return formatted;
        const newStations = [...prev];
        formatted.forEach((s: any) => {
          if (!newStations.find(existing => existing.id === s.id)) {
            newStations.push(s);
          }
        });
        return newStations;
      });
      setOffset(currentOffset);
    } catch (e) {
      setError("Failed to fetch stations. Please try again.");
      console.error("Radio fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTag, selectedCountry]);

  useEffect(() => {
    fetchStations(0, true);
  }, [fetchStations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('nav');
    fetchStations(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchStations(offset + 30, false);
    }
  };

  const filteredItems = stations.filter(i => safeMode ? filterSafeContent([i]).length > 0 : true);

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-300">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button 
           onClick={() => { playSound('select'); onBack(); }} 
           className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md flex items-center gap-3">
          <Radio className="w-8 h-8 text-accent" />
          Global Internet Radio
        </h2>
      </div>

      <div className="bg-panel border border-panel-border rounded-xl p-4 mb-6 shrink-0 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-3 text-text-dim">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station name..."
              className="w-full bg-panel-solid border border-panel-border rounded-lg pl-10 pr-4 py-2.5 text-text-main placeholder-text-dim/50 focus:outline-none focus:border-accent transition-colors font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { playSound('nav'); setShowFilters(!showFilters); }}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors border ${showFilters ? 'bg-accent/20 border-accent text-accent' : 'bg-panel-solid border-panel-border text-text-main hover:bg-panel'}`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent/80 text-text-inv font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              Search
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-panel-border flex flex-col md:flex-row gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex-1">
              <label className="text-xs font-bold text-text-main tracking-widest uppercase mb-2 block">Genre / Tag</label>
              <select 
                value={selectedTag} 
                onChange={(e) => { setSelectedTag(e.target.value); playSound('nav'); }}
                className="w-full bg-panel-solid border border-panel-border rounded-lg px-3 py-2 text-text-main focus:border-accent outline-none font-mono text-sm"
              >
                <option value="">Any Genre</option>
                {POPULAR_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-bold text-text-main tracking-widest uppercase mb-2 block">Country</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => { setSelectedCountry(e.target.value); playSound('nav'); }}
                className="w-full bg-panel-solid border border-panel-border rounded-lg px-3 py-2 text-text-main focus:border-accent outline-none font-mono text-sm"
              >
                <option value="">Any Country</option>
                {POPULAR_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
                {loading && stations.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-dim">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-accent" />
            <p className="font-bold tracking-widest">TUNING FREQUENCIES...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-dim px-4 text-center">
            <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
            <p className="font-bold tracking-widest text-red-500">{error}</p>
            <button onClick={() => fetchStations(0, true)} className="mt-4 px-6 py-2 bg-panel-solid border border-panel-border rounded-lg hover:bg-panel text-text-main transition-colors font-bold">Try Again</button>
          </div>
        ) : (
          <DvrList
            items={filteredItems}
            renderItemMeta={(i: any) => i.freq}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            activeMediaId={activeMediaId}
            onPlayAudio={onPlayAudio}
            isPlaying={isPlaying}
            onToggleFullscreen={onToggleFullscreen}
            hideHeader={true}
          />
        )}
      </div>
    </div>
  );
};
