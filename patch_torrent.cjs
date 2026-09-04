const fs = require('fs');
let code = fs.readFileSync('src/components/TorrentPlayer.tsx', 'utf8');

code = code.replace(
  `    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.WebTorrent) {
          resolve(window.WebTorrent);
          return;
        }
        const script = document.createElement('script');
        script.src = '/webtorrent.min.js';
        script.async = true;
        script.onload = () => resolve(window.WebTorrent);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadScript()
      .then((WebTorrentConstructor: any) => {`,
  `    import(/* @vite-ignore */ '/webtorrent.min.js')
      .then((module) => {
        const WebTorrentConstructor = module.default;`
);

code = code.replace(
`declare global {
  interface Window {
    WebTorrent: any;
  }
}`,
""
);

fs.writeFileSync('src/components/TorrentPlayer.tsx', code);
