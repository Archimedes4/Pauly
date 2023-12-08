/*
  Pauly
  Andrew Mainella
  1 December 2023
  _layout.tsx
*/
import RootLayout from "@components/RootLayout";
import React, { useEffect, useState } from "react";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: '(app)/(root)/home',
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return (
    <RootLayout />
  ) 
}