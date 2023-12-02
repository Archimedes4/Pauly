import getPaulyLists from "@src/Functions/ultility/getPaulyLists";
import useGetUserProfile from "@src/hooks/useGetUserProfile";
import useWebSession from "@hooks/useWebSession";
import store from "@Redux/store";
import { useSilentLogin } from "./authentication";
import { checkIfGovernmentMode, getWantGovernment } from "@Functions/handleGovernmentLogin";
import { useEffect, useState } from "react";

export default function useAuthentication() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const silentLogin = useSilentLogin();
  const webSession = useWebSession();
  const getUserProfile = useGetUserProfile();
  //main function
  async function loadContent() {
    console.log("MARK USE AUTH HOOK THREE")
    await silentLogin();
    console.log("MARK USE AUTH HOOK FOUR")
    if (store.getState().authenticationToken !== '') {
      console.log("MARK USE AUTH HOOK FIVE")
      const webResult = webSession()
      console.log("MARK USE AUTH HOOK SIX")
      if (!webResult) {
        await getPaulyLists();
      }
      console.log("MARK USE AUTH HOOK SEVEN")
      await getUserProfile();
      if (await getWantGovernment()) {
        await checkIfGovernmentMode();
      }
      console.log("MARK USE AUTH HOOK EIGHT")
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log("MARK USE AUTH HOOK NINE")
    loadContent(); 
  }, [])

  return isLoading
}
