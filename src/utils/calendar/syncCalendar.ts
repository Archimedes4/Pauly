import { loadingStateEnum } from "@constants";

export default async function syncCalendar(token: string) {
  const result = await fetch(
    `${process.env.EXPO_PUBLIC_PAULY_FUNCTION_ENDPOINT}/api/orchestrators/snycCalendarOrchOrchestrator?code=${process.env.EXPO_PUBLIC_PAULY_FUNCTION_KEY}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (result.ok) {
    return loadingStateEnum.success;
  }
  return loadingStateEnum.failed;
}