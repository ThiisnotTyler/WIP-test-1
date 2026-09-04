const fs = require('fs');

const code = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Play, Heart, Calendar } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CHANNELS } from '../data/mockData';
import { playSound } from '../utils/audio';

export const ChannelGuide = React.memo(function ChannelGuide({ onBack, onPlayAudio, activeMediaId, userTier, ageRestrictedMode, favorites, toggleFavorite }: any) {
  const [activeCell, setActiveCell] = useState<{ch: string, prog: string} | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getUTCDay());

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      slots.push(\`\${String(h).padStart(2, '0')}:00 UTC\`);
      slots.push(\`\${String(h).padStart(2, '0')}:30 UTC\`);
    }
    return slots;
  }, []);

  useEffect(() => {
    const loadedChannels = [...CHANNELS];
    
    if (userTier > 1) {
      try {
        const saved = localStorage.getItem('nexus_custom_channel');
        if (saved) {
          const customChannel = JSON.parse(saved);
          if (customChannel && customChannel.programs && customChannel.programs.length > 0) {
            if (!loadedChannels.some(c => c.id === customChannel.id)) {
              loadedChannels.unshift(customChannel);
            }
          }
        }
      } catch (e) {}
    }
    
    setChannels(ageRestrictedMode ? loadedChannels.map(ch => ({...ch, programs: ch.programs.filter((p: any) => p.ageRestricted !== true)})).filter(ch => ch.programs.length > 0) : loadedChannels);
  }, [userTier, ageRestrictedMode]);

  useEffect(() => {
    if (!activeCell && channels.length > 0 && channels[0].programs.length > 0) {
      // Find a program for the selected day if possible
      const dayProgs = channels[0].programs.filter((p:any) => p.day === selectedDay);
      if (dayProgs.length > 0) {
         setActiveCell({ ch: channels[0].id, prog: dayProgs[0].id });
      }
    }
  }, [channels, activeCell, selectedDay]);

  const parentRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to current UTC time on initial load
  useEffect(() => {
    if (parentRef.current) {
      const now = new Date();
      const currentUTCMins = now.getUTCHours() * 60 + now.getUTCMinutes();
      // Scroll to current time (minus 30 mins for padding)
      const scrollPos = Math.max(0, (currentUTCMins - 30) * 10);
      parentRef.current.scrollLeft = scrollPos;
    }
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: channels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  const activeProgram = channels.flatMap(c => c.programs).find(p => p.id === activeCell?.prog);

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playSound('select'); onBack(); }} 
            className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">TV & Movies</h2>
        </div>
        
        {/* Day Picker */}
        <div className="flex bg-panel rounded-full border border-panel-border p-1 shadow-sm overflow-x-auto max-w-[50%] hide-scrollbar">
          {DAYS.map((dayName, idx) => (
            <button
              key={dayName}
              onClick={() => { playSound('nav'); setSelectedDay(idx); }}
              className={\`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors \${
                selectedDay === idx 
                  ? 'bg-accent text-text-inv' 
                  : 'text-text-dim hover:text-text-main hover:bg-panel-solid'
              }\`}
            >
              {dayName}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        
        {/* Top Info Panel */}
        <div className="bg-panel border-4 border-panel-border rounded-xl p-4 shadow-xl backdrop-blur flex h-36">
          <div className="flex-1 flex flex-col justify-center">
            {activeProgram ? (
               <>
                 <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-2xl font-bold text-text-main">{activeProgram.title}</h3>
                   <button
                     onClick={() => { playSound('select'); toggleFavorite({ ...activeProgram, category: 'TV & Movies' }); }}
                     className="p-1.5 bg-panel hover:bg-panel-hover rounded-full transition-colors group shrink-0"
                   >
                     <Heart className={\`w-4 h-4 transition-colors \${favorites.some((f: any) => f.id === activeProgram.id) ? 'fill-accent text-accent' : 'text-text-main group-hover:text-accent'}\`} />
                   </button>
                   <div className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                     <Calendar className="w-3 h-3" /> {DAYS[activeProgram.day ?? selectedDay]} {activeProgram.startTime} UTC
                   </div>
                 </div>
                 <p className="text-text-dim text-lg leading-tight line-clamp-2">{activeProgram.desc}</p>
               </>
            ) : (
               <p className="text-text-dim italic">Select a program for details.</p>
            )}
          </div>
          
          <div 
            onClick={() => {
              if (activeProgram && onPlayAudio && (!activeProgram.url || activeMediaId !== (activeProgram.url || activeProgram.id))) {
                playSound('select');
                onPlayAudio({ ...activeProgram, category: 'TV & Movies' });
              }
            }}
            className="w-48 aspect-video bg-video-bg rounded border border-panel-border ml-4 relative flex items-center justify-center shrink-0 hover:border-accent group transition-colors overflow-hidden cursor-pointer"
          >
            {activeProgram && activeMediaId === (activeProgram.url || activeProgram.id) ? (
               <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-video-overlay">
                  <div className="w-12 h-12 border-2 border-accent rounded-full flex items-center justify-center animate-pulse mb-2 shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.4)]">
                     <Play className="w-5 h-5 text-accent ml-1" />
                  </div>
                  <span className="text-accent font-bold tracking-widest text-[10px]">NOW PLAYING</span>
               </div>
            ) : (
               <Play className="w-8 h-8 text-text-main/20 group-hover:text-accent transition-colors z-10 pointer-events-none" />
            )}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
          </div>
        </div>

        {/* EPG Grid Area */}
        <div ref={parentRef} className="flex-1 overflow-auto bg-panel-solid rounded-xl border-4 border-panel-border shadow-2xl hide-scrollbar relative">
          <div className="w-max min-w-full flex flex-col relative" style={{ width: '14496px' }}>
            
            {/* Time Header */}
            <div className="flex sticky top-0 z-20 bg-panel-solid border-b-2 border-panel-border shadow-md h-12">
              <div className="w-24 shrink-0 bg-panel-solid border-r-2 border-panel-border sticky left-0 z-30"></div>
              <div className="relative flex-1">
                {timeSlots.map((time, idx) => (
                  <div key={time} className="absolute top-0 bottom-0 border-r border-panel-border text-center p-3 font-bold text-text-main tracking-wide text-sm" style={{ left: \`\${idx * 300}px\`, width: '300px' }}>
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Channels rows */}
            <div 
              className="flex flex-col flex-1"
              style={{
                height: \`\${rowVirtualizer.getTotalSize()}px\`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const ch = channels[virtualRow.index];
                const dayPrograms = ch.programs.filter((p: any) => p.day === selectedDay || p.day === undefined);
                
                return (
                  <div
                    key={ch.id + virtualRow.index}
                    className="flex border-b border-panel-border hover:bg-panel"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '14496px',
                      height: \`\${virtualRow.size}px\`,
                      transform: \`translateY(\${virtualRow.start}px)\`,
                    }}
                  >
                    {/* Channel Label */}
                    <div className="w-24 shrink-0 bg-panel-solid border-r-2 border-panel-border flex flex-col items-center justify-center py-2 z-10 sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                      <div className="text-2xl font-black text-text-main">{ch.number}</div>
                      <div className="text-[10px] font-bold text-text-dim tracking-wider overflow-hidden text-ellipsis px-1 w-full text-center whitespace-nowrap">{ch.name}</div>
                    </div>
                    
                    {/* Program Blocks */}
                    <div className="relative flex-1">
                       {dayPrograms.length === 0 && (
                         <div className="absolute inset-0 flex items-center p-4 text-text-dim italic text-sm">Off Air</div>
                       )}
                       {dayPrograms.map((prog: any) => {
                         const isSelected = activeCell?.prog === prog.id;
                         const [pH, pM] = (prog.startTime || '00:00').split(':').map(Number);
                         const startMins = pH * 60 + pM;
                         const durMins = prog.dur || 30;
                         
                         return (
                           <button
                             key={prog.id}
                             onMouseEnter={() => {
                               if (!isSelected) {
                                 setActiveCell({ ch: ch.id, prog: prog.id });
                               }
                             }}
                             onClick={() => { playSound('select'); setActiveCell({ ch: ch.id, prog: prog.id }); if (onPlayAudio) { onPlayAudio({ ...prog, category: 'TV & Movies' }); } }}
                             className={\`absolute top-0 bottom-0 p-3 text-left border-r border-panel-border transition-all outline-none flex flex-col shrink-0 overflow-hidden \${
                               isSelected
                                 ? 'bg-accent text-text-inv shadow-[inset_0_0_0_3px_#fff] z-10 '
                                 : 'bg-panel-solid text-text-main hover:bg-panel-hover'
                             }\`}
                             style={{ left: \`\${startMins * 10}px\`, width: \`\${durMins * 10}px\` }}
                           >
                             <span className={\`font-bold block truncate w-full \${isSelected ? 'text-text-inv' : 'text-text-main'}\`}>{prog.title}</span>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
`;

fs.writeFileSync('src/components/ChannelGuide.tsx', code);
