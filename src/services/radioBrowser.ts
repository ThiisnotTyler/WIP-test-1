let cachedServer: string | null = null;

// Hardcoded fallback list in case the DNS API fails or is blocked
const FALLBACK_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://fr1.api.radio-browser.info'
];

export const getRadioServer = async (): Promise<string> => {
  if (cachedServer) return cachedServer;
  
  try {
    const res = await fetch('https://all.api.radio-browser.info/json/servers');
    if (res.ok) {
      const servers = await res.json();
      if (servers && servers.length > 0) {
        // Pick a random server
        const server = servers[Math.floor(Math.random() * servers.length)].name;
        cachedServer = `https://${server}`;
        return cachedServer;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch radio servers list, using fallback', e);
  }
  
  // Pick random fallback
  cachedServer = FALLBACK_SERVERS[Math.floor(Math.random() * FALLBACK_SERVERS.length)];
  return cachedServer;
};
