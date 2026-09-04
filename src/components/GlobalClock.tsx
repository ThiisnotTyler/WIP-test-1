import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const GlobalClock = React.memo(function GlobalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 shadow-sm" title="Universal Coordinated Time">
      <Clock className="w-3.5 h-3.5" />
      {time.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })} UTC
    </div>
  );
});
