import React from 'react';
import { Volume2 } from 'lucide-react';
import VideoPlayer from '../../VideoPlayer';
import { playSound } from '../../utils/audio';
import { PipOverlay } from './PipOverlay';
import { FullscreenOverlay } from './FullscreenOverlay';

export interface FloatingPlayerProps {
  activeMedia: any;
  currentPlaybackUrl: string;
  isPlaying: boolean;
  isAdPlaying?: boolean;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  isPipExpanded: boolean;
  setIsPipExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  scaleMode: 'contain' | 'cover';
  setScaleMode: React.Dispatch<React.SetStateAction<'contain' | 'cover'>>;
  showUI: boolean;
  volume: number;
  setVolume: (val: number) => void;
  videoPlayerRef: any;
  duration: number;
  setDuration: (dur: number) => void;
  playedSeconds: number;
  setPlayedSeconds: (sec: number) => void;
  isSeeking: boolean;
  setIsSeeking: (seeking: boolean) => void;
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMediaEnded: () => void;
  handlePlayMedia: (media: any) => void;
  formatTime: (seconds: number) => string;
  currentView: string;
}

export function FloatingPlayer({
  activeMedia,
  currentPlaybackUrl,
  isPlaying,
  isAdPlaying,
  isFullscreen,
  setIsFullscreen,
  isPipExpanded,
  setIsPipExpanded,
  scaleMode,
  setScaleMode,
  showUI,
  volume,
  setVolume,
  videoPlayerRef,
  duration,
  setDuration,
  playedSeconds,
  setPlayedSeconds,
  isSeeking,
  setIsSeeking,
  handleSeekChange,
  handleMediaEnded,
  handlePlayMedia,
  formatTime,
  currentView,
}: FloatingPlayerProps) {
  if (!activeMedia) {
    return (
      <div
        className={`hidden md:flex flex-col items-end animate-in fade-in zoom-in duration-700 opacity-50 ${
          currentView !== 'MENU' ? 'hidden md:hidden' : ''
        }`}
      >
        <div className="w-64 aspect-video bg-panel rounded-xl border-4 border-panel-border overflow-hidden relative flex items-center justify-center">
          <span className="text-text-main/30 text-xs font-extrabold tracking-widest">NO SIGNAL</span>
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? `fixed inset-0 z-[100] bg-video-bg flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 ${
              !showUI ? 'cursor-none' : ''
            }`
          : 'hidden md:flex flex-col items-end animate-in fade-in zoom-in duration-700 z-50'
      }
    >
      <div
        onClick={() => {
          if (!isFullscreen) {
            playSound('select');
            setIsPipExpanded((prev) => !prev);
          }
        }}
        onDoubleClick={() => {
          if (isFullscreen) {
            playSound('select');
            setScaleMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
          }
        }}
        className={
          isFullscreen
            ? 'w-full h-full relative'
            : `${isPipExpanded ? 'w-[480px]' : 'w-64'} aspect-video bg-video-bg rounded-xl border-4 ${
                isPlaying ? 'border-accent' : 'border-panel-border'
              } shadow-2xl overflow-hidden relative group cursor-pointer transition-all duration-300`
        }
      >
        {/* Actual Video Player Background */}
        {activeMedia.isVideo && activeMedia.url && (
          <div className="absolute inset-0 z-0 bg-video-bg overflow-hidden flex items-center justify-center">
            <VideoPlayer
              ref={videoPlayerRef}
              onProgress={(t: number) => {
                if (!isSeeking) setPlayedSeconds(t);
              }}
              onDuration={setDuration}
              onEnded={handleMediaEnded}
              className={`relative z-10 w-full h-full transition-all duration-500 ${
                isFullscreen
                  ? scaleMode === 'contain'
                    ? 'object-contain'
                    : 'object-cover'
                  : 'object-cover pointer-events-none'
              }`}
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
          <PipOverlay
            activeMedia={activeMedia}
            isPlaying={isPlaying}
            isAdPlaying={isAdPlaying}
            isPipExpanded={isPipExpanded}
            onTogglePlay={(e) => {
              e.stopPropagation();
              playSound('select');
              handlePlayMedia(activeMedia);
            }}
            onMaximize={(e) => {
              e.stopPropagation();
              playSound('select');
              setIsFullscreen(true);
            }}
          />
        )}

        {/* Fullscreen Overlay Content */}
        {isFullscreen && (
          <FullscreenOverlay
            showUI={showUI}
            isPlaying={isPlaying}
            onTogglePlay={() => handlePlayMedia(activeMedia)}
            duration={duration}
            playedSeconds={playedSeconds}
            onSeekChange={handleSeekChange}
            onSeekStart={() => setIsSeeking(true)}
            onSeekEnd={() => setIsSeeking(false)}
            volume={volume}
            onVolumeChange={setVolume}
            scaleMode={scaleMode}
            onToggleScaleMode={() =>
              setScaleMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))
            }
            onExitFullscreen={() => setIsFullscreen(false)}
            formatTime={formatTime}
          />
        )}
      </div>

      {/* PIP Volume Bar (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="mt-3 bg-video-overlay backdrop-blur-md rounded-full px-4 py-2.5 border border-panel-border flex items-center gap-3 shadow-2xl transition-all duration-300">
          <Volume2 className="w-4 h-4 text-text-dim" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-accent h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
          />
        </div>
      )}
    </div>
  );
}
