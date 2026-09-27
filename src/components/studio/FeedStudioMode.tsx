import React, { useState } from 'react';
import { Tv, Trash2 } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { StudioFeed } from '../../hooks/useStudioStorage';
import { StudioForm } from './StudioForm';

export interface FeedStudioModeProps {
  feeds: StudioFeed[];
  onAddFeed: (feed: StudioFeed) => void;
  onRemoveFeed: (id: string) => void;
}

export function FeedStudioMode({ feeds, onAddFeed, onRemoveFeed }: FeedStudioModeProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    playSound('nav');
    const newFeed: StudioFeed = {
      id: 'cf_' + Date.now(),
      title: newTitle,
      category: 'Live Feed',
      url: newUrl,
      desc: newDesc || 'Custom broadcast live feed.',
      viewers: Math.floor(Math.random() * 1000) + 'k',
      ping: '12ms',
      isVideo: true,
    };
    onAddFeed(newFeed);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    alert('Live feed broadcast updated!');
  };

  return (
    <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
      <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
        <Tv className="w-5 h-5" /> Active Feeds
      </h3>

      <div className="space-y-3 mb-6">
        {feeds.length === 0 ? (
          <div className="text-text-dim italic p-4 bg-panel rounded text-center">
            No feeds broadcasting.
          </div>
        ) : (
          feeds.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-3 bg-panel rounded border border-panel-border"
            >
              <div>
                <div className="font-bold text-text-main">{f.title}</div>
                <div className="text-xs text-text-dim truncate max-w-[250px]">{f.url}</div>
              </div>
              <button
                onClick={() => onRemoveFeed(f.id)}
                className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <StudioForm
        heading="Add Live Feed"
        titlePlaceholder="Feed Title"
        urlPlaceholder="Video Stream URL (.m3u8, .mp4, etc)"
        descPlaceholder="Description (Optional)"
        submitLabel="Start Broadcast"
        title={newTitle}
        onTitleChange={setNewTitle}
        url={newUrl}
        onUrlChange={setNewUrl}
        desc={newDesc}
        onDescChange={setNewDesc}
        onSubmit={handleAddFeed}
      />
    </div>
  );
}
