const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes('P2PView')) {
  code = code.replace(
    "import { SettingsView } from './components/SettingsView';",
    "import { SettingsView } from './components/SettingsView';\nimport { P2PView } from './components/P2PView';"
  );
}

// Add state type
code = code.replace(
  "| 'SETTINGS' | 'STUDIO'>('MENU')",
  "| 'SETTINGS' | 'STUDIO' | 'P2P'>('MENU')"
);

// Add menu option
if (!code.includes('P2P Network')) {
  const menuOptionTarget = "{userTier > 1 && !ageRestrictedMode && (\n                <MenuOption \n                  label=\"Broadcast Studio\"";
  const newMenuOption = `{userTier > 1 && !ageRestrictedMode && (
                <MenuOption 
                  label="P2P Network" 
                  icon={Network} 
                  active={currentView === 'P2P'} 
                  onClick={() => { playSound('select'); setCurrentView('P2P'); }} 
                />
              )}
              ${menuOptionTarget}`;
              
  code = code.replace(menuOptionTarget, newMenuOption);
  
  // also need to import Network if not imported, though it might be in mockData. 
  // Let's just import it from lucide-react in App.tsx
  if (!code.includes('Network,')) {
    code = code.replace(
      "import { Tv, Activity, Radio,",
      "import { Tv, Activity, Radio, Network,"
    );
  }
}

// Add View renderer
if (!code.includes('<P2PView')) {
  const viewTarget = "{currentView === 'SETTINGS' && (";
  const newView = `{currentView === 'P2P' && (
          <P2PView onBack={() => setCurrentView('MENU')} />
        )}
        ${viewTarget}`;
  code = code.replace(viewTarget, newView);
}

fs.writeFileSync('src/App.tsx', code);
