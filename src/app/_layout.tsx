/*
  Pauly
  Andrew Mainella
  1 December 2023
  _layout.tsx
*/
import RootLayout from '@components/RootLayout';
import React, { useEffect, useState } from 'react';
import Head from 'expo-router/head';

export default function App(): React.JSX.Element | null {
  // Fixing hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Pauly</title>
      </Head>
      <RootLayout />
    </>
  );
}
