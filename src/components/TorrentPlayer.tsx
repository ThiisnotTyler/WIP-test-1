import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import WebTorrent from 'webtorrent';

export const TorrentPlayer = ({ magnetUri }: { magnetUri: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Loading WebTorrent engine...');
  const [progress, setProgress] = useState(0);
  const [peers, setPeers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      setStatus('Connecting to P2P swarm...');
      const client = new WebTorrent();
      clientRef.current = client;

      client.add(magnetUri, (torrent: any) => {
          if (!isMounted) return;
          setStatus('Metadata downloaded. Searching for video file...');
          
          const file = torrent.files.find((f: any) => f.name.endsWith('.mp4') || f.name.endsWith('.webm') || f.name.endsWith('.mkv'));
          
          if (!file) {
            setError('No playable video file found in this torrent. Browsers generally require .mp4 or .webm.');
            return;
          }

          setStatus(`Buffering: ${file.name}`);
          
          if (videoRef.current) {
             file.renderTo(videoRef.current, { autoplay: false, muted: false, maxBlobLength: 2 * 1000 * 1000 * 1000 }, (err: any) => {
                 if (err) console.error("WebTorrent renderTo error:", err);
             });
          }

          torrent.on('error', (err: any) => {
              if (isMounted) setError(err.message || 'Torrent error');
          });

          torrent.on('download', (bytes: number) => {
            if (isMounted) {
              setProgress(Math.round(torrent.progress * 100));
              setPeers(torrent.numPeers);
              if (torrent.progress > 0.05) {
                 setStatus('Playing stream from peers');
              }
            }
          });
          
          torrent.on('done', () => {
             if (isMounted) setStatus('Download complete (Seeding)');
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
              <div className="text-text-main font-bold mb-2">{status}</div>
              <div className="text-text-dim text-sm">Progress: {progress}% | Peers: {peers}</div>
           </div>
        )}
      </div>
      <div className="p-4 bg-panel-solid border-t border-panel-border flex justify-between items-center text-sm font-mono">
        <span className="text-accent">{status}</span>
        <span className="text-text-dim">Peers: {peers} | Progress: {progress}%</span>
      </div>
    </div>
  );
};
