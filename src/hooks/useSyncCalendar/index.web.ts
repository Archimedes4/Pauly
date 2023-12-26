import { useMsal } from '@azure/msal-react';
import { clientId } from '@src/PaulyConfig';
import { loadingStateEnum } from '@constants';

export default function useSyncCalendar() {
  const { instance } = useMsal();
  async function main() {
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${clientId}/api/commissions`],
    });
    // TODO change to production url
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
  return main;
}
