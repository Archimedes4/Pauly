import store from '@redux/store';
import { loadingStateEnum } from '@constants';
import { refreshAsync, useAutoDiscovery } from 'expo-auth-session';

export default function useSyncCalendar() {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}/v2.0`,
  );
  async function main() {
    if (discovery !== null) {
      const apiResult = await refreshAsync(
        {
          refreshToken: store.getState().authenticationRefreshToken,
          clientId: process.env.EXPO_PUBLIC_CLIENTID
            ? process.env.EXPO_PUBLIC_CLIENTID
            : '',
          scopes: [`api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`],
        },
        discovery,
      );
      const result = await fetch(
        `${process.env.EXPO_PUBLIC_PAULY_FUNCTION_ENDPOINT}/api/orchestrators/snycCalendarOrchOrchestrator?code=${process.env.EXPO_PUBLIC_PAULY_FUNCTION_KEY}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiResult.accessToken}`,
          },
        },
      );
      if (result.ok) {
        return loadingStateEnum.success;
      }
      return loadingStateEnum.failed;
    }
    return loadingStateEnum.failed;
  }
  return main;
}
