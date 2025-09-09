'use client';

import { Suspense } from 'react';
import { ChatInterface } from '@/components/chat-interface';
import { InstallPrompt } from '@/components/InstallPrompt';
import { CookieToast } from '@/components/cookie-toast';

const Home = () => {
  return (
    <Suspense>
      <ChatInterface />
      <InstallPrompt />
      <CookieToast />
    </Suspense>
  );
};

export default Home;
