'use client';

import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import MedicalAIChat from '@/components/MedicalAIChat';

export default function Page() {
  const [showChat, setShowChat] = useState(false);

  if (!showChat) {
    return <LandingPage onGetStarted={() => setShowChat(true)} />;
  }

  return <MedicalAIChat />;
}
