import { Redirect, useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { LeaderboardBody } from '../leaderboard';

export default function Leaderboard() {
  const { id } = useGlobalSearchParams();

  if (typeof id === 'string') {
    return <LeaderboardBody commissionId={id} />;
  }

  return <Redirect href="/commissions" />;
}
