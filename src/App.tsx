import React, { useEffect } from 'react';
import { StateProvider, useStateContext } from './Store';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';

function AppLayout() {
  const { isCorporate } = useStateContext();
  
  useEffect(() => {
    if (isCorporate) {
      document.body.classList.add('corporate');
    } else {
      document.body.classList.remove('corporate');
    }
  }, [isCorporate]);

  return (
    <div className="relative z-10 max-w-[1480px] mx-auto p-4 md:px-5 pb-12">
      <Header />
      <Tabs />
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <AppLayout />
    </StateProvider>
  );
}


