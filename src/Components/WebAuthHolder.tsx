/*
  Pauly
  Andrew Mainella
  WebAuthHolder.tsx
  holder with the MsalProvider
*/
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { Slot } from "expo-router";
import { clientId, tenantId } from "@/PaulyConfig";
import React from "react";
console.log(window.location.protocol + '//' + window.location.host)
//stop redirect error
function getRedirectUri() {
  if (typeof window !== "undefined") { //checking if window is undefined as it is in node
    return (window.location.protocol + '//' + window.location.host)
  }
  return ''
}

// This is for the microsoft authentication on web.
const pca = new PublicClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`,
    redirectUri: getRedirectUri()//to stop node js error
  },
});

export default function WebAuthHolder() {
  return (
    <MsalProvider instance={pca}>
      <Slot />
    </MsalProvider>
  )
}