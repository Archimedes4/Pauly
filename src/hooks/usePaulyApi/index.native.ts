import { loadingStateEnum } from "@src/constants";
import store from "@src/redux/store";
import { refreshAsync, useAutoDiscovery } from "expo-auth-session";
import { useEffect, useState } from "react";

export default function usePaulyApi() {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}/v2.0`,
  );
  const [apiToken, setApiToken] = useState<usePaulyApiReturn>(loadingStateEnum.loading)
  async function loadApi() {
    if (discovery !== null){
      const apiResult = await refreshAsync(
        {
          refreshToken: store.getState().authenticationRefreshToken,
          clientId: process.env.EXPO_PUBLIC_CLIENTID
            ? process.env.EXPO_PUBLIC_CLIENTID
            : '',
          scopes: [
            `api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`,
          ],
        },
        discovery,
      );
      
      setApiToken(apiResult.accessToken)
    } else {
      setApiToken(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    loadApi()
  }, [])
  return apiToken
}