const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add adState
code = code.replace(
  "const [activeMedia, setActiveMedia] = useState<any | null>(null);",
  "const [activeMedia, setActiveMedia] = useState<any | null>(null);\n  const [adState, setAdState] = useState<'NONE' | 'PREROLL' | 'MAIN' | 'POSTROLL'>('NONE');"
);

// 2. Add currentPlaybackUrl
const currentPlaybackUrlStr = `  const currentPlaybackUrl = React.useMemo(() => {
    if (!activeMedia) return null;
    if (adState === 'PREROLL' && activeMedia.preRollAd) return activeMedia.preRollAd;
    if (adState === 'POSTROLL' && activeMedia.postRollAd) return activeMedia.postRollAd;
    return activeMedia.url;
  }, [activeMedia, adState]);`;

code = code.replace(
  "const [isPlaying, setIsPlaying] = useState(false);",
  "const [isPlaying, setIsPlaying] = useState(false);\n" + currentPlaybackUrlStr
);

// 3. Update handlePlayMedia
const oldHandlePlayMedia = /const handlePlayMedia = useCallback\(\(item: any\) => \{[\s\S]*?\}, \[activeMediaId, isPlaying\]\);/;

const newHandlePlayMedia = `const handlePlayMedia = useCallback((item: any) => {
    const mediaId = item.url || item.id;
    if (activeMediaId === mediaId) {
      if (audioRef.current && (!item.isVideo)) {
        if (audioRef.current.paused) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                console.error("Playback error:", error);
              }
            });
          }
        }
        else audioRef.current.pause();
      } else {
        setIsPlaying(!isPlaying);
      }
    } else {
      setActiveMedia(item);
      if (item.preRollAd) setAdState('PREROLL');
      else setAdState('MAIN');
      const isAutoplay = localStorage.getItem('nexus_autoplayEnabled') !== 'false';
      setIsPlaying(isAutoplay);
    }
  }, [activeMediaId, isPlaying]);`;
code = code.replace(oldHandlePlayMedia, newHandlePlayMedia);

// 4. Update handleMediaEnded
const oldHandleMediaEnded = /const handleMediaEnded = useCallback\(\(\) => \{[\s\S]*?setIsPlaying\(false\);\n  \}, \[activeMedia, handlePlayMedia\]\);/;

const newHandleMediaEnded = `const handleMediaEnded = useCallback(() => {
    if (!activeMedia) {
      setIsPlaying(false);
      return;
    }

    if (adState === 'PREROLL') {
      setAdState('MAIN');
      return;
    }
    if (adState === 'MAIN' && activeMedia.postRollAd) {
      setAdState('POSTROLL');
      return;
    }
    
    setAdState('NONE');

    // First, see if we are a TV channel program
    if (activeMedia.category === 'TV & Movies') {
      let foundProg = false;
      let allChannels = [...CHANNELS];
      try {
        const saved = localStorage.getItem('nexus_custom_channel');
        if (saved) {
          const customChannel = JSON.parse(saved);
          if (customChannel && customChannel.programs) {
            allChannels.push(customChannel);
          }
        }
      } catch(e) {}
      
      for (const ch of allChannels) {
        const progIndex = ch.programs.findIndex((p: any) => p.id === activeMedia.id);
        if (progIndex !== -1) {
          foundProg = true;
          if (progIndex + 1 < ch.programs.length) {
            handlePlayMedia({ ...ch.programs[progIndex + 1], category: 'TV & Movies' });
            return;
          }
        }
      }
    }
    
    // Check if it's an audio/radio
    if (activeMedia.category === 'Radio' || activeMedia.category === 'Music') {
      const idx = AUDIO.findIndex(a => a.id === activeMedia.id);
      if (idx !== -1 && idx + 1 < AUDIO.length) {
        handlePlayMedia(AUDIO[idx + 1]);
        return;
      }
    }
    
    // Check if it's a feed
    if (activeMedia.category === 'Live Feed') {
      // Need to grab current customFeeds from local storage to auto-play correctly
      let feeds: any[] = [];
      try {
        const saved = localStorage.getItem('nexus_custom_feeds');
        if (saved) feeds = JSON.parse(saved);
      } catch(e) {}
      
      const idx = feeds.findIndex((f: any) => f.id === activeMedia.id);
      if (idx !== -1 && idx + 1 < feeds.length) {
        handlePlayMedia(feeds[idx + 1]);
        return;
      }
    }
    
    // If no next item found, stop playing
    setIsPlaying(false);
  }, [activeMedia, adState, handlePlayMedia]);`;
code = code.replace(oldHandleMediaEnded, newHandleMediaEnded);

// 5. Replace `url={activeMedia.url}` with `url={currentPlaybackUrl}` in VideoPlayer rendering
code = code.replace(
  /<VideoPlayer ref=\{videoPlayerRef\}([\s\S]*?)url=\{activeMedia\.url\}/,
  "<VideoPlayer ref={videoPlayerRef}$1url={currentPlaybackUrl}"
);

// 6. Update Audio source replacement as well (just in case audio has ads)
code = code.replace(
  "audioRef.current.src !== activeMedia.url",
  "audioRef.current.src !== currentPlaybackUrl"
);
code = code.replace(
  "audioRef.current.src = activeMedia.url;",
  "audioRef.current.src = currentPlaybackUrl;"
);

// 7. Update UI to show "Ad Playing" state
code = code.replace(
  "const [isPipExpanded, setIsPipExpanded] = useState(false);",
  "const [isPipExpanded, setIsPipExpanded] = useState(false);\n  const isAdPlaying = adState === 'PREROLL' || adState === 'POSTROLL';"
);

code = code.replace(
  "const [activeMediaId, isPlaying]", // fix deps in handlePlayMedia since we used old string
  "activeMediaId, isPlaying"
);

// Update "LIVE" indicator to say "ADVERTISEMENT" when adState is playing
code = code.replace(
  "{isPlaying ? (\n                        <span className=\"flex items-center gap-1\">\n                          <div className=\"w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse\" /> LIVE\n                        </span>\n                      ) : 'PAUSED'}",
  "{isPlaying ? (\n                        isAdPlaying ? <span className=\"text-yellow-500\">ADVERTISEMENT</span> : <span className=\"flex items-center gap-1\">\n                          <div className=\"w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse\" /> LIVE\n                        </span>\n                      ) : 'PAUSED'}"
);


fs.writeFileSync('src/App.tsx', code);
