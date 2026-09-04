const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert the GlobalClock in the header, inside the second child of `justify-between`. 
// Actually, wait, let's just insert it right before the `{activeMedia ?` block and wrap the whole right side.
code = code.replace(
  "{/* PIP Video Preview */}",
  `<div className="flex flex-col items-end gap-4 z-50">\n          <GlobalClock />\n          {/* PIP Video Preview */}`
);
code = code.replace(
  /(\s*)\{activeMedia \? \([\s\S]*?<\/div>\n\s*\) : null\}/,
  (match, p1) => {
    return match + p1 + "</div>";
  }
);
fs.writeFileSync('src/App.tsx', code);
