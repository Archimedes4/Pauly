import getPaulyLists from "@/Functions/ultility/getPaulyLists";
import getUserProfile from "@/Functions/ultility/getUserProfile";
import { useSession } from "@/Functions/ultility/getWebSession.web";
import store from "@/Redux/store";
import { useSilentLogin } from "./authentication";
import { checkIfGovernmentMode, getWantGovernment } from "@/Functions/handleGovernmentLogin";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";

export default function main() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const silentLogin = useSilentLogin();
  const getSession = useSession();
  const pathname = usePathname();

  //main function
  async function loadContent() {
    await silentLogin();
    if (store.getState().authenticationToken !== '') {
      await getSession();
      await getPaulyLists();
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
  console.log(isLoading)
  return isLoading
}
