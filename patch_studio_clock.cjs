const fs = require('fs');
let code = fs.readFileSync('src/components/BroadcastStudio.tsx', 'utf8');

// Add import
if (!code.includes('GlobalClock')) {
  code = code.replace(
    "import { playSound } from '../utils/audio';",
    "import { playSound } from '../utils/audio';\nimport { GlobalClock } from './GlobalClock';"
  );
}

// Add it to the header of the Schedule form
code = code.replace(
  '<h4 className="font-bold text-accent">Schedule New Program</h4>',
  '<div className="flex items-center justify-between"><h4 className="font-bold text-accent">Schedule New Program</h4><GlobalClock /></div>'
);

fs.writeFileSync('src/components/BroadcastStudio.tsx', code);
