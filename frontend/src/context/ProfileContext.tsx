import React, { createContext, useContext, useState, useEffect } from 'react';
import { CandidateProfile, DifficultyLevel, ExperienceBand, LanguagePreference, PreparationGoal, TargetRole } from '../types';
import { INITIAL_DEMO_PROFILE } from '../data/seedData';

interface ProfileContextType {
  profile: CandidateProfile;
  isOnboarded: boolean;
  updateProfile: (updated: Partial<CandidateProfile>) => void;
  completeOnboarding: (data: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  resetProfile: () => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY_PROFILE = 'devpath_candidate_profile';
const STORAGE_KEY_ONBOARDED = 'devpath_is_onboarded';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return INITIAL_DEMO_PROFILE;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ONBOARDED);
    return saved !== null ? saved === 'true' : true; // Default true so demo is accessible right away
  });

  const [isDemoMode, setDemoMode] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ONBOARDED, String(isOnboarded));
  }, [isOnboarded]);

  const updateProfile = (updated: Partial<CandidateProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const completeOnboarding = (data: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: CandidateProfile = {
      ...data,
      id: `candidate-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    setIsOnboarded(true);
  };

  const resetProfile = () => {
    setProfile(INITIAL_DEMO_PROFILE);
    setIsOnboarded(false);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isOnboarded,
        updateProfile,
        completeOnboarding,
        resetProfile,
        isDemoMode,
        setDemoMode,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};
