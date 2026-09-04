import React from 'react';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { playSound } from '../utils/audio';

export const SettingsView = React.memo(function SettingsView({ onBack, safeMode, setSafeMode, curatedMode, setCuratedMode, ageRestrictedMode, setAgeRestrictedMode, userTier, setUserTier, appTheme, setAppTheme }: any) {
  const [tab, setTab] = React.useState<'SETTINGS' | 'MESSAGES'>('SETTINGS');

  const [uiMuted, setUiMuted] = React.useState(() => localStorage.getItem('nexus_uiMuted') === 'true');
  const [autoplayEnabled, setAutoplayEnabled] = React.useState(() => {
    const val = localStorage.getItem('nexus_autoplayEnabled');
    return val !== null ? val === 'true' : true;
  });

  React.useEffect(() => {
    localStorage.setItem('nexus_uiMuted', uiMuted.toString());
  }, [uiMuted]);

  React.useEffect(() => {
    localStorage.setItem('nexus_autoplayEnabled', autoplayEnabled.toString());
  }, [autoplayEnabled]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => { playSound('select'); onBack(); }} 
          className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">System</h2>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button onClick={() => { playSound('select'); setTab('SETTINGS'); }} className={`px-6 py-2 rounded-full font-bold transition-colors ${tab === 'SETTINGS' ? 'bg-accent text-text-inv' : 'bg-panel text-text-main hover:bg-panel-hover'}`}>Settings</button>
        <button onClick={() => { playSound('select'); setTab('MESSAGES'); }} className={`px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2 ${tab === 'MESSAGES' ? 'bg-accent text-text-inv' : 'bg-panel text-text-main hover:bg-panel-hover'}`}>Messages <span className="bg-red-500 text-text-main text-[10px] px-1.5 py-0.5 rounded-full">3</span></button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4 hide-scrollbar">
        {tab === 'SETTINGS' ? (
           <div className="space-y-6">
              <div className="bg-panel p-6 rounded-2xl border border-panel-border">
                 <h3 className="text-xl font-bold text-text-main mb-4">Account</h3>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Subscription Tier</div>
                     <div className="text-sm opacity-60">Simulate different account levels</div>
                   </div>
                   <select 
                     value={userTier} 
                     onChange={(e) => { playSound('select'); setUserTier(Number(e.target.value)); }}
                     className="bg-panel border border-panel-border text-text-main rounded-lg px-3 py-1.5 outline-none focus:border-accent"
                   >
                     <option value={1}>Tier 1 (Freemium)</option>
                     <option value={2}>Tier 2 (Premium)</option>
                     <option value={3}>Tier 3 (Producer)</option>
                    <option value={4}>Tier 4 (Moderator)</option>
                   </select>
                 </div>
                 
                 <h3 className="text-xl font-bold text-text-main mb-4 mt-6">Aesthetic</h3>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">System Theme</div>
                     <div className="text-sm opacity-60">Choose your visual aesthetic</div>
                   </div>
                   <div className="flex gap-2">
                     <button
                       onClick={() => { playSound('select'); setAppTheme('original'); }}
                       className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${appTheme === 'original' ? 'border-accent bg-accent/20 text-accent' : 'border-panel-border text-text-dim hover:text-text-main'}`}
                     >
                       Nexus Original
                     </button>
                     <button
                       onClick={() => { playSound('select'); setAppTheme('frutiger'); }}
                       className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${appTheme === 'frutiger' ? 'border-accent bg-accent/20 text-accent' : 'border-panel-border text-text-dim hover:text-text-main'}`}
                     >
                       Frutiger Aero
                     </button>
                   </div>
                 </div>

                 <h3 className="text-xl font-bold text-text-main mb-4 mt-6">Content Filters</h3>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Age Restricted Mode</div>
                     <div className="text-sm opacity-60">Block content flagged by moderators as age restricted, and disables the search function</div>
                   </div>
                   <button 
                     onClick={() => { if (userTier === 1) return; playSound('select'); setAgeRestrictedMode(!ageRestrictedMode); }}
                     className={`w-12 h-6 rounded-full relative transition-colors ${ageRestrictedMode ? 'bg-red-500' : 'bg-white/20'} ${userTier === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${ageRestrictedMode ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                     <div>
                     <div className="font-bold">Safe Mode</div>
                     <div className="text-sm opacity-60">Block content containing NSFW keywords</div>
                   </div>
                   <button 
                     onClick={() => { if (userTier === 1) return; playSound('select'); setSafeMode(!safeMode); }} 
                     className={`w-12 h-6 rounded-full relative transition-colors ${safeMode ? 'bg-red-500' : 'bg-white/20'} ${userTier === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${safeMode ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Cinematic Filter</div>
                     <div className="text-sm opacity-60">Hide short clips, vlogs, and reviews to prioritize movies & shows</div>
                   </div>
                   <button 
                     onClick={() => { if (userTier === 1) return; playSound('select'); setCuratedMode(!curatedMode); }} 
                     className={`w-12 h-6 rounded-full relative transition-colors ${curatedMode ? 'bg-accent' : 'bg-white/20'} ${userTier === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${curatedMode ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
              </div>

              <div className="bg-panel p-6 rounded-2xl border border-panel-border">
                 <h3 className="text-xl font-bold text-text-main mb-4">Audio & Playback</h3>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Mute UI Sounds</div>
                     <div className="text-sm opacity-60">Disable all navigation and hover sound effects</div>
                   </div>
                   <button 
                     onClick={() => { setUiMuted(!uiMuted); playSound('select'); }}
                     className={`w-12 h-6 rounded-full relative transition-colors ${uiMuted ? 'bg-accent' : 'bg-white/20'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${uiMuted ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Autoplay Media</div>
                     <div className="text-sm opacity-60">Automatically begin playback when selecting an item</div>
                   </div>
                   <button 
                     onClick={() => { setAutoplayEnabled(!autoplayEnabled); playSound('select'); }}
                     className={`w-12 h-6 rounded-full relative transition-colors ${autoplayEnabled ? 'bg-accent' : 'bg-white/20'}`}
                   >
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoplayEnabled ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
                 <div className="flex items-center gap-4 text-text-main">
                   <Volume2 className="w-6 h-6" />
                   <span className="opacity-70 flex-1">System Volume Master</span>
                   <span className="font-bold opacity-50">Controlled via Player</span>
                 </div>
              </div>
              <div className="bg-panel p-6 rounded-2xl border border-panel-border">
                 <h3 className="text-xl font-bold text-text-main mb-4">Network</h3>
                 <div className="flex items-center justify-between text-text-main border-b border-panel-border pb-4 mb-4">
                   <div>
                     <div className="font-bold">Offline Cache</div>
                     <div className="text-sm opacity-60">Store streams locally for offline viewing</div>
                   </div>
                   <div className="w-12 h-6 bg-accent rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" /></div>
                 </div>
                 <div className="flex items-center justify-between text-text-main">
                   <div>
                     <div className="font-bold">Data Saver</div>
                     <div className="text-sm opacity-60">Reduce bandwidth on cellular</div>
                   </div>
                   <div className="w-12 h-6 bg-white/20 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                 </div>
              </div>
              <div className="bg-panel p-6 rounded-2xl border border-red-500/30">
                 <h3 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h3>
                 <div className="flex items-center justify-between text-text-main">
                   <div>
                     <div className="font-bold">Factory Reset</div>
                     <div className="text-sm opacity-60">Clear all saved channels, settings, and favorites</div>
                   </div>
                   <button 
                     onClick={() => {
                       if (confirm('Are you sure you want to erase all data? This cannot be undone.')) {
                         localStorage.clear();
                         window.location.reload();
                       }
                     }}
                     className="bg-red-500 hover:bg-red-600 text-text-main font-bold py-2 px-4 rounded transition-colors"
                   >
                     Reset App
                   </button>
                 </div>
              </div>
           </div>
        ) : (
           <div className="space-y-4">
              <div className="bg-panel p-4 rounded-xl border-l-4 border-red-500">
                <div className="text-xs opacity-50 text-text-main mb-1">10 mins ago</div>
                <div className="font-bold text-text-main">Security Alert</div>
                <div className="text-sm text-text-dim">Unrecognized login attempt from IP 192.168.1.42.</div>
              </div>
              <div className="bg-panel p-4 rounded-xl border-l-4 border-accent">
                <div className="text-xs opacity-50 text-text-main mb-1">2 hours ago</div>
                <div className="font-bold text-text-main">System Update</div>
                <div className="text-sm text-text-dim">Nexus Central firmware updated to v2.4.1.</div>
              </div>
              <div className="bg-panel p-4 rounded-xl border-l-4 border-blue-500">
                <div className="text-xs opacity-50 text-text-main mb-1">1 day ago</div>
                <div className="font-bold text-text-main">New Feed Added</div>
                <div className="text-sm text-text-dim">Monterey Bay Sea Otters stream is now online.</div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
});
