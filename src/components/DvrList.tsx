import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Heart, Maximize, Info, Pause, Volume2 } from 'lucide-react';
import { playSound } from '../utils/audio';

export const DvrList = React.memo(function DvrList({ title, items, onBack, renderItemMeta, favorites, toggleFavorite, onLoadMore, hasMore, activeMediaId, onPlayAudio, isPlaying, onToggleFullscreen, hideHeader }: any) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!items.find((i: any) => i.id === selectedId) && items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    if (hasMore && onLoadMore && currentPage >= totalPages - 2) {
      onLoadMore();
    }
  }, [currentPage, totalPages, hasMore, onLoadMore]);

  const activeItem = items.find((i: any) => i.id === selectedId) || items[0];

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1);
      playSound('nav');
    } else if (hasMore) {
      if (onLoadMore) onLoadMore();
      setCurrentPage(p => p + 1);
      playSound('nav');
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
      playSound('nav');
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
      {!hideHeader && (
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
          <h2 className="text-3xl font-extrabold text-text-main shadow-black drop-shadow-md">{title}</h2>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Left Side: Paginated List */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2 relative">
          <div className="flex flex-col gap-2 flex-1">
            {paginatedItems.length > 0 ? paginatedItems.map((item: any) => (
              <button
                key={item.id}
                onMouseEnter={() => {
                  if (selectedId !== item.id) playSound('nav');
                }}
                onClick={() => {
                  playSound('select');
                  setSelectedId(item.id);
                }}
                className={`group flex flex-col items-start w-full text-left py-3 px-6 rounded-full transition-all duration-200 border-2 ${
                  selectedId === item.id ? 'bg-accent border-accent scale-[1.02] shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)] z-10' : 'bg-panel border-transparent hover:bg-panel hover:border-panel-border'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-lg font-extrabold truncate pr-4 transition-colors ${selectedId === item.id ? 'text-text-inv' : 'text-text-main group-hover:text-text-main'}`}>{item.title}</span>
                  <span className={`text-sm font-extrabold shrink-0 transition-colors ${selectedId === item.id ? 'text-text-inv/70' : 'text-text-dim group-hover:text-text-dim'}`}>
                    {renderItemMeta(item)}
                  </span>
                </div>
              </button>
            )) : (
              <div className="flex-1 flex items-center justify-center text-text-dim font-extrabold font-mono">
                FETCHING SIGNAL...
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between bg-panel p-2 rounded-full border border-panel-border mt-2 shrink-0 shadow-lg">
            <button onClick={goPrev} disabled={currentPage === 0} className="p-2 rounded-full hover:bg-panel disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-main">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-text-main/60 font-extrabold font-mono text-sm tracking-widest">
              PAGE {currentPage + 1} {totalPages > 0 ? `OF ${Math.max(totalPages, currentPage + 1)}` : ''}
            </span>
            <button onClick={goNext} disabled={currentPage >= totalPages - 1 && !hasMore} className="p-2 rounded-full hover:bg-panel disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-text-main">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side: Details Panel */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {activeItem && (
            <div className="bg-panel border-2 border-panel-border rounded-2xl p-6 shadow-2xl backdrop-blur flex flex-col gap-4 h-full">
              <div className="w-full aspect-video bg-video-bg rounded-lg border border-panel-border overflow-hidden relative flex items-center justify-center">
                 {activeMediaId === (activeItem.url || activeItem.id) ? (
                   <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-video-overlay">
                      <div className="w-16 h-16 border-4 border-accent rounded-full flex items-center justify-center animate-pulse mb-4 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.4)]">
                         <Play className="w-8 h-8 text-accent ml-1" />
                      </div>
                      <span className="text-accent font-extrabold tracking-widest text-sm">NOW PLAYING</span>
                   </div>
                 ) : (
                   <Play className="w-12 h-12 text-text-main/30" />
                 )}
                 <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                 {/* Visualizer overlay if playing */}
                 {activeMediaId === (activeItem.url || activeItem.id) && isPlaying && (!activeItem.isVideo && activeItem.category !== 'Live Feed' && activeItem.category !== 'TV & Movies') && (
                   <div className="absolute bottom-0 left-4 right-4 h-16 flex items-end justify-center gap-1.5 opacity-80 pb-4">
                     {[...Array(16)].map((_, i) => (
                       <div key={i} className="w-2 bg-accent rounded-t-sm animate-[pulse_0.5s_ease-in-out_infinite_alternate]" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }} />
                     ))}
                   </div>
                 )}
              </div>
              <h3 className="text-2xl font-extrabold text-text-main mt-2">{activeItem.title}</h3>
              <p className="text-lg text-text-dim leading-relaxed overflow-y-auto hide-scrollbar">{activeItem.desc}</p>
              
              <div className="flex gap-4 mt-auto pt-4 border-t border-panel-border shrink-0">
                <button 
                  onClick={() => {
                    playSound('select');
                    if (onPlayAudio) {
                      onPlayAudio(activeItem);
                    }
                  }}
                  className={`flex-1 font-extrabold py-3 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg ${
                    activeMediaId === (activeItem.url || activeItem.id) 
                      ? 'bg-white text-text-inv hover:bg-gray-200' 
                      : 'bg-accent hover:bg-yellow-400 text-text-inv'
                  }`}
                >
                  {activeMediaId === (activeItem.url || activeItem.id) && isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" fill="currentColor" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" fill="currentColor" />
                      {activeMediaId === (activeItem.url || activeItem.id) ? 'Resume' : 'Play Now'}
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    playSound('select');
                    toggleFavorite(activeItem);
                  }}
                  className="px-6 bg-panel hover:bg-panel-hover text-text-main font-extrabold py-3 rounded-full flex items-center justify-center transition-colors group shadow-lg"
                >
                  <Heart className={`w-5 h-5 transition-colors ${favorites.some((f: any) => f.id === activeItem.id) ? 'fill-accent text-accent' : 'text-text-main group-hover:text-accent'}`} />
                </button>
                <button className="px-6 bg-panel hover:bg-panel-hover text-text-main font-extrabold py-3 rounded-full flex items-center justify-center transition-colors shadow-lg">
                  <Info className="w-5 h-5" />
                </button>
                {activeItem.isVideo && activeItem.url && (
                  <button 
                    onClick={() => {
                      playSound('select');
                      if (onToggleFullscreen) onToggleFullscreen();
                    }}
                    className="px-6 bg-panel hover:bg-panel-hover text-text-main font-extrabold py-3 rounded-full flex items-center justify-center transition-colors shadow-lg ml-auto"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


);
