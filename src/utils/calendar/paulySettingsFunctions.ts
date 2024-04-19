import { StoreType } from "@redux/store";
import callMsGraph from "../ultility/microsoftAssests/noStore";
import { calendarViewingMode, loadingStateEnum } from "@constants";

export async function getPaulySettingsApi(store: StoreType): Promise<{
  result: loadingStateEnum.failed
} | {
  result: loadingStateEnum.success,
  data: paulySettingsType
}> {
  try {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/me/extensions/com.Archimedes4.paulySetting", store)
    if (result.ok) {
      const data = await result.json()
      const calendarViewingModeSetting: calendarViewingMode = parseInt(data["calendarViewingMode"])
      return {result: loadingStateEnum.success, data: {
        calendarViewingMode: calendarViewingModeSetting,
      }}
    }
    if (result.status === 404) {
      const createResult = await setCalendarSetting(store, calendarViewingMode.collapsedRemoved, true)
      if (createResult.result === loadingStateEnum.success) {
        return {result: loadingStateEnum.success, data: {
          calendarViewingMode: calendarViewingMode.collapsedRemoved,
        }}
      } else {
        return {result: loadingStateEnum.failed}
      }
    }
    return {result: loadingStateEnum.failed}
  } catch {
    return {result: loadingStateEnum.failed}
  }
}

export async function setCalendarSetting(store: StoreType, state: calendarViewingMode, create: boolean, abort?: AbortController): Promise<{result: loadingStateEnum.failed}|{result: loadingStateEnum.success}> {
  let requestData = {
    "@odata.type":"microsoft.graph.openTypeExtension",
    "extensionName":"com.Archimedes4.paulySetting",
    "calendarViewingMode":state,
  }
  if (create) {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/me/extensions", store, "POST", JSON.stringify(requestData), undefined, undefined, abort)
    if (result.ok) {
      return {result: loadingStateEnum.success}
    }
    return {result: loadingStateEnum.failed}
  }
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/me/extensions/com.Archimedes4.paulySetting", store, "PATCH", JSON.stringify(requestData), undefined, undefined, abort)
  if (result.ok) {
    return {result: loadingStateEnum.success}
  }
  return {result: loadingStateEnum.failed}
}