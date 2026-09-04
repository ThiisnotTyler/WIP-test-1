import React, { useState, useEffect } from 'react';
import { Network, ChevronLeft, ShieldCheck } from 'lucide-react';
import { TorrentPlayer } from './TorrentPlayer';
import { playSound } from '../utils/audio';

export const P2PView = ({ onBack }: { onBack: () => void }) => {
  const [activeMagnet, setActiveMagnet] = useState<string | null>(null);
  const [approvedMagnets, setApprovedMagnets] = useState<any[]>([
    {
      id: 'default_1',
      title: 'Sintel (Open Source Movie)',
      magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
    },
    {
      id: 'default_2',
      title: 'Tears of Steel (Open Source Movie)',
      magnet: 'magnet:?xt=urn:btih:209c8226b299b308beaf2b9cd3fb49212dbd13ec&dn=Tears+of+Steel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Ftears-of-steel.torrent'
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_custom_p2p');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApprovedMagnets(prev => [...prev, ...parsed]);
      } catch (e) {}
    }
  }, []);

  const handlePlayMagnet = (magnet: string) => {
    playSound('select');
    setActiveMagnet(null); // Reset first to remount player
    setTimeout(() => setActiveMagnet(magnet), 50);
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => { playSound('select'); onBack(); }} 
          className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md flex items-center gap-3">
          <Network className="w-8 h-8 text-accent" />
          P2P Streaming Network
        </h2>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Side: Controls & Input */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 hide-scrollbar">
          <div className="bg-panel border-2 border-panel-border rounded-xl p-6 shadow-xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Network className="w-32 h-32" />
            </div>
            
            <h3 className="text-xl font-bold text-text-main mb-2">Connect to Swarm</h3>
            <p className="text-sm text-text-dim mb-6">Select an approved magnet link below to join a peer-to-peer swarm directly from your browser. Only single-video streams moderated by the Broadcast Studio are permitted.</p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <div className="text-xs font-bold text-text-main tracking-widest uppercase mb-1">Approved P2P Swarms</div>
              {approvedMagnets.map((sample, i) => (
                <button
                  key={sample.id || i}
                  onClick={() => handlePlayMagnet(sample.magnet)}
                  className="flex flex-col text-left p-3 rounded-lg border border-panel-border bg-panel-solid hover:border-accent transition-colors group relative overflow-hidden"
                >
                  <span className="font-bold text-text-main group-hover:text-accent transition-colors z-10 flex items-center gap-2">
                    {sample.title}
                  </span>
                  <span className="text-xs text-text-dim mt-1 font-mono truncate w-full z-10">{sample.desc || 'WebTorrent / WebRTC'}</span>
                  {activeMagnet === sample.magnet && (
                     <div className="absolute inset-0 bg-accent/10 border border-accent rounded-lg z-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Player */}
        <div className="w-full xl:w-2/3 flex flex-col min-h-[400px]">
          {activeMagnet ? (
            <TorrentPlayer magnetUri={activeMagnet} />
          ) : (
            <div className="flex-1 border-4 border-dashed border-panel-border rounded-xl flex flex-col items-center justify-center text-text-dim p-8 text-center bg-panel/30">
              <Network className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2 text-text-main">Awaiting Connection</h3>
              <p className="max-w-md">Paste a magnet link or select a sample stream to initialize the WebTorrent engine and connect to a P2P swarm.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
