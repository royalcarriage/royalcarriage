import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DensityMode = 'comfortable' | 'compact';

interface DensityContextType {
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

const STORAGE_KEY = 'admin_density_mode';

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<DensityMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'compact' || stored === 'comfortable') ? stored : 'comfortable';
  });

  const setDensity = (mode: DensityMode) => {
    setDensityState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const toggleDensity = () => {
    setDensity(density === 'comfortable' ? 'compact' : 'comfortable');
  };

  useEffect(() => {
    // Apply density class to root
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
