import React from 'react';
import { Play, Pause, Maximize } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { AudioVisualizer } from './AudioVisualizer';

export interface PipOverlayProps {
  activeMedia: any;
  isPlaying: boolean;
  isAdPlaying?: boolean;
  isPipExpanded: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  onMaximize: (e: React.MouseEvent) => void;
}

export function PipOverlay({
  activeMedia,
  isPlaying,
  isAdPlaying,
  isPipExpanded,
  onTogglePlay,
  onMaximize,
}: PipOverlayProps) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-2 left-3 z-20 w-full pr-6 pointer-events-none">
        <div className="text-xs font-extrabold text-accent drop-shadow-md flex items-center gap-2">
          {isPlaying ? (
            isAdPlaying ? (
              <span className="text-yellow-500">ADVERTISEMENT</span>
            ) : (
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
              </span>
            )
          ) : (
            'PAUSED'
          )}
        </div>
        <div className="text-[11px] text-text-main font-extrabold truncate pr-2">
          {activeMedia.title}
        </div>
        <div className="text-[9px] text-text-dim truncate pr-2">
          {activeMedia.category || 'Media'}
        </div>
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-panel">
        <button
          onClick={onTogglePlay}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-accent text-text-main hover:text-text-inv flex items-center justify-center transition-colors backdrop-blur shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
        {activeMedia.isVideo && activeMedia.url && (
          <button
            onClick={onMaximize}
            className="absolute top-2 right-2 text-text-main p-2 hover:bg-accent hover:text-text-inv rounded-full transition-colors"
          >
            <Maximize className="w-5 h-5 drop-shadow-md" />
          </button>
        )}
      </div>

      {/* Visualizer if Playing audio */}
      {isPlaying && !activeMedia.isVideo && (
        <AudioVisualizer barCount={isPipExpanded ? 32 : 16} />
      )}

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />
    </>
  );
}
