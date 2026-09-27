import React, { useState } from 'react';
import { Network, Trash2 } from 'lucide-react';
import { playSound } from '../../utils/audio';
import { StudioMagnet } from '../../hooks/useStudioStorage';
import { StudioForm } from './StudioForm';
import { toast } from '../../context/ToastContext';

export interface P2pStudioModeProps {
  p2pMagnets: StudioMagnet[];
  onAddMagnet: (magnet: StudioMagnet) => void;
  onRemoveMagnet: (id: string) => void;
}

export function P2pStudioMode({ p2pMagnets, onAddMagnet, onRemoveMagnet }: P2pStudioModeProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddMagnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      toast.error('Title and Magnet URI are required.');
      return;
    }
    if (!newUrl.startsWith('magnet:')) {
      toast.error('Must be a valid magnet link starting with magnet:');
      return;
    }
    playSound('nav');
    const newMagnet: StudioMagnet = {
      id: 'p2p_' + Date.now(),
      title: newTitle,
      magnet: newUrl,
      desc: newDesc || 'Approved P2P swarm.',
    };
    onAddMagnet(newMagnet);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    toast.success('P2P Magnet Swarm approved and published!');
  };

  return (
    <div className="bg-panel p-6 rounded-2xl border border-accent/50 shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.1)]">
      <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
        <Network className="w-5 h-5" /> Active P2P Swarms
      </h3>
      <p className="text-sm text-text-dim mb-6">
        Magnet links added here are moderated via the client engine (which restricts the download to
        a single video file) and appear as approved streams for users.
      </p>

      <div className="space-y-3 mb-6">
        {p2pMagnets.length === 0 ? (
          <div className="text-text-dim italic p-4 bg-panel rounded text-center">
            No P2P swarms broadcasting.
          </div>
        ) : (
          p2pMagnets.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 bg-panel rounded border border-panel-border"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-bold text-text-main truncate">{m.title}</div>
                <div className="text-xs text-text-dim truncate">{m.magnet}</div>
              </div>
              <button
                onClick={() => onRemoveMagnet(m.id)}
                className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <StudioForm
        heading="Add Magnet Swarm"
        titlePlaceholder="Swarm Title"
        urlPlaceholder="magnet:?xt=urn:btih:..."
        descPlaceholder="Description (Optional)"
        submitLabel="Publish P2P Swarm"
        title={newTitle}
        onTitleChange={setNewTitle}
        url={newUrl}
        onUrlChange={setNewUrl}
        desc={newDesc}
        onDescChange={setNewDesc}
        onSubmit={handleAddMagnet}
      />
    </div>
  );
}
