import { View, Text } from 'react-native'
import React from 'react'
import { Link, useParams } from 'react-router-native'

export default function GovernmentSportTeamEdit() {
  const { sport, id } = useParams()
  return (
    <View>
      <Link to={"/profile/government/sports/team/" + sport + "/" + id}>
        <Text>Back</Text>
      </Link>
      <Text>Government Sport Team Edit</Text>
    </View>
  )
}