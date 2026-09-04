import React from 'react';
import { ChevronLeft, Heart, Play, Pause, Volume2 } from 'lucide-react';
import { playSound } from '../utils/audio';
import { DvrList } from './DvrList';

export const FavoritesView = React.memo(function FavoritesView({ onBack, favorites, toggleFavorite, activeMediaId, onPlayAudio, isPlaying, onToggleFullscreen }: any) {
  const favoriteItems = favorites;

  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <button 
            onClick={() => {
              playSound('select');
              onBack();
            }} 
            className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">My Favorites</h2>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 text-text-dim border-4 border-panel-border border-dashed rounded-3xl bg-panel">
          <Heart className="w-24 h-24 mb-6 opacity-20" />
          <p className="text-2xl font-bold">No favorites added yet.</p>
          <p className="text-lg mt-2 opacity-70">Select the heart icon on any program or feed.</p>
        </div>
      </div>
    );
  }

  return (
    <DvrList 
      title="My Favorites" 
      items={favoriteItems} 
      onBack={onBack} 
      renderItemMeta={(i: any) => i.category || 'Favorite'}
      favorites={favorites} 
      toggleFavorite={toggleFavorite}
      activeMediaId={activeMediaId}
      onPlayAudio={onPlayAudio}
      isPlaying={isPlaying}
            onToggleFullscreen={() => onToggleFullscreen()}
    />
  );
}


);
