/*
  Pauly
  Andrew Mainella
  23 November 2023
  [...missing.tsx]
*/
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// takes the user back to the main page
export default function Missing() {
  if (Platform.OS === 'web') {
    const router = useRouter();
    useFocusEffect(() => {
      try {
        router.push('/');
      } catch (error) {}
    });
  }
  return <Redirect href={"/"}/>;
}
