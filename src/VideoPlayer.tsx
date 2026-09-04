import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = forwardRef(({ url, playing, volume, muted, controls, loop, className, onProgress, onDuration, onEnded }: any, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    getDuration: () => videoRef.current?.duration || 0,
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    getInternalPlayer: () => videoRef.current
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({ 
          enableWorker: true, // Use web workers to offload CPU
          maxBufferLength: 30, // Limit buffer to 30 seconds to save RAM
          maxMaxBufferLength: 60,
          maxBufferSize: 30 * 1000 * 1000 // Limit memory buffer to 30MB
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        // Free hardware decoder and video buffer memory
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume ?? 1;
      videoRef.current.muted = muted ?? false;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        const p = videoRef.current.play();
        if (p !== undefined) p.catch(e => { if (e.name !== 'AbortError') console.warn('Video play error:', e.message); });
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing, url]);

  return (
    <video
      ref={videoRef}
      className={className || "w-full h-full object-cover"}
      controls={controls}
      loop={loop}
      playsInline
      onTimeUpdate={(e) => {
        if (onProgress) {
          onProgress(e.currentTarget.currentTime);
        }
      }}
      onLoadedMetadata={(e) => {
        if (onDuration) {
          onDuration(e.currentTarget.duration);
        }
      }}
      onEnded={onEnded}
    />
  );
});

export default VideoPlayer;
