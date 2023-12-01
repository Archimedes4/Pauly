import { useMsal } from "@azure/msal-react";
import { paulyListSlice } from "../../Redux/reducers/paulyListReducer"
import store from "../../Redux/store"
import { useEffect } from "react";

export function useWebSession() {
  function main() {
    const stringListItem = window && window.sessionStorage && sessionStorage.getItem('listStore')
    if (stringListItem !== null) {
      try {
        const parsedListItem: paulyListType = JSON.parse(stringListItem);
        store.dispatch(paulyListSlice.actions.setPaulyList(parsedListItem))
      } catch {
        //return nothing just don't fail
      }
    }
  }
  useEffect(() => {
    main();
  }, [])
  return;
}