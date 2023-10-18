import { microsoftProfileDataSlice } from "../../Redux/reducers/microsoftProfileDataReducer"
import store from "../../Redux/store"
import callMsGraph from "./microsoftAssets"

export default async function getUserProfile(accessToken: string) {
  const result = await callMsGraph("https://graph.microsoft.com/v1.0/me/photo/$value", "GET")
  //TO DO return error
  if (result.ok) {
    const dataBlob = await result.blob()
    const urlOut = URL.createObjectURL(dataBlob)
    const profileResult = await callMsGraph("https://graph.microsoft.com/v1.0/me", "GET")
    if (profileResult.ok){
      const profileData = await profileResult.json()
      store.dispatch(microsoftProfileDataSlice.actions.setMicrosoftProfileData({uri: urlOut, displayName: profileData["displayName"], id: profileData["id"]}))
    }
  } else {
    const profileResult = await callMsGraph("https://graph.microsoft.com/v1.0/me", "GET")
    if (profileResult.ok){
      const profileData = await profileResult.json()
      store.dispatch(microsoftProfileDataSlice.actions.setMicrosoftProfileData({uri: "", displayName: profileData["displayName"], id: profileData["id"]}))
    }
  }
}