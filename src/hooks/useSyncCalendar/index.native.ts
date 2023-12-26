import { clientId, tenantId } from '@src/PaulyConfig';
import store from '@redux/store';
import { loadingStateEnum } from '@constants';
import { refreshAsync, useAutoDiscovery } from 'expo-auth-session';

export default function useSyncCalendar() {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  async function main() {
    if (discovery !== null) {
      const apiResult = await refreshAsync(
        {
          refreshToken: store.getState().authenticationRefreshToken,
          clientId,
          scopes: [`api://${clientId}/api/commissions`],
        },
        discovery,
      );
      const result = await fetch(
        'http://localhost:8500/api/orchestrators/snycCalendarOrchOrchestrator',
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
