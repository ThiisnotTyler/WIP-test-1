import React, { useState } from 'react';
import { Tv, Save, Plus } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { StudioProgram } from '../../hooks/useStudioStorage';
import { GlobalClock } from '../GlobalClock';
import { ProgramSchedule, DEFAULT_DAYS } from './ProgramSchedule';
import { StudioForm } from './StudioForm';

export interface TvStudioModeProps {
  channelNumber: string;
  setChannelNumber: (num: string) => void;
  channelName: string;
  setChannelName: (name: string) => void;
  programs: StudioProgram[];
  setPrograms: React.Dispatch<React.SetStateAction<StudioProgram[]>>;
  userTier: number;
  onPlayAudio?: (media: any) => void;
  onSaveChannel: () => void;
}

export function TvStudioMode({
  channelNumber,
  setChannelNumber,
  channelName,
  setChannelName,
  programs,
  setPrograms,
  userTier,
  onPlayAudio,
  onSaveChannel,
}: TvStudioModeProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getUTCDay());
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDur, setNewDur] = useState('30');
  const [newStartTime, setNewStartTime] = useState(() => {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
  });
  const [newPreRoll, setNewPreRoll] = useState('');
  const [newPostRoll, setNewPostRoll] = useState('');

  const handleRemove = (id: string) => {
    playSound('nav');
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      alert('Failed: Title and Stream URL are required.');
      return;
    }

    const [nH, nM] = newStartTime.split(':').map(Number);
    const nStart = nH * 60 + nM;
    const nEnd = nStart + parseInt(newDur);

    if (nEnd > 24 * 60) {
      alert('Program duration extends past midnight. Please adjust the duration or start time.');
      return;
    }

    const hasOverlap = programs.some((p) => {
      if (p.day !== selectedDay) return false;
      const [pH, pM] = (p.startTime || '00:00').split(':').map(Number);
      const pStart = pH * 60 + pM;
      const pEnd = pStart + (p.dur || 30);
      return nStart < pEnd && nEnd > pStart;
    });

    if (hasOverlap) {
      alert('This program conflicts with an existing program on this day. Please choose a different time.');
      return;
    }

    playSound('nav');
    const newProg: StudioProgram = {
      id: 'cp_' + Date.now(),
      title: newTitle,
      desc: newDesc || 'Custom broadcast program.',
      url: newUrl,
      dur: parseInt(newDur) || 30,
      startTime: newStartTime,
      day: selectedDay,
      preRollAd: newPreRoll,
      postRollAd: newPostRoll,
      isVideo: true,
    };
    setPrograms((prev) => [...prev, newProg]);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setNewDur('30');
    setNewPreRoll('');
    setNewPostRoll('');
    alert('Program scheduled successfully!');
  };

  return (
    <>
      <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
        <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <Tv className="w-5 h-5" /> Channel Identity
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">
              CH Number
            </label>
            <input
              value={channelNumber}
              onChange={(e) => setChannelNumber(e.target.value)}
              className="w-full bg-panel border border-panel-border rounded p-2 text-text-main font-mono"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">
              Channel Name
            </label>
            <input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full bg-panel border border-panel-border rounded p-2 text-text-main"
            />
          </div>
        </div>
      </div>

      <div className="bg-panel p-6 rounded-2xl border border-panel-border">
        <ProgramSchedule
          programs={programs}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPlayAudio={onPlayAudio}
          onRemoveProgram={handleRemove}
          days={DEFAULT_DAYS}
        />

        <StudioForm
          heading="Schedule New Program"
          headerRight={<GlobalClock />}
          titleLabel="Program Details"
          titlePlaceholder="Program Title"
          urlPlaceholder="Video Stream URL (.m3u8, .mp4, etc)"
          descPlaceholder="Description (Optional)"
          title={newTitle}
          onTitleChange={setNewTitle}
          url={newUrl}
          onUrlChange={setNewUrl}
          desc={newDesc}
          onDescChange={setNewDesc}
          onSubmit={handleAddProgram}
          className="bg-panel p-4 rounded-xl border border-panel-border space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
          customSubmit={
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-3 rounded-lg font-bold transition-colors"
            >
              <Plus className="w-5 h-5" /> Add to {DEFAULT_DAYS[selectedDay]} Schedule
            </button>
          }
          childrenAfterInputs={
            userTier >= 4 ? (
              <div className="p-4 bg-panel-solid rounded-xl border border-yellow-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full pointer-events-none" />
                <div>
                  <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    Monetization: Ad Blocks
                  </h5>
                  <p className="text-[10px] text-text-dim mt-1">
                    Drag-and-drop ad media files or paste URLs to insert advertisements at specific
                    program timestamps.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center group">
                    <label className="text-[10px] font-bold text-text-main uppercase w-20 shrink-0 flex items-center gap-1 group-hover:text-yellow-500 transition-colors">
                      Start (Pre)
                    </label>
                    <input
                      value={newPreRoll}
                      onChange={(e) => setNewPreRoll(e.target.value)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          setNewPreRoll(URL.createObjectURL(e.dataTransfer.files[0]));
                        }
                      }}
                      placeholder="Drop file here or paste URL..."
                      className="w-full bg-panel border-2 border-dashed border-panel-border hover:border-yellow-500/50 rounded p-2 text-text-main text-xs transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 items-center group">
                    <label className="text-[10px] font-bold text-text-main uppercase w-20 shrink-0 flex items-center gap-1 group-hover:text-yellow-500 transition-colors">
                      End (Post)
                    </label>
                    <input
                      value={newPostRoll}
                      onChange={(e) => setNewPostRoll(e.target.value)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          setNewPostRoll(URL.createObjectURL(e.dataTransfer.files[0]));
                        }
                      }}
                      placeholder="Drop file here or paste URL..."
                      className="w-full bg-panel border-2 border-dashed border-panel-border hover:border-yellow-500/50 rounded p-2 text-text-main text-xs transition-colors"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-panel-solid rounded border border-panel-border flex flex-col items-center justify-center text-center opacity-70">
                <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-wide mb-1">
                  Advertisement Monetization
                </h5>
                <p className="text-[10px] text-text-dim max-w-[200px]">
                  Upgrade to Tier 4 or higher to insert pre-roll and post-roll advertisements into
                  your broadcasts.
                </p>
              </div>
            )
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">
                Start Time (UTC)
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full bg-panel border border-panel-border rounded p-2 text-text-main"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={newDur}
                onChange={(e) => setNewDur(e.target.value)}
                className="w-full bg-panel border border-panel-border rounded p-2 text-text-main"
                required
              />
            </div>
          </div>
        </StudioForm>
      </div>

      <button
        onClick={onSaveChannel}
        className="w-full flex items-center justify-center gap-2 bg-accent text-text-inv p-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(var(--theme-accent-rgb),0.3)]"
      >
        <Save className="w-6 h-6" /> Save & Broadcast Channel
      </button>
    </>
  );
}
