const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove GlobalClock from top header
code = code.replace(
  '<div className="flex flex-col items-end gap-4 z-50">\n          <GlobalClock />',
  '<div className="flex flex-col items-end gap-4 z-50">'
);

// Replace footer content
const oldFooterRegex = /\{\/\* Bottom info bar \*\/\}[\s\S]*?<\/footer>/;
const newFooter = `{/* Bottom info bar */}
      <footer className="px-8 py-3 bg-panel border-t border-panel-border shrink-0 flex justify-end items-center backdrop-blur-md">
        <GlobalClock />
      </footer>`;
code = code.replace(oldFooterRegex, newFooter);

fs.writeFileSync('src/App.tsx', code);
