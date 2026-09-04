const fs = require('fs');
let code = fs.readFileSync('src/components/TorrentPlayer.tsx', 'utf8');

code = code.replace(
  "import(/* @vite-ignore */ '/webtorrent.min.js')",
  "const scriptUrl = '/webtorrent.min.js';\n    import(/* @vite-ignore */ scriptUrl)"
);

fs.writeFileSync('src/components/TorrentPlayer.tsx', code);
