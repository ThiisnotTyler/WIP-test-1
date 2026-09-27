import { useState, useEffect } from 'react';

export interface StudioProgram {
  id: string;
  title: string;
  desc?: string;
  url: string;
  dur: number;
  startTime: string;
  day: number;
  preRollAd?: string;
  postRollAd?: string;
  isVideo?: boolean;
}

export interface StudioFeed {
  id: string;
  title: string;
  category: string;
  url: string;
  desc?: string;
  viewers: string;
  ping: string;
  isVideo?: boolean;
}

export interface StudioMagnet {
  id: string;
  title: string;
  magnet: string;
  desc?: string;
}

export function useStudioStorage() {
  const [channelName, setChannelName] = useState('My Custom Channel');
  const [channelNumber, setChannelNumber] = useState('99');
  const [programs, setPrograms] = useState<StudioProgram[]>([]);
  const [feeds, setFeeds] = useState<StudioFeed[]>([]);
  const [p2pMagnets, setP2pMagnets] = useState<StudioMagnet[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_custom_channel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setChannelName(parsed.name);
        if (parsed.number) setChannelNumber(parsed.number);
        if (parsed.programs) setPrograms(parsed.programs);
      } catch (e) {}
    }
    
    const savedFeeds = localStorage.getItem('nexus_custom_feeds');
    if (savedFeeds) {
      try {
        setFeeds(JSON.parse(savedFeeds));
      } catch (e) {}
    }

    const savedMagnets = localStorage.getItem('nexus_custom_p2p');
    if (savedMagnets) {
      try {
        setP2pMagnets(JSON.parse(savedMagnets));
      } catch (e) {}
    }
  }, []);

  const saveCustomChannel = () => {
    const customChannel = {
      id: 'custom_ch',
      name: channelName,
      number: channelNumber,
      programs: programs
    };
    localStorage.setItem('nexus_custom_channel', JSON.stringify(customChannel));
  };

  const updateFeeds = (newFeeds: StudioFeed[]) => {
    setFeeds(newFeeds);
    localStorage.setItem('nexus_custom_feeds', JSON.stringify(newFeeds));
  };

  const updateMagnets = (newMagnets: StudioMagnet[]) => {
    setP2pMagnets(newMagnets);
    localStorage.setItem('nexus_custom_p2p', JSON.stringify(newMagnets));
  };

  return {
    channelName,
    setChannelName,
    channelNumber,
    setChannelNumber,
    programs,
    setPrograms,
    feeds,
    setFeeds,
    p2pMagnets,
    setP2pMagnets,
    saveCustomChannel,
    updateFeeds,
    updateMagnets
  };
}
