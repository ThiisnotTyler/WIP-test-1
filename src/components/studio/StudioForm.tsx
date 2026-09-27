import React from 'react';
import { Plus } from 'lucide-react';

export interface StudioFormProps {
  heading?: string;
  headerRight?: React.ReactNode;
  titleLabel?: string;
  titlePlaceholder: string;
  urlPlaceholder: string;
  descPlaceholder?: string;
  submitLabel?: string;
  title: string;
  onTitleChange: (val: string) => void;
  url: string;
  onUrlChange: (val: string) => void;
  desc: string;
  onDescChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  childrenAfterInputs?: React.ReactNode;
  customSubmit?: React.ReactNode;
  className?: string;
}

export function StudioForm({
  heading,
  headerRight,
  titleLabel,
  titlePlaceholder,
  urlPlaceholder,
  descPlaceholder = "Description (Optional)",
  submitLabel,
  title,
  onTitleChange,
  url,
  onUrlChange,
  desc,
  onDescChange,
  onSubmit,
  children,
  childrenAfterInputs,
  customSubmit,
  className = "bg-panel p-4 rounded-xl border border-panel-border space-y-4"
}: StudioFormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {(heading || headerRight) && (
        <div className="flex items-center justify-between">
          {heading && <h4 className="font-bold text-accent">{heading}</h4>}
          {headerRight}
        </div>
      )}

      {children}

      <div>
        {titleLabel && (
          <label className="block text-[10px] uppercase font-bold text-text-dim mb-1">
            {titleLabel}
          </label>
        )}
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3"
          required
        />
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={urlPlaceholder}
          className="w-full bg-panel border border-panel-border rounded p-2 text-text-main mb-3"
          required
        />
        <input
          value={desc}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder={descPlaceholder}
          className="w-full bg-panel border border-panel-border rounded p-2 text-text-main"
        />
      </div>

      {childrenAfterInputs}

      {customSubmit ? (
        customSubmit
      ) : submitLabel ? (
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-panel hover:bg-accent hover:text-text-inv text-text-main p-2 rounded font-bold transition-colors"
        >
          <Plus className="w-5 h-5" /> {submitLabel}
        </button>
      ) : null}
    </form>
  );
}
