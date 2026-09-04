import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Save, Tv, ChevronDown, ChevronUp, Play, Network } from 'lucide-react';
import { playSound } from '../utils/audio';
import { GlobalClock } from './GlobalClock';

export const BroadcastStudio = React.memo(function BroadcastStudio({ onBack, userTier, onPlayAudio }: any) {
  const [channelName, setChannelName] = useState('My Custom Channel');
  const [channelNumber, setChannelNumber] = useState('99');
  const [programs, setPrograms] = useState<any[]>([]);
  
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDur, setNewDur] = useState('30');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getUTCDay());
  const [newStartTime, setNewStartTime] = useState(() => { const now = new Date(); return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`; });
  const [newPreRoll, setNewPreRoll] = useState('');
  const [newPostRoll, setNewPostRoll] = useState('');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [studioMode, setStudioMode] = useState<'TV' | 'FEED' | 'P2P' | 'MODERATE'>('TV');
  const [pendingQueue, setPendingQueue] = useState([
    { id: 'mq_1', type: 'channel', user: 'User492', title: 'Action Movies 24/7', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', desc: 'A 24/7 channel showing classic action movies.' },
    { id: 'mq_2', type: 'feed', user: 'StreamerXYZ', title: 'Live Gaming Event', url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8', desc: 'Live esports tournament broadcast.' },
  ]);
  
  const [expandedModId, setExpandedModId] = useState<string | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [isAgeRestricted, setIsAgeRestricted] = useState(false);

  const handleApprove = (id: string) => {
    playSound('nav');
    alert(`Approved and added to public directory. ${isAgeRestricted ? '(Marked as Age Restricted 18+)' : ''}`);
    setPendingQueue(q => q.filter(item => item.id !== id));
    if (expandedModId === id) setExpandedModId(null);
  };

  const confirmDeny = (id: string) => {
    playSound('nav');
    if (!denyReason.trim()) {
      alert('Please provide a reason for denial.');
      return;
    }
    alert(`Denied. Reason sent to user: ${denyReason}`);
    setPendingQueue(q => q.filter(item => item.id !== id));
    setDenyingId(null);
      setIsAgeRestricted(false);
    setDenyReason('');
    if (expandedModId === id) setExpandedModId(null);
  };
  
  const toggleExpand = (id: string) => {
    playSound('nav');
    if (expandedModId === id) {
      setExpandedModId(null);
      setDenyingId(null);
      setIsAgeRestricted(false);
    } else {
      setExpandedModId(id);
      setDenyingId(null);
      setIsAgeRestricted(false);
      setDenyReason('');
    }
  };


  const [feeds, setFeeds] = useState<any[]>([]);
  const [p2pMagnets, setP2pMagnets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_custom_channel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setChannelName(parsed.name);
        if (parsed.number) setChannelNumber(parsed.number);
        if (parsed.programs) setPrograms(parsed.programs);
      } catch (e) {}
    }
    
    const savedFeeds = localStorage.getItem('nexus_custom_feeds');
    if (savedFeeds) {
      try {
        setFeeds(JSON.parse(savedFeeds));
      } catch (e) {}
    }

    const savedMagnets = localStorage.getItem('nexus_custom_p2p');
    if (savedMagnets) {
      try {
        setP2pMagnets(JSON.parse(savedMagnets));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    playSound('select');
    const customChannel = {
      id: 'custom_ch',
      name: channelName,
      number: channelNumber,
      programs: programs
    };
    localStorage.setItem('nexus_custom_channel', JSON.stringify(customChannel));
    alert('Channel broadcast updated! It will now appear in the TV Guide.');
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) { alert('Failed: Title and Stream URL are required.'); return; }
    
    const [nH, nM] = newStartTime.split(':').map(Number);
    const nStart = nH * 60 + nM;
    const nEnd = nStart + parseInt(newDur);
    
    if (nEnd > 24 * 60) {
      alert('Program duration extends past midnight. Please adjust the duration or start time.');
      return;
    }

    const hasOverlap = programs.some(p => {
      if (p.day !== selectedDay) return false;
      const [pH, pM] = (p.startTime || '00:00').split(':').map(Number);
      const pStart = pH * 60 + pM;
      const pEnd = pStart + (p.dur || 30);
      return (nStart < pEnd && nEnd > pStart);
    });

    if (hasOverlap) {
      alert('This program conflicts with an existing program on this day. Please choose a different time.');
      return;
    }

    playSound('nav');
    const newProg = {
      id: 'cp_' + Date.now(),
      title: newTitle,
      desc: newDesc || 'Custom broadcast program.',
      url: newUrl,
      dur: parseInt(newDur) || 30,
      startTime: newStartTime,
      day: selectedDay,
      preRollAd: newPreRoll,
      postRollAd: newPostRoll,
      isVideo: true
    };
    setPrograms([...programs, newProg]);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setNewDur('30');
    setNewPreRoll('');
    setNewPostRoll('');
    alert('Program scheduled successfully!');
  };

  const handleRemove = (id: string) => {
    playSound('nav');
    setPrograms(programs.filter(p => p.id !== id));
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    playSound('nav');
    const newFeed = {
      id: 'cf_' + Date.now(),
      title: newTitle,
      category: 'Live Feed',
      url: newUrl,
      desc: newDesc || 'Custom broadcast live feed.',
      viewers: Math.floor(Math.random() * 1000) + 'k',
      ping: '12ms',
      isVideo: true
    };
    const updated = [...feeds, newFeed];
    setFeeds(updated);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    localStorage.setItem('nexus_custom_feeds', JSON.stringify(updated));
    alert('Live feed broadcast updated!');
  };

  const handleRemoveFeed = (id: string) => {
    playSound('nav');
    const updated = feeds.filter(f => f.id !== id);
    setFeeds(updated);
    localStorage.setItem('nexus_custom_feeds', JSON.stringify(updated));
  };

  const handleAddMagnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    if (!newUrl.startsWith('magnet:')) {
      alert('Must be a valid magnet link starting with magnet:');
      return;
    }
    playSound('nav');
    const newMagnet = {
      id: 'p2p_' + Date.now(),
      title: newTitle,
      magnet: newUrl,
      desc: newDesc || 'Approved P2P swarm.'
    };
    const updated = [...p2pMagnets, newMagnet];
    setP2pMagnets(updated);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    localStorage.setItem('nexus_custom_p2p', JSON.stringify(updated));
    alert('P2P Magnet Swarm approved and published!');
  };

  const handleRemoveMagnet = (id: string) => {
    playSound('nav');
    const updated = p2pMagnets.filter(m => m.id !== id);
    setP2pMagnets(updated);
    localStorage.setItem('nexus_custom_p2p', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => { playSound('select'); onBack(); }} 
          className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">Broadcast Studio</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-4 hide-scrollbar space-y-6 pb-20">
        <div className="flex bg-panel rounded-xl p-1 border border-panel-border overflow-x-auto hide-scrollbar">
          <button onClick={() => { playSound('nav'); setStudioMode('TV'); }} className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${studioMode === 'TV' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'}`}>TV Channel</button>
          <button onClick={() => { playSound('nav'); setStudioMode('FEED'); }} className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${studioMode === 'FEED' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'}`}>Live Feeds</button>
          <button onClick={() => { playSound('nav'); setStudioMode('P2P'); }} className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${studioMode === 'P2P' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'}`}>P2P Swarms</button>
          {userTier >= 4 && (
            <button onClick={() => { playSound('nav'); setStudioMode('MODERATE'); }} className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${studioMode === 'MODERATE' ? 'bg-red-500 text-text-main shadow' : 'text-text-main hover:bg-panel'}`}>Moderation</button>
          )}
        </div>

        {studioMode === 'TV' ? (
          <>
        <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
          <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2"><Tv className="w-5 h-5" /> Channel Identity</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">CH Number</label>
              <input value={channelNumber} onChange={e => setChannelNumber(e.target.value)} className="w-full bg-panel border border-panel-border rounded p-2 text-text-main font-mono" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">Channel Name</label>
              <input value={channelName} onChange={e => setChannelName(e.target.value)} className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" />
            </div>
          </div>
        </div>

        <div className="bg-panel p-6 rounded-2xl border border-panel-border">
          <h3 className="text-xl font-bold text-text-main mb-4">Programming Schedule</h3>
          
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
            {DAYS.map((dayName, idx) => (
              <button 
                key={dayName} 
                onClick={() => { playSound('nav'); setSelectedDay(idx); }}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedDay === idx ? 'bg-accent text-text-inv' : 'bg-panel-solid text-text-dim hover:text-text-main'}`}
              >
                {dayName}
              </button>
            ))}
          </div>
          
          <div className="space-y-3 mb-6 relative">
            {(() => {
              const dayPrograms = programs.filter(p => p.day === selectedDay).sort((a, b) => {
                const aMins = a.startTime.split(':').map(Number)[0] * 60 + a.startTime.split(':').map(Number)[1];
                const bMins = b.startTime.split(':').map(Number)[0] * 60 + b.startTime.split(':').map(Number)[1];
                return aMins - bMins;
              });

              if (dayPrograms.length === 0) {
                return <div className="text-text-dim italic p-4 bg-panel rounded text-center border-2 border-dashed border-panel-border">No programs scheduled for {DAYS[selectedDay]}. This day will have dead air.</div>;
              }

              const blocks = [];
              let lastEnd = 0;

              dayPrograms.forEach((p) => {
                const [pH, pM] = (p.startTime || '00:00').split(':').map(Number);
                const pStart = pH * 60 + pM;
                const pEnd = pStart + (p.dur || 30);

                if (pStart > lastEnd) {
                  // Dead Air Gap
                  blocks.push(
                    <div key={`gap-${lastEnd}`} className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]">
                      Dead Air Gap: {Math.floor(lastEnd/60).toString().padStart(2, '0')}:{(lastEnd%60).toString().padStart(2, '0')} - {Math.floor(pStart/60).toString().padStart(2, '0')}:{(pStart%60).toString().padStart(2, '0')}
                    </div>
                  );
                }

                blocks.push(
                  <div key={p.id} className="flex flex-col p-3 bg-panel rounded border border-panel-border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-text-main flex items-center gap-2">
                          <span className="text-accent bg-accent/10 px-2 py-0.5 rounded text-sm">{p.startTime}</span>
                          {p.title} 
                          <span className="text-xs font-normal text-text-dim">{p.dur} mins</span>
                        </div>
                        <div className="text-xs text-text-dim truncate max-w-[250px] mt-1">{p.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { playSound('select'); onPlayAudio({ ...p, category: 'TV & Movies' }); }} className="p-2 text-accent hover:bg-accent/20 rounded-full transition-colors" title="Test Play Broadcast (Ignores Schedule Time)">
                          <Play className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRemove(p.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors" title="Remove Program">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {(p.preRollAd || p.postRollAd) && (
                      <div className="mt-3 pt-2 border-t border-panel-border flex flex-col gap-1">
                        {p.preRollAd && <div className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Pre-roll Ad: <span className="text-text-dim lowercase truncate max-w-[200px]">{p.preRollAd}</span></div>}
                        {p.postRollAd && <div className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Post-roll Ad: <span className="text-text-dim lowercase truncate max-w-[200px]">{p.postRollAd}</span></div>}
                      </div>
                    )}
                  </div>
                );
                
                lastEnd = pEnd;
              });

              if (lastEnd < 24 * 60) {
                blocks.push(
                  <div key={`gap-${lastEnd}`} className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]">
                      Dead Air Gap: {Math.floor(lastEnd/60).toString().padStart(2, '0')}:{(lastEnd%60).toString().padStart(2, '0')} - 24:00
                  </div>
                );
              }

              return blocks;
            })()}
          </div>

          <form onSubmit={handleAddProgram} className="bg-panel p-4 rounded-xl border border-panel-border space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between"><h4 className="font-bold text-accent">Schedule New Program</h4><GlobalClock /></div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">Start Time (UTC)</label>
                <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">Duration (Minutes)</label>
                <input type="number" min="1" max="1440" value={newDur} onChange={e => setNewDur(e.target.value)} className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">Program Details</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Program Title" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Video Stream URL (.m3u8, .mp4, etc)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (Optional)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" />
            </div>

            {userTier >= 4 ? (
              <div className="p-4 bg-panel-solid rounded-xl border border-yellow-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full pointer-events-none"></div>
                <div>
                  <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                    Monetization: Ad Blocks
                  </h5>
                  <p className="text-[10px] text-text-dim mt-1">Drag-and-drop ad media files or paste URLs to insert advertisements at specific program timestamps.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center group">
                    <label className="text-[10px] font-bold text-text-main uppercase w-20 shrink-0 flex items-center gap-1 group-hover:text-yellow-500 transition-colors">Start (Pre)</label>
                    <input 
                      value={newPreRoll} 
                      onChange={e => setNewPreRoll(e.target.value)} 
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) setNewPreRoll(URL.createObjectURL(e.dataTransfer.files[0]));
                      }}
                      placeholder="Drop file here or paste URL..." 
                      className="w-full bg-panel border-2 border-dashed border-panel-border hover:border-yellow-500/50 rounded p-2 text-text-main text-xs transition-colors" 
                    />
                  </div>
                  <div className="flex gap-2 items-center group">
                    <label className="text-[10px] font-bold text-text-main uppercase w-20 shrink-0 flex items-center gap-1 group-hover:text-yellow-500 transition-colors">End (Post)</label>
                    <input 
                      value={newPostRoll} 
                      onChange={e => setNewPostRoll(e.target.value)} 
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) setNewPostRoll(URL.createObjectURL(e.dataTransfer.files[0]));
                      }}
                      placeholder="Drop file here or paste URL..." 
                      className="w-full bg-panel border-2 border-dashed border-panel-border hover:border-yellow-500/50 rounded p-2 text-text-main text-xs transition-colors" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-panel-solid rounded border border-panel-border flex flex-col items-center justify-center text-center opacity-70">
                <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-wide mb-1">Advertisement Monetization</h5>
                <p className="text-[10px] text-text-dim max-w-[200px]">Upgrade to Tier 4 or higher to insert pre-roll and post-roll advertisements into your broadcasts.</p>
              </div>
            )}

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-3 rounded-lg font-bold transition-colors">
              <Plus className="w-5 h-5" /> Add to {DAYS[selectedDay]} Schedule
            </button>
          </form>
        </div>

        <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-accent text-text-inv p-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)]">
          <Save className="w-6 h-6" /> Save & Broadcast Channel
        </button>
        </>
        ) : studioMode === 'FEED' ? (
          <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
            <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2"><Tv className="w-5 h-5" /> Active Feeds</h3>
            
            <div className="space-y-3 mb-6">
              {feeds.length === 0 ? (
                <div className="text-text-dim italic p-4 bg-panel rounded text-center">No feeds broadcasting.</div>
              ) : feeds.map((f, i) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-panel rounded border border-panel-border">
                  <div>
                    <div className="font-bold text-text-main">{f.title}</div>
                    <div className="text-xs text-text-dim truncate max-w-[250px]">{f.url}</div>
                  </div>
                  <button onClick={() => handleRemoveFeed(f.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFeed} className="bg-panel p-4 rounded-xl border border-panel-border space-y-4">
              <h4 className="font-bold text-text-dim">Add Live Feed</h4>
              <div>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Feed Title" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Video Stream URL (.m3u8, .mp4, etc)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (Optional)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-2 rounded font-bold transition-colors">
                <Plus className="w-5 h-5" /> Start Broadcast
              </button>
            </form>
          </div>
        ) : studioMode === 'P2P' ? (
          <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
            <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2"><Network className="w-5 h-5" /> Active P2P Swarms</h3>
            <p className="text-sm text-text-dim mb-6">Magnet links added here are moderated via the client engine (which restricts the download to a single video file) and appear as approved streams for users.</p>
            
            <div className="space-y-3 mb-6">
              {p2pMagnets.length === 0 ? (
                <div className="text-text-dim italic p-4 bg-panel rounded text-center">No P2P swarms broadcasting.</div>
              ) : p2pMagnets.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-panel rounded border border-panel-border">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-bold text-text-main truncate">{m.title}</div>
                    <div className="text-xs text-text-dim truncate">{m.magnet}</div>
                  </div>
                  <button onClick={() => handleRemoveMagnet(m.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMagnet} className="bg-panel p-4 rounded-xl border border-panel-border space-y-4">
              <h4 className="font-bold text-text-dim">Add Magnet Swarm</h4>
              <div>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Swarm Title" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="magnet:?xt=urn:btih:..." className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3" required />
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (Optional)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-2 rounded font-bold transition-colors">
                <Plus className="w-5 h-5" /> Publish P2P Swarm
              </button>
            </form>
          </div>
        ) : studioMode === 'MODERATE' && userTier >= 4 ? (
          <div className="bg-panel p-6 rounded-2xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2"><Tv className="w-5 h-5" /> Moderation Queue</h3>
            <div className="text-text-dim mb-6 text-sm">Review incoming community channels and live feeds. You must provide a reason for any denied content.</div>
            
            <div className="space-y-4">
              {pendingQueue.length === 0 ? (
                <div className="text-text-dim italic p-4 bg-panel rounded text-center">Queue is empty. Great job!</div>
              ) : pendingQueue.map(item => {
                const isExpanded = expandedModId === item.id;
                return (
                  <div key={item.id} className="bg-panel rounded-xl border border-panel-border overflow-hidden transition-all duration-300">
                    <div 
                      onClick={() => toggleExpand(item.id)}
                      className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between cursor-pointer hover:bg-panel"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.type === 'channel' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                            {item.type}
                          </span>
                          <span className="text-text-dim text-sm">by {item.user}</span>
                        </div>
                        <div className="font-bold text-text-main text-lg">{item.title}</div>
                      </div>
                      <div className="shrink-0 text-text-dim">
                        {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-panel-border mt-2 bg-panel">
                        <div className="text-sm text-text-dim mb-4 space-y-2 pt-4">
                          <p><strong className="text-text-main">Source URL:</strong> <span className="break-all text-blue-300">{item.url}</span></p>
                          <p><strong className="text-text-main">Description:</strong> {item.desc || 'No description provided by user.'}</p>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <button 
                            onClick={() => {
                              playSound('select');
                              if (onPlayAudio) {
                                onPlayAudio({ id: item.id, url: item.url, title: item.title, desc: item.desc, isVideo: true, category: 'Moderation Test' });
                              }
                            }}
                            className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-500 hover:bg-blue-400 text-text-main font-bold py-2 px-4 rounded transition-colors"
                          >
                            <Play className="w-5 h-5 fill-current" /> Test Stream
                          </button>

                          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">

                            <input 

                              type="checkbox"

                              id={`age_rest_${item.id}`}

                              checked={isAgeRestricted}

                              onChange={(e) => { playSound('nav'); setIsAgeRestricted(e.target.checked); }}

                              className="w-5 h-5 accent-red-500"

                            />

                            <label htmlFor={`age_rest_${item.id}`} className="text-sm font-bold text-red-400 cursor-pointer">Flag as Age Restricted (18+)</label>

                          </div>
                          
                          {denyingId === item.id ? (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col gap-3">
                              <label className="text-sm font-bold text-red-400">Provide Denial Reason (Sent to User)</label>
                              <input 
                                value={denyReason} 
                                onChange={e => setDenyReason(e.target.value)} 
                                placeholder="E.g., Stream link is broken, violates TOS, etc."
                                className="w-full bg-panel border border-red-500/50 rounded p-2 text-text-main outline-none focus:border-red-400"
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end mt-2">
                                <button onClick={() => { setDenyingId(null);
      setIsAgeRestricted(false); setDenyReason(''); playSound('nav'); }} className="px-4 py-2 text-text-dim hover:text-text-main transition-colors">
                                  Cancel
                                </button>
                                <button onClick={() => confirmDeny(item.id)} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-text-main font-bold rounded transition-colors">
                                  Confirm Deny
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 pt-2 border-t border-panel-border">
                              <button onClick={() => handleApprove(item.id)} className="flex-1 bg-green-500 hover:bg-green-400 text-text-inv font-bold py-3 px-4 rounded transition-colors">
                                Approve Submission
                              </button>
                              <button onClick={() => { playSound('nav'); setDenyingId(item.id); setDenyReason(''); }} className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-text-main border border-red-500/50 font-bold py-3 px-4 rounded transition-colors">
                                Deny Submission
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});
