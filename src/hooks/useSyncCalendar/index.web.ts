import { useMsal } from '@azure/msal-react';
import { loadingStateEnum } from '@constants';

export default function useSyncCalendar() {
  const { instance } = useMsal();
  async function main() {
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`],
    });
    // TODO change to production url
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
  return main;
}
