import { View, Text, Button } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'
import { useMsal } from "@azure/msal-react";

export default function Settings() {
  return (
    <View>
        <Link to="/profile/">
            <Text>Back</Text>
        </Link>
      <Text>Settings</Text>
      
      <Button title='Logout' onPress={() => {
        // instance.logoutPopup({
        //   mainWindowRedirectUri: '/', // redirects the top level app after logout
      }}></Button>
    </View>
  )
}