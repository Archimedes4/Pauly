import { ResultState, useMSAL } from '@archimedes4/expo-msal';
import { loadingStateEnum } from '@constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function usePaulyApi() {
  const { acquireTokenSilently } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: [`api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`],
    redirectUri: Platform.select({
      ios: 'msauth.expo.modules.msal.example://auth',
      android: 'msauth://expo.modules.msal.example',
      default: '',
    }),
  });
  const [apiToken, setApiToken] = useState<usePaulyApiReturn>(
    loadingStateEnum.loading,
  );
  async function loadApi() {
    const apiResult = await acquireTokenSilently();
    if (apiResult.result === ResultState.success) {
      console.log(apiResult.data)
      setApiToken(apiResult.data);
    } else {
      setApiToken(loadingStateEnum.failed)
    }
  }
  useEffect(() => {
    loadApi();
  }, []);
  return apiToken;
}
