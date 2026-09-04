const fs = require('fs');

let code = fs.readFileSync('src/components/BroadcastStudio.tsx', 'utf8');

// 1. Add states for day, startTime, ads.
code = code.replace(
  "const [newDur, setNewDur] = useState('30');",
  "const [newDur, setNewDur] = useState('30');\n  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());\n  const [newStartTime, setNewStartTime] = useState('08:00');\n  const [newPreRoll, setNewPreRoll] = useState('');\n  const [newPostRoll, setNewPostRoll] = useState('');\n  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];"
);

// 2. HandleAddProgram needs to calculate overlap
const handleAddProgramRegex = /const handleAddProgram = \(e: React\.FormEvent\) => \{[\s\S]*?setNewDur\('30'\);\n  \};/;
const newHandleAddProgram = `const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    
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
  };`;
code = code.replace(handleAddProgramRegex, newHandleAddProgram);

// 3. Update the UI for the schedule
const tvModeRegex = /<div className="bg-panel p-6 rounded-2xl border border-panel-border">[\s\S]*?<\/form>\n        <\/div>/;

const newTvMode = `<div className="bg-panel p-6 rounded-2xl border border-panel-border">
          <h3 className="text-xl font-bold text-text-main mb-4">Programming Schedule</h3>
          
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
            {DAYS.map((dayName, idx) => (
              <button 
                key={dayName} 
                onClick={() => { playSound('nav'); setSelectedDay(idx); }}
                className={\`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors \${selectedDay === idx ? 'bg-accent text-text-inv' : 'bg-panel-solid text-text-dim hover:text-text-main'}\`}
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
                    <div key={\`gap-\${lastEnd}\`} className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]">
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
                      <button onClick={() => handleRemove(p.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
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
                  <div key={\`gap-\${lastEnd}\`} className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]">
                      Dead Air Gap: {Math.floor(lastEnd/60).toString().padStart(2, '0')}:{(lastEnd%60).toString().padStart(2, '0')} - 24:00
                  </div>
                );
              }

              return blocks;
            })()}
          </div>

          <form onSubmit={handleAddProgram} className="bg-panel p-4 rounded-xl border border-panel-border space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
            <h4 className="font-bold text-accent">Schedule New Program</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">Start Time</label>
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

            <div className="p-3 bg-panel-solid rounded border border-panel-border space-y-3">
              <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Advertisement Blocks (Optional)</h5>
              <input value={newPreRoll} onChange={e => setNewPreRoll(e.target.value)} placeholder="Pre-roll Ad Video URL (Plays before program)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main text-sm" />
              <input value={newPostRoll} onChange={e => setNewPostRoll(e.target.value)} placeholder="Post-roll Ad Video URL (Plays after program)" className="w-full bg-panel border border-panel-border rounded p-2 text-text-main text-sm" />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-3 rounded-lg font-bold transition-colors">
              <Plus className="w-5 h-5" /> Add to {DAYS[selectedDay]} Schedule
            </button>
          </form>
        </div>`;

code = code.replace(tvModeRegex, newTvMode);

fs.writeFileSync('src/components/BroadcastStudio.tsx', code);

