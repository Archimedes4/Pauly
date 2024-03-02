import { useMsal } from '@azure/msal-react';
import { loadingStateEnum } from '@src/constants';
import { useEffect, useState } from 'react';

export default function usePaulyApi() {
  const { instance } = useMsal();
  const [apiToken, setApiToken] = useState<usePaulyApiReturn>(
    loadingStateEnum.loading,
  );
  async function loadApi() {
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`],
    });
    setApiToken(apiResult.accessToken);
  }
  useEffect(() => {
    loadApi();
  }, []);
  return apiToken;
}
