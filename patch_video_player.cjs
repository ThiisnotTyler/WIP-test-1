const fs = require('fs');
let code = fs.readFileSync('src/VideoPlayer.tsx', 'utf8');

code = code.replace(
  /if \(p !== undefined\) p\.catch\(e => console\.error\('Video play error:', e\)\);/,
  `if (p !== undefined) p.catch(e => { if (e.name !== 'AbortError') console.warn('Video play error:', e.message); });`
);

fs.writeFileSync('src/VideoPlayer.tsx', code);
