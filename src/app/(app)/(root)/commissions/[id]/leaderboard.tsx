import { Redirect, useGlobalSearchParams } from "expo-router";
import { LeaderboardBody } from "../leaderboard";
import React from "react";
import { View, Text } from "react-native";

export default function Leaderboard() {
  const {id} = useGlobalSearchParams()

  if (typeof id === 'string') {
    return (
      <LeaderboardBody commissionId={id}/>
    )
  }

  return <Redirect href={'/commissions'}/>
}