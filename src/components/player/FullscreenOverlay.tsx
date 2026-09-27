import React from 'react';
import { Play, Pause, Volume2, Maximize, Minimize, X } from 'lucide-react';
import { playSound } from '../../utils/audio';

export interface FullscreenOverlayProps {
  showUI: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  duration: number;
  playedSeconds: number;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  scaleMode: 'contain' | 'cover';
  onToggleScaleMode: () => void;
  onExitFullscreen: () => void;
  formatTime: (sec: number) => string;
}

export function FullscreenOverlay({
  showUI,
  isPlaying,
  onTogglePlay,
  duration,
  playedSeconds,
  onSeekChange,
  onSeekStart,
  onSeekEnd,
  volume,
  onVolumeChange,
  scaleMode,
  onToggleScaleMode,
  onExitFullscreen,
  formatTime,
}: FullscreenOverlayProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-6 z-[110] transition-opacity duration-500 ${
        showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Scrub Bar */}
      {duration > 0 && (
        <div className="flex items-center gap-4 w-full">
          <span className="text-text-dim text-sm font-extrabold font-mono">
            {formatTime(playedSeconds)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.1"
            value={playedSeconds}
            onChange={onSeekChange}
            onMouseDown={onSeekStart}
            onMouseUp={onSeekEnd}
            onTouchStart={onSeekStart}
            onTouchEnd={onSeekEnd}
            className="flex-1 accent-accent h-1.5 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.5)]"
          />
          <span className="text-text-dim text-sm font-extrabold font-mono">
            {formatTime(duration)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('select');
              onTogglePlay();
            }}
            className="text-text-main hover:text-accent transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-text-main drop-shadow-md" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-32 accent-accent h-1.5 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('select');
              onToggleScaleMode();
            }}
            className="text-text-main hover:text-accent transition-colors bg-panel p-4 rounded-full backdrop-blur border border-panel-border"
            title={scaleMode === 'contain' ? 'Fill Screen' : 'Fit to Screen'}
          >
            {scaleMode === 'contain' ? (
              <Maximize className="w-8 h-8" />
            ) : (
              <Minimize className="w-8 h-8" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('select');
              onExitFullscreen();
            }}
            className="text-text-main hover:text-red-500 transition-colors bg-panel p-4 rounded-full backdrop-blur border border-panel-border"
            title="Exit Fullscreen"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
