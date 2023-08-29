import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'react-router-native'

//Resources
// -> Sports
// -> Work/Volenteer Oportnities
// -> Schedule Annoucments
// -> School Events
// -> Annoucments

enum resourceMode {
  home,
  sports,
  workVolenteer,
  schedule,
  schoolEvents,
  annoucments,
  files
}

export default function Resources() {
  const [selectedResourceMode, setSelectedResourceMode] = useState<resourceMode>(resourceMode.home)
  return (
    <View>
        <Link to="/profile/">
            <Text>Back</Text>
        </Link>
      <Text>Resources</Text>
      <Text>Search</Text>
      <View>
        {

        }
      </View>
    </View>
  )
}