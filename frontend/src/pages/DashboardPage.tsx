import React, { useState } from 'react';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';

export const DashboardPage: React.FC = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <>
      <DashboardOverview onOpenOnboarding={() => setOnboardingOpen(true)} />
      <OnboardingModal isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </>
  );
};
