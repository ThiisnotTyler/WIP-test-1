const fs = require('fs');
let code = fs.readFileSync('src/components/ChannelGuide.tsx', 'utf8');

const target = `  useEffect(() => {
    const slots = [];
    const now = new Date();
    // round down to nearest 30 mins
    const minutes = now.getMinutes() >= 30 ? 30 : 0;
    now.setMinutes(minutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
        
    // Generate 6 slots (3 hours)
    for (let i = 0; i < 12; i++) {
      const slotTime = new Date(now.getTime() + i * 30 * 60000);
      slots.push(slotTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    }
    setTimeSlots(slots);
  }, []);`;

const replacement = `  useEffect(() => {
    const slots = [];
    const now = new Date();
    // round down to nearest 30 mins
    const minutes = now.getUTCMinutes() >= 30 ? 30 : 0;
    now.setUTCMinutes(minutes);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);
        
    // Generate 6 slots (3 hours)
    for (let i = 0; i < 12; i++) {
      const slotTime = new Date(now.getTime() + i * 30 * 60000);
      slots.push(slotTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) + ' UTC');
    }
    setTimeSlots(slots);
  }, []);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/ChannelGuide.tsx', code);
