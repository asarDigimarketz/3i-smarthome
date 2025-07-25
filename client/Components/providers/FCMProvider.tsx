'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFCM } from '../../hooks/useFCM';

interface FCMContextType {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initializeFCM: () => Promise<void>;
}

const FCMContext = createContext<FCMContextType | undefined>(undefined);

export const useFCMContext = () => {
  const context = useContext(FCMContext);
  if (context === undefined) {
    throw new Error('useFCMContext must be used within a FCMProvider');
  }
  return context;
};

interface FCMProviderProps {
  children: React.ReactNode;
}

export const FCMProvider = ({ children }: FCMProviderProps) => {
  const { data: session } = useSession();
  
  const { token, isLoading, error, initializeFCM } = useFCM();

  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Firebase service worker registered:', registration);
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err);
        });
    }
  }, []);

  const value = {
    token,
    isLoading,
    error,
    initializeFCM,
  };

  return <FCMContext.Provider value={value}>{children}</FCMContext.Provider>;
}; 