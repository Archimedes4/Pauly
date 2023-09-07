import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'react-router-native'

//Resources
// -> Sports
// -> Advancement Board
// -> Schedule Annoucments
// -> School Events
// -> Annoucments

enum resourceMode {
  home,
  sports,
  advancement,
  schedule,
  schoolEvents,
  annoucments,
  fitness,
  files
}

export default function Resources() {
  const [selectedResourceMode, setSelectedResourceMode] = useState<resourceMode>(resourceMode.home)
  async function getResources() {
  }
  return (
    <View>
      <Link to="/profile/">
        <Text>Back</Text>
      </Link>
      <Text>Resources</Text>
      <View>
        
      </View>
      <Text>Search</Text>
      <View>
        {

        }
      </View>
    </View>
  )
}