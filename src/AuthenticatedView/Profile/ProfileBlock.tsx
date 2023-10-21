import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { revokeAsync, DiscoveryDocument, useAutoDiscovery } from 'expo-auth-session';
import React from 'react';
import { Text, Platform, Pressable } from 'react-native';
import store from '../../Redux/store';
import { authenticationTokenSlice } from '../../Redux/reducers/authenticationTokenReducer';
import { tenantId } from '../../PaulyConfig';
import { Colors } from '../../types';

export default function ProfileBlock() {
  const discovery = useAutoDiscovery(`https://login.microsoftonline.com/${tenantId}/v2.0`);
  const { instance } = useMsal();
  
  function signOut() {
    if (Platform.OS === "web") {
      const account = instance.getActiveAccount();
      if (account !== null) {
        signOutWeb(instance, account);
      } else {
        signOutWeb(instance);
      }
    } else {
      if (discovery !== null) {
        signOutNative(discovery);
      }
    }
  };

  return (
    <Pressable onPress={() => signOut()} style={{position: "absolute", bottom: 0, left:  0, backgroundColor: Colors.white, shadowColor: "black", shadowOffset: {width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 5, margin: 5, borderRadius: 15}}>
      <Text numberOfLines={1} style={{fontSize: 20, margin: 10}}>Sign Out</Text>
    </Pressable>
  )
}

function signOutNative(discovery: DiscoveryDocument) {
  revokeAsync({token: store.getState().authenticationToken}, discovery);
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""));
}

function signOutWeb(instance: IPublicClientApplication, account?: AccountInfo) {
  store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(""));
  instance.logoutPopup({
    account: account
  });
}