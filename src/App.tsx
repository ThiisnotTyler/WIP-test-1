import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Network, Play, Volume2, Maximize, Minimize, Settings, SignalHigh, 
  Activity, Radio, Menu, Video, Music, Info, Search as SearchIcon, User, Tv, Heart, Pause, X 
} from 'lucide-react';

import VideoPlayer from './VideoPlayer';
import { playSound } from './utils/audio';
import { filterSafeContent, filterAgeRestricted } from './utils/contentFilter';
import { getRadioServer } from './services/radioBrowser';


import { FEEDS, AUDIO, CHANNELS } from './data/mockData';

import { MenuOption } from './components/MenuOption';
import { DvrList } from './components/DvrList';
import { ChannelGuide } from './components/ChannelGuide';
import { SearchView } from './components/SearchView';
import { FavoritesView } from './components/FavoritesView';
import { SettingsView } from './components/SettingsView';
import { P2PView } from './components/P2PView';
import { RadioView } from './components/RadioView';
import { GlobalClock } from "./components/GlobalClock";
import { BroadcastStudio } from './components/BroadcastStudio';

export default function App() {
  const [ageRestrictedMode, setAgeRestrictedMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_ageRestrictedMode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_ageRestrictedMode', JSON.stringify(ageRestrictedMode));
  }, [ageRestrictedMode]);
    const [safeMode, setSafeMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_safemode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_safemode', JSON.stringify(safeMode));
  }, [safeMode]);

  const [curatedMode, setCuratedMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_curatedmode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_curatedmode', JSON.stringify(curatedMode));
  }, [curatedMode]);



  const [appTheme, setAppTheme] = useState<string>(() => {
    return localStorage.getItem('nexus_appTheme') || 'original';
  });
  
  useEffect(() => {
    localStorage.setItem('nexus_appTheme', appTheme);
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  const [userTier, setUserTier] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_userTier');
      return saved !== null ? Number(saved) : 3;
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_userTier', String(userTier));
  }, [userTier]);
  const [currentView, setCurrentView] = useState<'MENU' | 'FEEDS' | 'TV_VIDEO' | 'AUDIO' | 'SEARCH' | 'FAVORITES' | 'SETTINGS' | 'STUDIO' | 'P2P'>('MENU');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [customFeeds, setCustomFeeds] = useState<any[]>([]);

  useEffect(() => {
    if (currentView === 'FEEDS') {
      try {
        const saved = localStorage.getItem('nexus_custom_feeds');
        if (saved) setCustomFeeds(JSON.parse(saved));
      } catch(e) {}
    }
  }, [currentView]);
  
  // Radio API State
  const [radioStations, setRadioStations] = useState<any[]>([]);
  const [radioOffset, setRadioOffset] = useState(0);
  const [hasMoreRadio, setHasMoreRadio] = useState(true);
  
  // Audio Player State
  const [activeMedia, setActiveMedia] = useState<any | null>(null);
  const [adState, setAdState] = useState<'NONE' | 'PREROLL' | 'MAIN' | 'POSTROLL'>('NONE');
  const [isPlaying, setIsPlaying] = useState(false);
  const currentPlaybackUrl = React.useMemo(() => {
    if (!activeMedia) return null;
    if (adState === 'PREROLL' && activeMedia.preRollAd) return activeMedia.preRollAd;
    if (adState === 'POSTROLL' && activeMedia.postRollAd) return activeMedia.postRollAd;
    return activeMedia.url;
  }, [activeMedia, adState]);
  const [isPipExpanded, setIsPipExpanded] = useState(false);
  const isAdPlaying = adState === 'PREROLL' || adState === 'POSTROLL';
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showUI, setShowUI] = useState(true);
  const [scaleMode, setScaleMode] = useState<'contain' | 'cover'>('contain');

  useEffect(() => {
    let timeout: any;
    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(timeout);
      if (isFullscreen) {
        timeout = setTimeout(() => setShowUI(false), 3000);
      }
    };
    
    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove);
      timeout = setTimeout(() => setShowUI(false), 3000);
    } else {
      setShowUI(true);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const videoPlayerRef = useRef<any>(null);

  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setPlayedSeconds(time);
    if (activeMedia?.isVideo && videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [activeMedia]);
  const activeMediaId = activeMedia?.url || activeMedia?.id;

  const toggleFavorite = useCallback((item: any) => {
    setFavorites(prev => prev.some(f => f.id === item.id) ? prev.filter(f => f.id !== item.id) : [...prev, item]);
  }, []);
  
  const loadRadioStations = useCallback(async (offset: number) => {
    try {
      const baseUrl = await getRadioServer();
      const res = await fetch(`${baseUrl}/json/stations/search?limit=30&offset=${offset}&hidebroken=true&order=clickcount&reverse=true&is_https=true`);
      const data = await res.json();
      if (data.length === 0) setHasMoreRadio(false);
      
      const formatted = data.map((s: any) => ({
        id: s.stationuuid,
        title: s.name.trim() || 'Unknown Station',
        desc: s.tags ? `Tags: ${s.tags.split(',').slice(0, 5).join(', ')}` : 'Live Radio Broadcast',
        freq: s.bitrate ? `${s.bitrate} kbps` : 'Auto',
        url: s.url_resolved,
        category: 'Audio Stream',
        isRadioStream: true
      }));
      
      setRadioStations(prev => offset === 0 ? formatted : [...prev, ...formatted]);
      setRadioOffset(offset);
    } catch (e) {
      console.error("Radio fetch failed", e);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'AUDIO' && radioStations.length === 0) {
      loadRadioStations(0);
    }
  }, [currentView, radioStations.length, loadRadioStations]);
  
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (activeMedia && (!activeMedia.isVideo) && activeMedia.url) {
        if (audioRef.current.src !== currentPlaybackUrl) {
          audioRef.current.src = currentPlaybackUrl;
        }
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                console.error("Playback error:", error);
              }
            });
          }
        } else {
          audioRef.current.pause();
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [activeMedia, isPlaying]);

  const handlePlayMedia = useCallback((item: any) => {
    const mediaId = item.url || item.id;
    if (activeMediaId === mediaId) {
      if (audioRef.current && (!item.isVideo)) {
        if (audioRef.current.paused) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                console.error("Playback error:", error);
              }
            });
          }
        }
        else audioRef.current.pause();
      } else {
        setIsPlaying(!isPlaying);
      }
    } else {
      setActiveMedia(item);
      if (item.preRollAd) setAdState('PREROLL');
      else setAdState('MAIN');
      const isAutoplay = localStorage.getItem('nexus_autoplayEnabled') !== 'false';
      setIsPlaying(isAutoplay);
    }
  }, [activeMediaId, isPlaying]);

    const handleMediaEnded = useCallback(() => {
    if (!activeMedia) {
      setIsPlaying(false);
      return;
    }

    if (adState === 'PREROLL') {
      setAdState('MAIN');
      return;
    }
    if (adState === 'MAIN' && activeMedia.postRollAd) {
      setAdState('POSTROLL');
      return;
    }
    
    setAdState('NONE');

    // First, see if we are a TV channel program
    if (activeMedia.category === 'TV & Movies') {
      let foundProg = false;
      let allChannels = [...CHANNELS];
      try {
        const saved = localStorage.getItem('nexus_custom_channel');
        if (saved) {
          const customChannel = JSON.parse(saved);
          if (customChannel && customChannel.programs) {
            allChannels.push(customChannel);
          }
        }
      } catch(e) {}
      
      for (const ch of allChannels) {
        const progIndex = ch.programs.findIndex((p: any) => p.id === activeMedia.id);
        if (progIndex !== -1) {
          foundProg = true;
          if (progIndex + 1 < ch.programs.length) {
            handlePlayMedia({ ...ch.programs[progIndex + 1], category: 'TV & Movies' });
            return;
          }
        }
      }
    }
    
    // Check if it's an audio/radio
    if (activeMedia.category === 'Radio' || activeMedia.category === 'Music') {
      const idx = AUDIO.findIndex(a => a.id === activeMedia.id);
      if (idx !== -1 && idx + 1 < AUDIO.length) {
        handlePlayMedia(AUDIO[idx + 1]);
        return;
      }
    }
    
    // Check if it's a feed
    if (activeMedia.category === 'Live Feed') {
      // Need to grab current customFeeds from local storage to auto-play correctly
      let feeds: any[] = [];
      try {
        const saved = localStorage.getItem('nexus_custom_feeds');
        if (saved) feeds = JSON.parse(saved);
      } catch(e) {}
      
      const idx = feeds.findIndex((f: any) => f.id === activeMedia.id);
      if (idx !== -1 && idx + 1 < feeds.length) {
        handlePlayMedia(feeds[idx + 1]);
        return;
      }
    }
    
    // If no next item found, stop playing
    setIsPlaying(false);
  }, [activeMedia, adState, handlePlayMedia]);
  
  
  
  
  



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          if (activeMedia?.isVideo && activeMedia?.url) {
            playSound('select');
            setIsFullscreen(prev => !prev);
          }
          break;
        case 's':
          if (isFullscreen) {
            playSound('select');
            setScaleMode(prev => prev === 'contain' ? 'cover' : 'contain');
          }
          break;
        case ' ':
          if (activeMedia) {
            e.preventDefault();
            playSound('select');
            setIsPlaying(prev => !prev);
          }
          break;
        case 'escape':
          if (isFullscreen) {
            playSound('select');
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMedia, isFullscreen]);

  const handleBackToMenu = useCallback(() => { setCurrentView('MENU'); }, []);
  const handleToggleFullscreen = useCallback(() => setIsFullscreen(true), []);

  return (
    <div className="min-h-screen font-sans selection:bg-accent/50 overflow-hidden flex flex-col bg-gradient-to-br from-canvas-start via-canvas-mid to-canvas-end">

      
      
      
      <audio 
        onTimeUpdate={(e) => { if (!isSeeking) setPlayedSeconds(e.currentTarget.currentTime); }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} 
        ref={audioRef} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)} 
        onEnded={handleMediaEnded}
      />

      {/* Top Header / Branding */}
      <header className="px-8 py-6 shrink-0 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-accent to-[#FF9900] rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 border-2 border-accent/50">
            <Tv className="w-8 h-8 text-text-inv" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tight drop-shadow-md">Nexus Central</h1>
            <p className="text-text-main/60 font-medium tracking-wide text-sm">Media & Surveillance DVR</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4 z-50">
          {/* PIP Video Preview */}
        {activeMedia ? (
          <div className={
            isFullscreen
              ? `fixed inset-0 z-[100] bg-video-bg flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 ${!showUI ? "cursor-none" : ""}`
              : "hidden md:flex flex-col items-end animate-in fade-in zoom-in duration-700 z-50"
          }>
            <div 
              onClick={() => {
                if (!isFullscreen) {
                  playSound('select');
                  setIsPipExpanded(!isPipExpanded);
                }
              }}
              onDoubleClick={() => {
                if (isFullscreen) {
                  playSound('select');
                  setScaleMode(prev => prev === 'contain' ? 'cover' : 'contain');
                }
              }}
              className={
                isFullscreen
                  ? "w-full h-full relative"
                  : `${isPipExpanded ? 'w-[480px]' : 'w-64'} aspect-video bg-video-bg rounded-xl border-4 ${isPlaying ? 'border-accent' : 'border-panel-border'} shadow-2xl overflow-hidden relative group cursor-pointer transition-all duration-300`
              }
            >
              {/* Actual Video Player Background */}
              {activeMedia.isVideo && activeMedia.url && (
                 <div className={`absolute inset-0 z-0 bg-video-bg overflow-hidden flex items-center justify-center`}>
                    <VideoPlayer ref={videoPlayerRef} onProgress={(t: number) => { if (!isSeeking) setPlayedSeconds(t); }} onDuration={setDuration} onEnded={handleMediaEnded} className={`relative z-10 w-full h-full transition-all duration-500 ${isFullscreen ? (scaleMode === 'contain' ? 'object-contain' : 'object-cover') : 'object-cover pointer-events-none'}`} 
                      url={currentPlaybackUrl}
                      loop={false} 
                      playing={isPlaying} 
                      width="100%" 
                      height="100%" 
                      volume={volume}
                      controls={false}
                    />
                 </div>
              )}

              {/* PIP Overlay Content - Hidden in Fullscreen */}
              {!isFullscreen && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-2 left-3 z-20 w-full pr-6 pointer-events-none">
                    <div className="text-xs font-extrabold text-accent drop-shadow-md flex items-center gap-2">
                      {isPlaying ? (
                        isAdPlaying ? <span className="text-yellow-500">ADVERTISEMENT</span> : <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                        </span>
                      ) : 'PAUSED'}
                    </div>
                    <div className="text-[11px] text-text-main font-extrabold truncate pr-2">{activeMedia.title}</div>
                    <div className="text-[9px] text-text-dim truncate pr-2">{activeMedia.category || 'Media'}</div>
                  </div>
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-panel">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound('select');
                        handlePlayMedia(activeMedia);
                      }}
                      className="w-14 h-14 rounded-full bg-white/20 hover:bg-accent text-text-main hover:text-text-inv flex items-center justify-center transition-colors backdrop-blur shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>
                    {!isFullscreen && activeMedia.isVideo && activeMedia.url && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('select');
                          setIsFullscreen(true);
                        }}
                        className="absolute top-2 right-2 text-text-main p-2 hover:bg-accent hover:text-text-inv rounded-full transition-colors"
                      >
                        <Maximize className="w-5 h-5 drop-shadow-md" />
                      </button>
                    )}
                  </div>

                  {/* Visualizer if Playing */}
                  {isPlaying && (!activeMedia.isVideo) && (
                     <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-center gap-1 opacity-50 z-0">
                       {[...Array(isPipExpanded ? 32 : 16)].map((_, i) => (
                         <div key={i} className="w-1.5 bg-accent rounded-t-sm animate-[pulse_0.5s_ease-in-out_infinite_alternate]" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }} />
                       ))}
                     </div>
                  )}
                  
                  <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                </>
              )}
              
              {/* Fullscreen Overlay Content */}
              {isFullscreen && (
                <div 
                  className={`absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-6 z-[110] transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                  onClick={(e) => e.stopPropagation()}
                >
                   {/* Scrub Bar */}
                   {duration > 0 && (
                     <div className="flex items-center gap-4 w-full">
                       <span className="text-text-dim text-sm font-extrabold font-mono">{formatTime(playedSeconds)}</span>
                       <input 
                         type="range" min="0" max={duration || 1} step="0.1"
                         value={playedSeconds}
                         onChange={handleSeekChange}
                         onMouseDown={() => setIsSeeking(true)}
                         onMouseUp={() => setIsSeeking(false)}
                         onTouchStart={() => setIsSeeking(true)}
                         onTouchEnd={() => setIsSeeking(false)}
                         className="flex-1 accent-accent h-1.5 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.5)]"
                       />
                       <span className="text-text-dim text-sm font-extrabold font-mono">{formatTime(duration)}</span>
                     </div>
                   )}
                   
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                       <button onClick={(e) => { e.stopPropagation(); playSound('select'); setIsPlaying(!isPlaying); }} className="text-text-main hover:text-accent transition-colors">
                         {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                       </button>
                       <div className="flex items-center gap-3">
                         <Volume2 className="w-6 h-6 text-text-main drop-shadow-md" />
                         <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-32 accent-accent h-1.5 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" />
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <button
                         onClick={(e) => {
                            e.stopPropagation();
                            playSound('select');
                            setScaleMode(prev => prev === 'contain' ? 'cover' : 'contain');
                         }}
                         className="text-text-main hover:text-accent transition-colors bg-panel p-4 rounded-full backdrop-blur border border-panel-border"
                         title={scaleMode === 'contain' ? "Fill Screen" : "Fit to Screen"}
                       >
                         {scaleMode === 'contain' ? <Maximize className="w-8 h-8" /> : <Minimize className="w-8 h-8" />}
                       </button>
                       <button
                         onClick={(e) => {
                            e.stopPropagation();
                            playSound('select');
                            setIsFullscreen(false);
                         }}
                         className="text-text-main hover:text-red-500 transition-colors bg-panel p-4 rounded-full backdrop-blur border border-panel-border"
                         title="Exit Fullscreen"
                       >
                         <X className="w-8 h-8" />
                       </button>
                     </div>
                   </div>
                </div>
              )}

            </div>
            
            {/* PIP Volume Bar (Hidden in Fullscreen) */}
            {!isFullscreen && (
              <div className="mt-3 bg-video-overlay backdrop-blur-md rounded-full px-4 py-2.5 border border-panel-border flex items-center gap-3 shadow-2xl transition-all duration-300">
                <Volume2 className="w-4 h-4 text-text-dim" />
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  className="w-24 accent-accent h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" 
                />
              </div>
            )}
          </div>
        ) : (
          <div className={`hidden md:flex flex-col items-end animate-in fade-in zoom-in duration-700 opacity-50 ${currentView !== 'MENU' ? 'hidden md:hidden' : ''}`}>
            <div className="w-64 aspect-video bg-panel rounded-xl border-4 border-panel-border overflow-hidden relative flex items-center justify-center">
               <span className="text-text-main/30 text-xs font-extrabold tracking-widest">NO SIGNAL</span>
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
            </div>
          </div>
        )}
        </div>

      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-8 pb-8 overflow-hidden">
        
        {currentView === 'MENU' && (
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-md flex flex-col gap-3 animate-in slide-in-from-left-8 duration-500">
              
              {userTier > 1 && !ageRestrictedMode && (
                <MenuOption 
                  label="Search All" 
                  icon={SearchIcon} 
                  onClick={() => setCurrentView('SEARCH')} 
                />
              )}
              
              {userTier > 1 && (
                <MenuOption 
                  label="My Favorites" 
                  icon={Heart} 
                  onClick={() => setCurrentView('FAVORITES')} 
                />
              )}
              
              <div className="h-px bg-panel my-2 w-3/4 mx-auto" />
              
              <MenuOption 
                label="TV & Movies" 
                icon={Video} 
                onClick={() => setCurrentView('TV_VIDEO')} 
              />
              
              {userTier > 1 && (
                <MenuOption 
                  label="Live Feeds" 
                  icon={Activity} 
                  onClick={() => setCurrentView('FEEDS')} 
                />
              )}
              
              <MenuOption 
                label="Audio & Radio" 
                icon={Music} 
                onClick={() => setCurrentView('AUDIO')} 
              />
              
              {userTier >= 2 && (
                <>
                  <div className="h-px bg-panel my-2 w-3/4 mx-auto" />
                  <MenuOption 
                    label="P2P Network" 
                    icon={Network} 
                    onClick={() => setCurrentView('P2P')} 
                  />
                </>
              )}
              
              {userTier >= 3 && (
                <>
                  <div className="h-px bg-panel my-2 w-3/4 mx-auto" />
                  <MenuOption 
                    label="Broadcast Studio" 
                    icon={Tv} 
                    onClick={() => setCurrentView('STUDIO')} 
                  />
                </>
              )}
              <div className="h-px bg-panel my-2 w-3/4 mx-auto" />

              <MenuOption 
                label="Settings & Messages" 
                icon={Settings} 
                onClick={() => setCurrentView('SETTINGS')} 
              />
              
            </div>
          </div>
        )}

        {currentView === 'TV_VIDEO' && (
          <ChannelGuide 
             ageRestrictedMode={ageRestrictedMode}
             onBack={handleBackToMenu} 
             favorites={favorites} 
             toggleFavorite={toggleFavorite} 
             activeMediaId={activeMediaId}
             onPlayAudio={handlePlayMedia}
             isPlaying={isPlaying}
            onToggleFullscreen={handleToggleFullscreen}
           />
        )}

        {currentView === 'FEEDS' && (
          <DvrList 
            title="Live Feeds" 
            items={(ageRestrictedMode ? filterAgeRestricted(customFeeds) : customFeeds).filter(i => safeMode ? filterSafeContent([i]).length > 0 : true)} 
            onBack={handleBackToMenu} 
            renderItemMeta={(i: any) => i.viewers + ' view'}
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            activeMediaId={activeMediaId}
            onPlayAudio={handlePlayMedia}
            isPlaying={isPlaying}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'AUDIO' && (
          <RadioView 
            onBack={handleBackToMenu}
            ageRestrictedMode={ageRestrictedMode}
            safeMode={safeMode}
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            activeMediaId={activeMediaId}
            onPlayAudio={handlePlayMedia}
            isPlaying={isPlaying}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'SEARCH' && (
          <SearchView 
            ageRestrictedMode={ageRestrictedMode}
            onBack={handleBackToMenu}
            safeMode={safeMode}
            curatedMode={curatedMode}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            activeMediaId={activeMediaId}
            onPlayAudio={handlePlayMedia}
            isPlaying={isPlaying}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'FAVORITES' && (
          <FavoritesView 
            onBack={handleBackToMenu}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            activeMediaId={activeMediaId}
            onPlayAudio={handlePlayMedia}
            isPlaying={isPlaying}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'STUDIO' && (
          <BroadcastStudio userTier={userTier} onBack={handleBackToMenu} onPlayAudio={handlePlayMedia} />
        )}
        {currentView === 'P2P' && (
          <P2PView onBack={() => setCurrentView('MENU')} />
        )}
        {currentView === 'SETTINGS' && (
          <SettingsView 
            onBack={handleBackToMenu} 
            safeMode={safeMode} 
            setSafeMode={setSafeMode}
            ageRestrictedMode={ageRestrictedMode}
            setAgeRestrictedMode={setAgeRestrictedMode}
            curatedMode={curatedMode}
            setCuratedMode={setCuratedMode}
            userTier={userTier}
            setUserTier={setUserTier}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
          />
        )}

      </main>
      
      {/* Bottom info bar */}
      <footer className="px-8 py-3 bg-panel border-t border-panel-border shrink-0 flex justify-end items-center backdrop-blur-md">
        <GlobalClock />
      </footer>
    </div>
  );
}
