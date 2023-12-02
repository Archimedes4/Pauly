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
    await silentLogin();
    if (store.getState().authenticationToken !== '') {
      const webResult = webSession()
      if (!webResult) {
        await getPaulyLists();
      }
      await getUserProfile();
      if (await getWantGovernment()) {
        await checkIfGovernmentMode();
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContent(); 
  }, [])

  return isLoading
}
