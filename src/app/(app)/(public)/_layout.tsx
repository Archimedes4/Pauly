/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React from 'react';
import { Text, Platform } from 'react-native';
import { Slot, useFocusEffect, useRouter } from 'expo-router';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import { SignInComponent } from './sign-in';

function PushToMain() {
  const router = useRouter();
  useFocusEffect(() => {
    try {
      router.push('/');
    } catch (error) {}
  });
  return null;
}

export default function Main() {
  const isAuthenticated = useIsAuthenticated();
  if (isAuthenticated.authenticated) {
    return <PushToMain />;
  }

  if (!isAuthenticated.loading && Platform.OS !== 'web') {
    return <Slot />;
  }

  if (!isAuthenticated.loading) {
    return <SignInComponent government={false} />;
  }

  return <Text>Loading</Text>;
}
