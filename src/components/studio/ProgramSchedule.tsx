import React from 'react';
import { Play, Trash2 } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { StudioProgram } from '../../hooks/useStudioStorage';

export const DEFAULT_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ProgramScheduleProps {
  programs: StudioProgram[];
  selectedDay: number;
  onSelectDay: (dayIndex: number) => void;
  onPlayAudio?: (program: any) => void;
  onRemoveProgram: (id: string) => void;
  days?: string[];
}

export function ProgramSchedule({
  programs,
  selectedDay,
  onSelectDay,
  onPlayAudio,
  onRemoveProgram,
  days = DEFAULT_DAYS,
}: ProgramScheduleProps) {
  const dayPrograms = programs
    .filter((p) => p.day === selectedDay)
    .sort((a, b) => {
      const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
      const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

  return (
    <div>
      <h3 className="text-xl font-bold text-text-main mb-4">Programming Schedule</h3>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {days.map((dayName, idx) => (
          <button
            key={dayName}
            onClick={() => {
              playSound('nav');
              onSelectDay(idx);
            }}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
              selectedDay === idx
                ? 'bg-accent text-text-inv'
                : 'bg-panel-solid text-text-dim hover:text-text-main'
            }`}
          >
            {dayName}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6 relative">
        {(() => {
          if (dayPrograms.length === 0) {
            return (
              <div className="text-text-dim italic p-4 bg-panel rounded text-center border-2 border-dashed border-panel-border">
                No programs scheduled for {days[selectedDay]}. This day will have dead air.
              </div>
            );
          }

          const blocks: React.ReactNode[] = [];
          let lastEnd = 0;

          dayPrograms.forEach((p) => {
            const [pH, pM] = (p.startTime || '00:00').split(':').map(Number);
            const pStart = pH * 60 + pM;
            const pEnd = pStart + (p.dur || 30);

            if (pStart > lastEnd) {
              blocks.push(
                <div
                  key={`gap-${lastEnd}`}
                  className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]"
                >
                  Dead Air Gap: {Math.floor(lastEnd / 60).toString().padStart(2, '0')}:
                  {(lastEnd % 60).toString().padStart(2, '0')} -{' '}
                  {Math.floor(pStart / 60).toString().padStart(2, '0')}:
                  {(pStart % 60).toString().padStart(2, '0')}
                </div>
              );
            }

            blocks.push(
              <div
                key={p.id}
                className="flex flex-col p-3 bg-panel rounded border border-panel-border shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-text-main flex items-center gap-2">
                      <span className="text-accent bg-accent/10 px-2 py-0.5 rounded text-sm">
                        {p.startTime}
                      </span>
                      {p.title}
                      <span className="text-xs font-normal text-text-dim">{p.dur} mins</span>
                    </div>
                    <div className="text-xs text-text-dim truncate max-w-[250px] mt-1">{p.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playSound('select');
                        onPlayAudio?.({ ...p, category: 'TV & Movies' });
                      }}
                      className="p-2 text-accent hover:bg-accent/20 rounded-full transition-colors"
                      title="Test Play Broadcast (Ignores Schedule Time)"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        playSound('nav');
                        onRemoveProgram(p.id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors"
                      title="Remove Program"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {(p.preRollAd || p.postRollAd) && (
                  <div className="mt-3 pt-2 border-t border-panel-border flex flex-col gap-1">
                    {p.preRollAd && (
                      <div className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" /> Pre-roll Ad:{' '}
                        <span className="text-text-dim lowercase truncate max-w-[200px]">
                          {p.preRollAd}
                        </span>
                      </div>
                    )}
                    {p.postRollAd && (
                      <div className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" /> Post-roll Ad:{' '}
                        <span className="text-text-dim lowercase truncate max-w-[200px]">
                          {p.postRollAd}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );

            lastEnd = pEnd;
          });

          if (lastEnd < 24 * 60) {
            blocks.push(
              <div
                key={`gap-${lastEnd}`}
                className="flex items-center justify-center p-2 bg-panel-solid border border-red-500/30 rounded text-red-400 text-xs font-bold bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.05)_10px,rgba(239,68,68,0.05)_20px)]"
              >
                Dead Air Gap: {Math.floor(lastEnd / 60).toString().padStart(2, '0')}:
                {(lastEnd % 60).toString().padStart(2, '0')} - 24:00
              </div>
            );
          }

          return blocks;
        })()}
      </div>
    </div>
  );
}
