import React, { useState } from 'react';
import { RoadmapView } from '../components/roadmap/RoadmapView';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';

export const RoadmapPage: React.FC = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <>
      <RoadmapView onOpenOnboarding={() => setOnboardingOpen(true)} />
      <OnboardingModal isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </>
  );
};
