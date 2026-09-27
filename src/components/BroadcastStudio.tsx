import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playSound } from '../utils/audio';
import { useStudioStorage } from '../hooks/useStudioStorage';
import { toast } from '../context/ToastContext';
import { TvStudioMode } from './studio/TvStudioMode';
import { FeedStudioMode } from './studio/FeedStudioMode';
import { P2pStudioMode } from './studio/P2pStudioMode';
import { ModerateStudioMode } from './studio/ModerateStudioMode';

export interface BroadcastStudioProps {
  onBack: () => void;
  userTier: number;
  onPlayAudio?: (media: any) => void;
}

export const BroadcastStudio = React.memo(function BroadcastStudio({
  onBack,
  userTier,
  onPlayAudio,
}: BroadcastStudioProps) {
  const {
    channelName,
    setChannelName,
    channelNumber,
    setChannelNumber,
    programs,
    setPrograms,
    feeds,
    updateFeeds,
    p2pMagnets,
    updateMagnets,
    saveCustomChannel,
  } = useStudioStorage();

  const [studioMode, setStudioMode] = useState<'TV' | 'FEED' | 'P2P' | 'MODERATE'>('TV');

  const handleSave = () => {
    playSound('select');
    saveCustomChannel();
    toast.success('Channel broadcast updated! It will now appear in the TV Guide.');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            playSound('select');
            onBack();
          }}
          className="p-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-text-main shadow-black drop-shadow-md">
          Broadcast Studio
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 hide-scrollbar space-y-6 pb-20">
        <div className="flex bg-panel rounded-xl p-1 border border-panel-border overflow-x-auto hide-scrollbar">
          <button
            onClick={() => {
              playSound('nav');
              setStudioMode('TV');
            }}
            className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
              studioMode === 'TV' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'
            }`}
          >
            TV Channel
          </button>
          <button
            onClick={() => {
              playSound('nav');
              setStudioMode('FEED');
            }}
            className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
              studioMode === 'FEED' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'
            }`}
          >
            Live Feeds
          </button>
          <button
            onClick={() => {
              playSound('nav');
              setStudioMode('P2P');
            }}
            className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
              studioMode === 'P2P' ? 'bg-accent text-text-inv shadow' : 'text-text-main hover:bg-panel'
            }`}
          >
            P2P Swarms
          </button>
          {userTier >= 4 && (
            <button
              onClick={() => {
                playSound('nav');
                setStudioMode('MODERATE');
              }}
              className={`px-6 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
                studioMode === 'MODERATE'
                  ? 'bg-red-500 text-text-main shadow'
                  : 'text-text-main hover:bg-panel'
              }`}
            >
              Moderation
            </button>
          )}
        </div>

        {studioMode === 'TV' ? (
          <TvStudioMode
            channelNumber={channelNumber}
            setChannelNumber={setChannelNumber}
            channelName={channelName}
            setChannelName={setChannelName}
            programs={programs}
            setPrograms={setPrograms}
            userTier={userTier}
            onPlayAudio={onPlayAudio}
            onSaveChannel={handleSave}
          />
        ) : studioMode === 'FEED' ? (
          <FeedStudioMode
            feeds={feeds}
            onAddFeed={(newFeed) => updateFeeds([...feeds, newFeed])}
            onRemoveFeed={(id) => updateFeeds(feeds.filter((f) => f.id !== id))}
          />
        ) : studioMode === 'P2P' ? (
          <P2pStudioMode
            p2pMagnets={p2pMagnets}
            onAddMagnet={(newMagnet) => updateMagnets([...p2pMagnets, newMagnet])}
            onRemoveMagnet={(id) => updateMagnets(p2pMagnets.filter((m) => m.id !== id))}
          />
        ) : studioMode === 'MODERATE' && userTier >= 4 ? (
          <ModerateStudioMode onPlayAudio={onPlayAudio} />
        ) : null}
      </div>
    </div>
  );
});
