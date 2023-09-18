import { View, Text, Button } from 'react-native'
import React from 'react'
import { Link } from 'react-router-native'
import { useMsal } from "@azure/msal-react";
import { tenantId } from '../../PaulyConfig';

export default function Settings() {
  return (
    <View>
        <Link to="/profile/">
          <Text>Back</Text>
        </Link>
      <Text>Settings</Text>
      <Button title='Logout' onPress={() => {
        fetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/logout?post_logout_redirect_uri=http://localhost:19006")
      }}></Button>
    </View>
  )
}