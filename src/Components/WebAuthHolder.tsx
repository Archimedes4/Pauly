/*
  Pauly
  Andrew Mainella
  WebAuthHolder.tsx
  holder with the MsalProvider
*/
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { Slot } from "expo-router";
import { clientId, tenantId } from "../PaulyConfig";
import React from "react";
// This is for the microsoft authentication on web.
const pca = new PublicClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`,
    redirectUri: window.location.protocol + '//' + window.location.host
  },
});

export default function WebAuthHolder() {
  return (
    <MsalProvider instance={pca}>
      <Slot />
    </MsalProvider>
  )
}