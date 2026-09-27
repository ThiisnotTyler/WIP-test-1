import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Network, Play, Settings, SignalHigh, 
  Activity, Radio, Menu, Video, Music, Info, Search as SearchIcon, User, Tv, Heart, X, AlertTriangle 
} from 'lucide-react';

import { playSound } from './utils/audio';
import { filterSafeContent, filterAgeRestricted } from './utils/contentFilter';
import { getRadioServer } from './services/radioBrowser';
import { useMediaPlayer } from './hooks/useMediaPlayer';


import { useSettings } from './context/SettingsContext';

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
import { FloatingPlayer } from './components/player/FloatingPlayer';

export default function App() {
  const {
    ageRestrictedMode,
    safeMode,
    curatedMode,
    appTheme,
    userTier
  } = useSettings();

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
  
  const {
    activeMedia,
    activeMediaId,
    adState,
    isPlaying,
    setIsPlaying,
    isPipExpanded,
    setIsPipExpanded,
    isFullscreen,
    setIsFullscreen,
    showUI,
    scaleMode,
    setScaleMode,
    volume,
    setVolume,
    playedSeconds,
    setPlayedSeconds,
    duration,
    setDuration,
    isSeeking,
    setIsSeeking,
    playbackError,
    setPlaybackError,
    audioRef,
    videoPlayerRef,
    isAdPlaying,
    currentPlaybackUrl,
    handlePlayMedia,
    handleMediaEnded,
    handleToggleFullscreen,
    handleSeekChange,
    formatTime,
  } = useMediaPlayer();

  const toggleFavorite = useCallback((item: any) => {
    setFavorites(prev => prev.some(f => f.id === item.id) ? prev.filter(f => f.id !== item.id) : [...prev, item]);
  }, []);

  const handleBackToMenu = useCallback(() => { setCurrentView('MENU'); }, []);

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
            <p className="text-text-main/60 font-medium tracking-wide text-sm">Media in your hands</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4 z-50">
          <FloatingPlayer
            activeMedia={activeMedia}
            currentPlaybackUrl={currentPlaybackUrl}
            isPlaying={isPlaying}
            isAdPlaying={isAdPlaying}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            isPipExpanded={isPipExpanded}
            setIsPipExpanded={setIsPipExpanded}
            scaleMode={scaleMode}
            setScaleMode={setScaleMode}
            showUI={showUI}
            volume={volume}
            setVolume={setVolume}
            videoPlayerRef={videoPlayerRef}
            duration={duration}
            setDuration={setDuration}
            playedSeconds={playedSeconds}
            setPlayedSeconds={setPlayedSeconds}
            isSeeking={isSeeking}
            setIsSeeking={setIsSeeking}
            handleSeekChange={handleSeekChange}
            handleMediaEnded={handleMediaEnded}
            handlePlayMedia={handlePlayMedia}
            formatTime={formatTime}
            currentView={currentView}
          />
        </div>

      </header>

      
      {playbackError && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-8 fade-in duration-300">
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold tracking-wide">{playbackError}</span>
            <button onClick={() => setPlaybackError(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
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
