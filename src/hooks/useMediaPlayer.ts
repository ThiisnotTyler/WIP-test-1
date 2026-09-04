import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { playSound } from '../utils/audio';
import { CHANNELS, AUDIO } from '../data/mockData';

export function useMediaPlayer() {
  const [activeMedia, setActiveMedia] = useState<any | null>(null);
  const [adState, setAdState] = useState<'NONE' | 'PREROLL' | 'MAIN' | 'POSTROLL'>('NONE');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPipExpanded, setIsPipExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [scaleMode, setScaleMode] = useState<'contain' | 'cover'>('contain');
  const [volume, setVolume] = useState(0.5);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoPlayerRef = useRef<any>(null);

  const isAdPlaying = adState === 'PREROLL' || adState === 'POSTROLL';

  const currentPlaybackUrl = useMemo(() => {
    if (!activeMedia) return null;
    if (adState === 'PREROLL' && activeMedia.preRollAd) return activeMedia.preRollAd;
    if (adState === 'POSTROLL' && activeMedia.postRollAd) return activeMedia.postRollAd;
    return activeMedia.url;
  }, [activeMedia, adState]);

  const activeMediaId = activeMedia?.url || activeMedia?.id;

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (activeMedia && (!activeMedia.isVideo) && activeMedia.url) {
        if (currentPlaybackUrl && audioRef.current.src !== currentPlaybackUrl) {
          audioRef.current.src = currentPlaybackUrl;
        }
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                console.error("Playback error:", error);
                setPlaybackError("Stream unavailable or dead. Try another.");
                setIsPlaying(false);
                setPlaybackError("Stream unavailable or dead. Try another.");
                setIsPlaying(false);
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
  }, [activeMedia, isPlaying, currentPlaybackUrl]);

  const handlePlayMedia = useCallback((item: any) => {
    setPlaybackError(null);
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
    
    if (activeMedia.category === 'Radio' || activeMedia.category === 'Music') {
      const idx = AUDIO.findIndex(a => a.id === activeMedia.id);
      if (idx !== -1 && idx + 1 < AUDIO.length) {
        handlePlayMedia(AUDIO[idx + 1]);
        return;
      }
    }
    
    if (activeMedia.category === 'Live Feed') {
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
    
    setIsPlaying(false);
  }, [activeMedia, adState, handlePlayMedia]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleToggleFullscreen = useCallback(() => setIsFullscreen(true), []);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setPlayedSeconds(time);
    if (activeMedia?.isVideo && videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [activeMedia]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return {
    activeMedia,
    setActiveMedia,
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
  };
}
