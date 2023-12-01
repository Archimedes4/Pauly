import RootLayout from "@components/RootLayout";
import React, { useEffect, useState } from "react";

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