const fs = require('fs');
let code = fs.readFileSync('src/components/BroadcastStudio.tsx', 'utf8');

code = code.replace(
  "const [newStartTime, setNewStartTime] = useState('08:00');",
  "const [newStartTime, setNewStartTime] = useState(() => { const now = new Date(); return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`; });"
);

code = code.replace(
  "<label className=\"block text-[10px] uppercase font-bold text-text-dim mb-1\">Start Time</label>",
  "<label className=\"block text-[10px] uppercase font-bold text-text-dim mb-1\">Start Time (UTC)</label>"
);

fs.writeFileSync('src/components/BroadcastStudio.tsx', code);
