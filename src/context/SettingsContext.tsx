import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  ageRestrictedMode: boolean;
  setAgeRestrictedMode: (value: boolean) => void;
  safeMode: boolean;
  setSafeMode: (value: boolean) => void;
  curatedMode: boolean;
  setCuratedMode: (value: boolean) => void;
  appTheme: string;
  setAppTheme: (value: string) => void;
  userTier: number;
  setUserTier: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ageRestrictedMode, setAgeRestrictedMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_ageRestrictedMode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_ageRestrictedMode', JSON.stringify(ageRestrictedMode));
  }, [ageRestrictedMode]);

  const [safeMode, setSafeMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_safemode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_safemode', JSON.stringify(safeMode));
  }, [safeMode]);

  const [curatedMode, setCuratedMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_curatedmode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_curatedmode', JSON.stringify(curatedMode));
  }, [curatedMode]);

  const [appTheme, setAppTheme] = useState<string>(() => {
    try {
      const userHasExplicitlySetTheme = localStorage.getItem('nexus_theme_user_set');
      if (userHasExplicitlySetTheme) {
        return localStorage.getItem('nexus_appTheme') || 'frutiger';
      }
      return 'frutiger';
    } catch {
      return 'frutiger';
    }
  });
  
  useEffect(() => {
    localStorage.setItem('nexus_appTheme', appTheme);
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  const [userTier, setUserTier] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_userTier');
      return saved !== null ? Number(saved) : 3; // 3 implies high tier for local dev
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_userTier', String(userTier));
  }, [userTier]);

  return (
    <SettingsContext.Provider value={{
      ageRestrictedMode, setAgeRestrictedMode,
      safeMode, setSafeMode,
      curatedMode, setCuratedMode,
      appTheme, setAppTheme,
      userTier, setUserTier
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
