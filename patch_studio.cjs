const fs = require('fs');
let code = fs.readFileSync('src/components/BroadcastStudio.tsx', 'utf8');

// 1. Add alert for missing fields
code = code.replace(
  "if (!newTitle || !newUrl) return;",
  "if (!newTitle || !newUrl) { alert('Failed: Title and Stream URL are required.'); return; }"
);

// 2. Add success alert
code = code.replace(
  "setNewPostRoll('');\n  };",
  "setNewPostRoll('');\n    alert('Program scheduled successfully!');\n  };"
);

// 3. Add 'Test Play' button next to Trash2 in program list
const trashBtnMatch = `<button onClick={() => handleRemove(p.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>`;
                      
const newBtns = `<div className="flex items-center gap-2">
                        <button onClick={() => { playSound('select'); onPlayAudio({ ...p, category: 'TV & Movies' }); }} className="p-2 text-accent hover:bg-accent/20 rounded-full transition-colors" title="Test Play Broadcast (Ignores Schedule Time)">
                          <Play className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRemove(p.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition-colors" title="Remove Program">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>`;
code = code.replace(trashBtnMatch, newBtns);

fs.writeFileSync('src/components/BroadcastStudio.tsx', code);
