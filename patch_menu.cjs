const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = "<MenuOption \n                    label=\"Broadcast Studio\"";
const newOption = `<MenuOption 
                    label="P2P Network" 
                    icon={Network} 
                    onClick={() => setCurrentView('P2P')} 
                  />
                  <MenuOption 
                    label="Broadcast Studio"`;

code = code.replace(target, newOption);
fs.writeFileSync('src/App.tsx', code);
