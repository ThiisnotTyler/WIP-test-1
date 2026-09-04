import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import WebTorrent from 'webtorrent';

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatTime(ms: number) {
    if (!ms || ms === Infinity || isNaN(ms)) return 'Calculating...';
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export const TorrentPlayer = ({ magnetUri }: { magnetUri: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Loading WebTorrent engine...');
  const [progress, setProgress] = useState(0);
  const [peers, setPeers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Metrics
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const clientRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    try {
      setStatus('Connecting to P2P swarm (fetching metadata)...');
      const client = new WebTorrent();
      clientRef.current = client;

      client.add(magnetUri, (torrent: any) => {
          if (!isMounted) return;
          
          setStatus('Moderating torrent contents...');
          
          // Phase 1: Moderation / Bandwidth Restriction
          // Automatically deselect all files in the torrent so we don't download everything
          torrent.files.forEach((f: any) => f.deselect());
          
          // Find the first playable video file
          const videoFile = torrent.files.find((f: any) => f.name.endsWith('.mp4') || f.name.endsWith('.webm') || f.name.endsWith('.mkv'));
          
          if (!videoFile) {
            setError('Moderation Rejected: No playable video file found. Torrents must contain an .mp4 or .webm.');
            client.destroy();
            return;
          }

          // Approve ONLY the video file for download
          videoFile.select();
          setStatus(`Moderation Approved. Buffering: ${videoFile.name}`);
          
          if (videoRef.current) {
             videoFile.renderTo(videoRef.current, { autoplay: false, muted: false, maxBlobLength: 2 * 1000 * 1000 * 1000 }, (err: any) => {
                 if (err) console.error("WebTorrent renderTo error:", err);
             });
          }

          torrent.on('error', (err: any) => {
              if (isMounted) setError(err.message || 'Torrent error');
          });

          // Throttle state updates slightly to prevent excessive re-renders
          let lastUpdate = 0;
          torrent.on('download', (bytes: number) => {
            if (!isMounted) return;
            const now = Date.now();
            if (now - lastUpdate > 500) {
              setProgress(Math.round(torrent.progress * 100));
              setPeers(torrent.numPeers);
              setDownloadSpeed(torrent.downloadSpeed);
              setUploadSpeed(torrent.uploadSpeed);
              setTimeRemaining(torrent.timeRemaining);
              lastUpdate = now;
              
              if (torrent.progress > 0.05 && status !== 'Playing stream from peers') {
                 setStatus('Playing stream from peers');
              }
            }
          });
          
          torrent.on('done', () => {
             if (isMounted) {
               setStatus('Download complete (Seeding)');
               setProgress(100);
               setDownloadSpeed(0);
               setTimeRemaining(0);
             }
          });
        });
        
      client.on('error', (err: any) => {
        if (isMounted) setError(err.message || 'An error occurred in WebTorrent');
      });
    } catch (err: any) {
      if (isMounted) setError(err.message || 'Failed to load WebTorrent engine.');
    }

    return () => {
      isMounted = false;
      if (clientRef.current) {
        try {
           clientRef.current.destroy();
        } catch(e) {}
      }
    };
  }, [magnetUri]);

  return (
    <div className="flex flex-col bg-panel border-2 border-panel-border rounded-xl overflow-hidden shadow-2xl">
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        {error ? (
          <div className="text-red-500 flex flex-col items-center p-6 text-center gap-2">
            <AlertCircle className="w-12 h-12 mb-2" />
            <span className="font-bold">Error</span>
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <video ref={videoRef} controls className="w-full h-full object-contain z-10" />
        )}
        
        {(!error && progress < 100 && status !== 'Playing stream from peers' && status !== 'Download complete (Seeding)') && (
           <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <div className="text-text-main font-bold mb-2 flex items-center gap-2">
                 {status.includes('Moderation Approved') && <ShieldCheck className="w-5 h-5 text-green-500" />}
                 {status}
              </div>
              <div className="text-text-dim text-sm">Progress: {progress}% | Peers: {peers}</div>
           </div>
        )}
      </div>

      <div className="p-4 bg-panel-solid border-t border-panel-border flex flex-col md:flex-row justify-between items-start md:items-center text-xs font-mono gap-4 md:gap-0">
        <div className="flex items-center gap-2 text-accent">
          {status.includes('Moderation Approved') && <ShieldCheck className="w-4 h-4 text-green-500" />}
          <span>{status}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-text-dim">
          <span>Peers: <span className="text-text-main font-bold">{peers}</span></span>
          <span>DL: <span className="text-text-main font-bold">{formatBytes(downloadSpeed)}/s</span></span>
          <span>UL: <span className="text-text-main font-bold">{formatBytes(uploadSpeed)}/s</span></span>
          {progress < 100 && (
            <span>ETA: <span className="text-text-main font-bold">{formatTime(timeRemaining)}</span></span>
          )}
          <span>Prog: <span className="text-text-main font-bold">{progress}%</span></span>
        </div>
      </div>
    </div>
  );
};
