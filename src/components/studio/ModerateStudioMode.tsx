import React, { useState } from 'react';
import { Tv, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { toast } from '../../context/ToastContext';

export interface PendingQueueItem {
  id: string;
  type: string;
  user: string;
  title: string;
  url: string;
  desc?: string;
}

export interface ModerateStudioModeProps {
  onPlayAudio?: (media: any) => void;
}

export function ModerateStudioMode({ onPlayAudio }: ModerateStudioModeProps) {
  const [pendingQueue, setPendingQueue] = useState<PendingQueueItem[]>([
    {
      id: 'mq_1',
      type: 'channel',
      user: 'User492',
      title: 'Action Movies 24/7',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      desc: 'A 24/7 channel showing classic action movies.',
    },
    {
      id: 'mq_2',
      type: 'feed',
      user: 'StreamerXYZ',
      title: 'Live Gaming Event',
      url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      desc: 'Live esports tournament broadcast.',
    },
  ]);

  const [expandedModId, setExpandedModId] = useState<string | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [isAgeRestricted, setIsAgeRestricted] = useState(false);

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

  const handleApprove = (id: string) => {
    playSound('nav');
    toast.success(
      `Approved and added to public directory.${
        isAgeRestricted ? ' (Marked as Age Restricted 18+)' : ''
      }`
    );
    setPendingQueue((q) => q.filter((item) => item.id !== id));
    if (expandedModId === id) setExpandedModId(null);
  };

  const confirmDeny = (id: string) => {
    playSound('nav');
    if (!denyReason.trim()) {
      toast.error('Please provide a reason for denial.');
      return;
    }
    toast.info(`Denied. Reason sent to user: ${denyReason}`);
    setPendingQueue((q) => q.filter((item) => item.id !== id));
    setDenyingId(null);
    setIsAgeRestricted(false);
    setDenyReason('');
    if (expandedModId === id) setExpandedModId(null);
  };

  return (
    <div className="bg-panel p-6 rounded-2xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
      <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
        <Tv className="w-5 h-5" /> Moderation Queue
      </h3>
      <div className="text-text-dim mb-6 text-sm">
        Review incoming community channels and live feeds. You must provide a reason for any denied
        content.
      </div>

      <div className="space-y-4">
        {pendingQueue.length === 0 ? (
          <div className="text-text-dim italic p-4 bg-panel rounded text-center">
            Queue is empty. Great job!
          </div>
        ) : (
          pendingQueue.map((item) => {
            const isExpanded = expandedModId === item.id;
            return (
              <div
                key={item.id}
                className="bg-panel rounded-xl border border-panel-border overflow-hidden transition-all duration-300"
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between cursor-pointer hover:bg-panel"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.type === 'channel'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}
                      >
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
                      <p>
                        <strong className="text-text-main">Source URL:</strong>{' '}
                        <span className="break-all text-blue-300">{item.url}</span>
                      </p>
                      <p>
                        <strong className="text-text-main">Description:</strong>{' '}
                        {item.desc || 'No description provided by user.'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => {
                          playSound('select');
                          onPlayAudio?.({
                            id: item.id,
                            url: item.url,
                            title: item.title,
                            desc: item.desc,
                            isVideo: true,
                            category: 'Moderation Test',
                          });
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
                          onChange={(e) => {
                            playSound('nav');
                            setIsAgeRestricted(e.target.checked);
                          }}
                          className="w-5 h-5 accent-red-500"
                        />
                        <label
                          htmlFor={`age_rest_${item.id}`}
                          className="text-sm font-bold text-red-400 cursor-pointer"
                        >
                          Flag as Age Restricted (18+)
                        </label>
                      </div>

                      {denyingId === item.id ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col gap-3">
                          <label className="text-sm font-bold text-red-400">
                            Provide Denial Reason (Sent to User)
                          </label>
                          <input
                            value={denyReason}
                            onChange={(e) => setDenyReason(e.target.value)}
                            placeholder="E.g., Stream link is broken, violates TOS, etc."
                            className="w-full bg-panel border border-red-500/50 rounded p-2 text-text-main outline-none focus:border-red-400"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              onClick={() => {
                                setDenyingId(null);
                                setIsAgeRestricted(false);
                                setDenyReason('');
                                playSound('nav');
                              }}
                              className="px-4 py-2 text-text-dim hover:text-text-main transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => confirmDeny(item.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-400 text-text-main font-bold rounded transition-colors"
                            >
                              Confirm Deny
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 pt-2 border-t border-panel-border">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="flex-1 bg-green-500 hover:bg-green-400 text-text-inv font-bold py-3 px-4 rounded transition-colors"
                          >
                            Approve Submission
                          </button>
                          <button
                            onClick={() => {
                              playSound('nav');
                              setDenyingId(item.id);
                              setDenyReason('');
                            }}
                            className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-text-main border border-red-500/50 font-bold py-3 px-4 rounded transition-colors"
                          >
                            Deny Submission
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
