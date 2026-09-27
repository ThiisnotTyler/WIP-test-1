import React from 'react';

export interface AudioVisualizerProps {
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({
  barCount = 16,
  className = "absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-center gap-1 opacity-50 z-0",
}: AudioVisualizerProps) {
  return (
    <div className={className}>
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-accent rounded-t-sm animate-[pulse_0.5s_ease-in-out_infinite_alternate]"
          style={{
            height: `${20 + Math.random() * 80}%`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
